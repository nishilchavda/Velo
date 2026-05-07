const movementService = require("../Services/movement.service");

// create movement
module.exports.createMovement = async (req, res) => {
  const {
    destinationName,
    longitude,
    latitude,
    startDate,
    endDate,
    vibeTags,
    imageUrl,
    status,
  } = req.body;
  const userId = req.userId;
  try {
    const mov = await movementService.createMovement({
      userId,
      destinationName,
      longitude,
      latitude,
      startDate,
      endDate,
      vibeTags,
      imageUrl,
      status,
    });
    return res
      .status(201)
      .json({ message: "Movement created successfully", mov });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// edit movement
module.exports.updateMovement = async (req, res) => {
    const { movementId } = req.params;
    const userId = req.userId;
    const {
        destinationName,
        longitude,
        latitude,
        startDate,
        endDate,
        vibeTags,
        imageUrl,
        status,
    } = req.body;
    try {
        const mov = await movementService.updateMovement({
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
        });
        return res
            .status(200)
            .json({ message: "Movement updated successfully", mov });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// delete movement
module.exports.deleteMovement = async (req, res) => {
    const { movementId } = req.params;
    const userId = req.userId;
    try {
        const mov = await movementService.deleteMovement({
            movementId,
            userId,
        });
        return res
            .status(200)
            .json({ message: "Movement deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// get movement
module.exports.getMovement = async (req, res) => {
    const { movementId } = req.params;
    try {
        const mov = await movementService.getMovement({ movementId });
        return res
            .status(200)
            .json({ message: "Movement fetched successfully", mov });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// get all movements
module.exports.getAllMovements = async (req, res) => {
    const userId = req.userId;
    try {
        const mov = await movementService.getAllMovements({ userId });
        return res
            .status(200)
            .json({ message: "Movements fetched successfully", mov });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// get global movements
module.exports.getGlobalMovements = async (req, res) => {
  const userId = req.userId;
  try {
    const movs = await movementService.getGlobalMovements({ userId });
    return res.status(200).json({
      success: true,
      movs
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// get matches
module.exports.getMatches = async (req, res) => {
  const { movementId } = req.params;
  const userId = req.userId;

  try {
    const buddies = await movementService.getMatchFeed(movementId, userId);

    return res.status(200).json({
      success: true,
      count: buddies.length,
      data: buddies
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports.getUserMovements = async (req, res) => {
    const { userId } = req.params;
    try {
        const mov = await movementService.getAllMovements({ userId });
        return res
            .status(200)
            .json({ message: "Movements fetched successfully", mov });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};