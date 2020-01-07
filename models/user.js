"use strict";

const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    },
    artistName: {
      type: String,
      trim: true
    },
    username: {
      type: String,
      // required: true,
      // unique: true,
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      // required: true,
      // unique: true,
      trim: true
    },
    passwordHash: {
      type: String
      //required: true
    },
    passRecoveryQuestion: {
      type: String
      // required: true
    },
    description: {
      type: String,
      maxlength: 200,
      default: "Would you like to know more about me? Contact me!"
    },
    role: {
      type: String,
      //required: true,
      enum: ["artist", "user", "admin"]
    },
    genres: [
      {
        type: String,
        enum: ["indie", "rock", "pop", "rap", "hip-pop", "metal", "fado"],
        default: ["indie", "rock", "pop", "rap", "hip-pop", "metal", "fado"]
      }
    ],
    artistAlbums: {
      type: String,
      default: "This artist has no albums yet"
    },
    bandAverageRate: { type: String, default: "Be the first to rate!" },
    bandUsersRate: [
      {
        id: {
          type: mongoose.Types.ObjectId
        },
        rate: {
          type: Number
        }
      }
    ],
    bandWebsite: String,
    images: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Image"
      }
    ],
    spotify_id: String,
    spotify_access_token: String,
    spotify_refresh_token: String,
    status: {
      type: String,
      enum: ["Pending Confirmation", "Active"],
      default: "Pending Confirmation"
    },
    confirmationCode: {
      type: String,
      unique: true
    }
  },
  {
    timestamps: {
      createdAt: "creationDate",
      updatedAt: "updateDate"
    }
  }
);

module.exports = mongoose.model("User", schema);
