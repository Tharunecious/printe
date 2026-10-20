const mongoose = require("mongoose");

const photoBookLayoutSchema = new mongoose.Schema(
  {
    layout_id: { type: String, required: true, unique: true, trim: true },
    layout_name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["1-photo", "2-photo", "3-photo", "4-photo", "grid", "collage", "mixed"],
      default: "1-photo",
    },
    photo_count: { type: Number, default: 1 },
    supported_sizes: {
      type: [String],
      default: ["8x8", "10x10", "12x12"],
    },
    thumbnail_url: { type: String, default: "" },
    page_types: {
      type: [String],
      default: ["interior", "front_cover", "back_cover"],
    },
    frames: [
      {
        id: { type: String, required: true },
        shape: { type: String, default: "rectangle" },
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
        rotation: { type: Number, default: 0 },
        fit_mode: { type: String, default: "cover" },
        border: {
          width: { type: Number, default: 0 },
          color: { type: String, default: "#ffffff" },
          radius: { type: Number, default: 0 },
        },
      },
    ],
    is_system_preset: { type: Boolean, default: false },
  },
  {
    collection: "photobook_layouts",
    timestamps: true,
  }
);

module.exports = mongoose.model("photobook_layout", photoBookLayoutSchema);
