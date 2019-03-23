var express = require("express");

var mongoose = require("mongoose");

// Require all models
var db = require("./models");

var PORT = 8080;

// Initialize Express
var app = express();

//Static dir
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/news-articles", { useNewUrlParser: true });

//Routes
require("./routes/api-routes.js")(app, db);
require("./routes/html-routes.js")(app);

  
//Set the app to listen on port 8080
app.listen(8080, function() {
  console.log("App running on port 8080");
});
  