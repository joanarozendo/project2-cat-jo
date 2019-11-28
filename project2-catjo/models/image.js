const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true
    }
  },
  {
    timestamps: {
      createdAt: "creationDate",
      updatedAt: "updateDate"
    },
    toObject: {
      virtuals: true
    },
    toJSON: {
      virtuals: true
    }
  }
);

const cloudinary = require("cloudinary");

imageSchema.virtual("resizedUrl").get(function() {
  const images = this;
  const url = images.url;
  const path = url.replace(/[\w\/.:]+upload\//i, "");
  // console.log(path);
  const resizedUrl = cloudinary.url(path, { width: 150, height: 150 });
  return resizedUrl;
});

const Image = mongoose.model("Image", imageSchema);

module.exports = Image;