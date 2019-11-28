  const express = require('express');
  const postBandRouter = new express.Router();

  const Post = require('./../models/post');
  const Image = require('./../models/image');

  const uploader = require('./../middleware/upload');
  const routeGuard = require('./../middleware/route-guard');





  //Edit a post in a band profile
  postBandRouter.get('/edit/:post_id',
    routeGuard, (req, res, next) => {
      const postId = req.params.post_id;
      Post.findById(postId)
        .populate('author images')
        .then(post => {
          if (JSON.stringify(post.author._id) === JSON.stringify(req.session.user)) {
            res.render('band/posts/edit', {
              post
            })
          } else {
            next(new Error('User has no permission to edit post.'));
          }
        });
    });




  //Edit a post in a band profile (post method)
  postBandRouter.post('/edit/:post_id',
    routeGuard, (req, res, next) => {
      const postId = req.params.post_id;
      console.log(req.body);
      const text = req.body.text;
      console.log('this is my req.body', req.body);
      Post.findOneAndUpdate({
          _id: postId,
          author: req.session.user
        }, {
          text: text
        })
        .then(data => {
          res.redirect(`/band/post/${postId}`);
        })
        .catch(error => {
          console.log('post not updated')
          next(error);
        });
    });

  //Delete a post
  postBandRouter.post('/delete/:post_id', routeGuard, (req, res, next) => {
    const postId = req.params.post_id;
    let bandId;
    Post.findById(postId)
      .then(post => {
        bandId = post.author;
        console.log(bandId);
        return Post.findOneAndDelete({
            _id: postId,
            author: req.session.user
          })
          .then(data => {
            res.redirect(`/band/profile/${bandId}`);
          })
          .catch(error => {
            next(error);
          });
      });
  });



  //Create a post in band profile
  postBandRouter.post('/:band_id/create',
    routeGuard,
    uploader.array('images', 5),
    (req, res, next) => {
      const bandId = req.params.band_id;
      const text = req.body.text;
      const author = req.session.user;

      const imageObjectArray = (req.files || []).map(file => {
        return {
          url: file.url
        };
      });

      Image.create(imageObjectArray)
        .then((images = []) => {
          const imageIds = images.map(image => image._id);
          return Post.create({
            text,
            author,
            images: imageIds,
            band: bandId,
            type: 'band'
          });
        })
        .then(document => {
          console.log('comment created');
          res.redirect(`/band/profile/${bandId}`);
        })
        .catch(error => {
          console.log('comment not created');
          next(error);
        });
    }
  );


  //Check a single a post in band profile
  postBandRouter.get('/:post_id',
    routeGuard, (req, res, next) => {
      const postId = req.params.post_id;
      Post.findById(postId)
        .populate('author images')
        .then(post => {
          res.render('band/posts/post-single', post)
        });
    });


  module.exports = postBandRouter;