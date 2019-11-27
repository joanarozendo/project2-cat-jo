const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    maxlength: 140,
    minlength: 1
  },
  author: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['band', 'event']
  },
  band: [{
    type: mongoose.Types.ObjectId,
    ref: 'User'
  }],
  event: [{
    type: mongoose.Types.ObjectId,
    ref: 'Event'
  }],
  images: [{
    type: mongoose.Types.ObjectId,
    ref: 'Image'
  }]
}, {
  timestamps: {
    createdAt: 'creationDate',
    updatedAt: 'updateDate'
  }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;