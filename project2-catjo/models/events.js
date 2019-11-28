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
  time: String,
  bandName: String,
  type: [],
  attend_users_id: [],
  number_of_attendants: {type: Number, default:0},
});

module.exports = mongoose.model("Event", schema);
