module.exports = function(app, db){  
  app.get("/api/users", function(req, res) {
    db.User.find({})
      .then(function(dbUser) {
        //returns articles back to client
        res.json(dbUser);
      })
      .catch(function(err) {
        //returns error back
        res.json(err);
      });
  });

  app.get("/api/users/:id", function(req, res) {
    // Find one user with the id in req.params.id and return them to the user with res.json
    db.User.findOne({ _id: req.params.id })
      .then(function(dbUser) {
        res.json(dbUser);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

  app.post("/api/users", function(req, res) {
    console.log(req.body);
    // Create a new Article using the `result` object built from scraping
    db.Article.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    })
    .then(function(dbArticle) {
      // View the added result in the console
      console.log(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, log it
      console.log(err);
    });
  
  });

  // app.delete("/api/users/:id", function(req, res) {
  //   // Delete the user with the id available to us in req.params.id
  //   db.user.destroy({
  //     where: {
  //       id: req.params.id
  //     }
  //   }).then(function(dbuser) {
  //     res.json(dbuser);
  //   });
  // });
};