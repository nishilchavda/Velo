const mongoose = require("mongoose");

const movementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    destination: {
      name: {
        type: String,
        required: true,
      },
      coordinates: {
        type: { 
          type: String, 
          enum: ["Point"], 
          required: true,
          default: "Point"
        },
        coordinates: {
          type: [Number],
          required: true,
        },
      },
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    vibeTags: [{ type: String }],
    imageUrl: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
      required: true,
    },
  },
  { timestamps: true }
);

// This index is what makes the "Velo" matching engine super fast
movementSchema.index({ "destination.coordinates": "2dsphere" });

module.exports = mongoose.model("Movement", movementSchema);