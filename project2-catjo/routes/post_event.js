  
const express = require('express');
const postEventsRouter = new express.Router();

const Post = require('./../models/post');
const Image = require('./../models/image');

const uploader = require('./../middleware/upload');
const routeGuard = require('./../middleware/route-guard');


module.exports = postEventsRouter;


