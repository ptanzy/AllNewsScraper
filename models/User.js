var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
// This is similar to a Sequelize model
var UserSchema = new Schema({
  //title is required and of type String
  username: {
    type: Number,
    required: true
  },
  //email is required and of type String
  email: {
    type: String,
    required: true
  },
  //password is required and of type String
  password: {
    type: String,
    required: true
  }

  // article: {
  //   type: Schema.Types.ObjectId,
  //   ref: "Article"
  // }
});

// This creates our model from the above schema, using mongoose's model method
var User = mongoose.model("User", UserSchema);

// Export the Article model
module.exports = User;
