var Comment = require("./Comment");

var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
// This is similar to a Sequelize model
var ArticleSchema = new Schema({
  //title is required and of type String
  title: {
    type: String,
    required: true
  },
  //body is required and of type String
  body: {
    type: String,
    required: true
  },
  //link is required and of type String
  link: {
    type: String,
    required: true
  },
  siteName: {
    type: String,
    required: true
  },
  siteUrl: {
    type: String,
    required: true
  },
  img: {
    type: String
  },
  user: {
    type: String, 
    required: true
  },
  // note is an object that stores a Note id
  // The ref property links the ObjectId to the Note model
  // This allows us to populate the Article with an associated Note
  comments: [{
    type: Schema.Types.ObjectId,
    ref: "Comment"
  }]
});

ArticleSchema.post('findOneAndRemove', function(dbArticle) {
  // 'this' is the client being removed. Provide callbacks here if you want
  // to be notified of the calls' result.
  Comment.remove({articleId: dbArticle._id}).exec(function(err, resp){
    if(err){
      console.log(err)
    }else{
      console.log(resp);
    }
  });
});

// This creates our model from the above schema, using mongoose's model method
var Article = mongoose.model("Article", ArticleSchema);

// Export the Article model
module.exports = Article;
