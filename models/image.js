const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      default: 'https://t3.ftcdn.net/jpg/00/64/67/80/240_F_64678017_zUpiZFjj04cnLri7oADnyMH0XBYyQghG.jpg'
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
  // const resizedUrlHorRect = cloudinary.url(path, { width: 200, height: 150 });
  // const resizedUrlVertRect = cloudinary.url(path, { width: 150, height: 200 });
  return resizedUrl/* , resizedUrlHorRect, resizedUrlVertRect */;
});

const Image = mongoose.model("Image", imageSchema);

module.exports = Image;