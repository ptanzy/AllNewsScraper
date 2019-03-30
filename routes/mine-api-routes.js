// var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");

module.exports = function(app, db){

    app.get("/articles/mine/:user", function(req, res) {
        db.Article.find({ user: req.params.user })
          //populates article with the note
          .populate("Comment")
          .then(function(dbArticle) {
            //send article back to client
            console.log("ARTICLE COMMENT ADDED: "+dbArticle);
            res.json(dbArticle);
          })
          .catch(function(err) {
            //error to client
            console.log("Article Comment add err: "+err)
            err.type = "error";
            res.json(err);
          });

    });
  
}
