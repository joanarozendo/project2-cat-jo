"use strict";

const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  bandId: String,
  nameOfEvent: String,
  address: {
    site: String,
    road: String,
    building: String,
    floor: String,
    city: String,
    zip_code: String,
    latitude: Number,
    longitude: Number
  },
  description: String,
  price: Number,
  date: Date,
  day: String,
  month: String,
  year: String,
  time: String,
  bandName: String,
  type: [],
  attend_users_id: [],
  number_of_attendants: {type: Number, default:0},
  images: [{
    type: mongoose.Types.ObjectId,
    ref: 'Image'
  }]
});

module.exports = mongoose.model("Event", schema);
