"use strict";

const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    // required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    required: true,
    unique: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  facebook: [
    {
      id: {
        type: String
      },
      token: {
        type: String
      },
      name: {
        type: String
      },
      email: {
        type: String
      }
    }
  ],
  description: {
    type: String,
    minlength: 1,
    maxlength: 200
  },
  role: {
    type: String,
    // required: true,
    enum: ["artist", "user", "admin"]
  },
  favoriteGenres: [
    {
      type: String,
      enum: ["indie", "rock", "pop", "rap", "hip pop", "metal", "fado"]
    }
  ],
  artistGenre: {
    type: String,
    // required: true,
    enum: ["indie", "rock", "pop", "rap", "hip pop", "metal", "fado"]
  },
  artistAlbums: {
    type: String
  }
});

module.exports = mongoose.model("User", schema);
