var path = require("path");

module.exports = function(app){
    app.get("/create", function(req, res) {
        res.sendFile(path.join(__dirname, "../public/create.html"));
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