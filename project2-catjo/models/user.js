"use strict";

const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  firstName: {
    type: String,
    // required: true,
    trim: true
  },
  lastName: {
    type: String,
    // required: true,
    trim: true
  },
  artistName: {
    type: String,
    // required: true,
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
    type: String,
    //required: true
  },
  passRecoveryQuestion: {
    type: String,
    // required: true
  },
  description: {
    type: String,
    // minlength: 1,
    maxlength: 200
  },
  role: {
    type: String,
    //required: true,
    enum: ["artist", "user", "admin"]
  },
  genres: [{
    type: String,
    //required: true,
    enum: ["indie", "rock", "pop", "rap", "hip-pop", "metal", "fado"],
    default: ["indie", "rock", "pop", "rap", "hip-pop", "metal", "fado"]
  }],
  artistAlbums: {
    type: Array
  },
  images: [{
    type: mongoose.Types.ObjectId,
    ref: 'Image'
  }],
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
}, {
  timestamps: {
    createdAt: "creationDate",
    updatedAt: "updateDate"
  }
});

module.exports = mongoose.model("User", schema);