// var db = require("../models");

module.exports = function(app){
    app.get("/", function(req, res) {
        res.sendFile(path.join(__dirname, "../public/index.html"));
    });

    app.get("/mynews", function(req, res) {
        res.sendFile(path.join(__dirname, "../public/mynews.html"));
    });
    
    app.get("/allnews", function(req, res) {
        res.sendFile(path.join(__dirname, "../public/allnews.html"));
    });
    
    app.get("/stats", function(req, res) {
        res.sendFile(path.join(__dirname, "../public/stats.html"));
    });    
}