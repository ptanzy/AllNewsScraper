
module.exports = function(app, db){

  app.get("/articles/all/", function(req, res) {
      db.Article.find()
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