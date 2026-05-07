const movement = require("../Models/movement.model");

// create movement
module.exports.createMovement = async ({
  userId,
  destinationName,
  longitude,
  latitude,
  startDate,
  endDate,
  vibeTags,
  imageUrl,
  status,
}) => {
  const existingMovement = await movement.findOne({
    userId: userId,
    status: "active",
    $or: [
      { startDate: { $lte: startDate }, endDate: { $gte: startDate } },
      { startDate: { $lte: endDate }, endDate: { $gte: endDate } },
      { startDate: { $gte: startDate }, endDate: { $lte: endDate } },
    ],
  });

  if (existingMovement) {
    throw new Error(
      `Conflict: You already have a trip planned for ${existingMovement.destination.name} during this time.`,
    );
  }

  if (
    !userId ||
    !destinationName ||
    !longitude ||
    !latitude ||
    !startDate ||
    !endDate
  ) {
    throw new Error("All fields are required");
  }

  const mov = await movement.create({
    userId,
    destination: {
      name: destinationName,
      coordinates: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    },
    startDate,
    endDate,
    vibeTags: vibeTags || [],
    imageUrl: imageUrl || "",
    status: status || "active",
  });

  return mov;
};

// edit movement
module.exports.updateMovement = async ({
  userId,
  movementId,
  destinationName,
  longitude,
  latitude,
  startDate,
  endDate,
  vibeTags,
  imageUrl,
  status,
}) => {
  try {
    const updateFields = {};

    if (startDate) updateFields.startDate = startDate;
    if (endDate) updateFields.endDate = endDate;
    if (vibeTags) updateFields.vibeTags = vibeTags;
    if (imageUrl) updateFields.imageUrl = imageUrl;
    if (status) updateFields.status = status;
    
    if (destinationName || (longitude && latitude)){
        if (destinationName) updateFields["destination.name"] = destinationName;
        if (longitude && latitude) {
            updateFields["destination.coordinates"] = {
                type: "Point",
                coordinates: [longitude, latitude],
            };
        }
    }

    const mov = await movement.findOneAndUpdate({_id:movementId, userId: userId},
        {$set: updateFields},
        {returnDocument: 'after', runValidators: true}
    )
    if(!mov){
      throw new Error("Movement not found");
    }
    return mov;
  } catch (error) {
    throw new Error(error.message);
  }
};

// delete movement
module.exports.deleteMovement = async ({ movementId }) => {
  try {
    const mov = await movement.findByIdAndDelete(movementId);
    return mov;
  } catch (error) {
    throw error;
  }
};

// get movement
module.exports.getMovement = async ({ movementId }) => {
  try {
    const mov = await movement.findById(movementId);
    return mov;
  } catch (error) {
    throw error;
  }
};

// get all movements
module.exports.getAllMovements = async ({userId}) => {
  try {
    const mov = await movement.find({userId: userId}).populate("userId", "username fullname email profileImage bio tags");
    return mov || [];
  } catch (error) {
    throw error;
  }
};

// get global movements (for Explore page)
module.exports.getGlobalMovements = async ({ userId }) => {
  try {
    // Find all active movements NOT belonging to current user
    const movs = await movement.find({ 
      userId: { $ne: userId },
      status: "active" 
    }).populate("userId", "username fullname email profileImage bio tags");
    
    return movs || [];
  } catch (error) {
    throw error;
  }
};

// get matching movements
module.exports.getMatchFeed = async (movementId, userId) => {
  try {
    const userTrip = await movement.findOne({ _id: movementId, userId: userId });
    if (!userTrip) throw new Error("Movement not found");

    const potentialMatches = await movement.find({
      _id: { $ne: movementId },
      userId: { $ne: userId },
      status: "active",
      "destination.name": userTrip.destination.name,
      startDate: { $lte: userTrip.endDate }, 
      endDate: { $gte: userTrip.startDate }
    })
    .populate("userId", "username fullname email profileImage tags vibeTags bio") 
    .lean(); 

    const scoredMatches = potentialMatches.map(match => {
      const commonTags = match.vibeTags.filter(tag => 
        userTrip.vibeTags.includes(tag)
      );
      
      const score = userTrip.vibeTags.length > 0 
        ? Math.round((commonTags.length / userTrip.vibeTags.length) * 100) 
        : 0;

      return {
        ...match,
        compatibilityScore: score,
        commonVibes: commonTags
      };
    });

    return scoredMatches.sort((a, b) => b.compatibilityScore - a.compatibilityScore || a.startDate - b.startDate);

  } catch (error) {
    throw new Error(error.message); 
  }
};