const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;


const User = require('./models/user');
const bcryptjs = require('bcryptjs');