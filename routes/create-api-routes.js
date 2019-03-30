// var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");
var ScrapedUrl = require("../scripts/scraped-url")

module.exports = function(app, db){
    app.get("/scrape", function(req, res) {
        // debugger;
        var data = req.query;
        // var sdate = new Date(data.sdate);
        // var edate = new Date(data.edate);
        // var urlObj = {
        //     site: "https://www.nytimes.com/search?",
        //     term: data.search.trim(),
        //     sdate: dateAs8LengthString(sdate),
        //     edate: dateAs8LengthString(edate),
        //     sort: data.sort,
        //     buildUrl: function(){
        //         var url = this.site;
        //         if(this.edate){
        //             url += "endDate="+this.edate+"&query="+this.term;;
        //         }else{
        //             url += "query="+this.term;
        //         }
        //         if(this.sort){
        //             url += "&sort="+this.sort;
        //         }
        //         if(this.sdate){
        //             url += "&startDate="+this.sdate;
        //         }
        //         return encodeURI(url);
        //     }
        // }
        // var url = urlObj.buildUrl();
        var scrapedUrl = new ScrapedUrl(data.site, data.search, {
            sort: data.sort, sdate: data.sdate, edate: data.edate
        }); 
        // First, we grab the body of the html with axios
        axios.get(scrapedUrl.url).then(function(response) {
            // Load the HTML into cheerio and save it to a variable
            // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
            var $ = cheerio.load(response.data);

            // An empty array to save the data that we'll scrape
            var results = [];

            // Select each element in the HTML body from which you want information.
            // NOTE: Cheerio selectors function similarly to jQuery's selectors,
            // but be sure to visit the package's npm page to see how it works
            $(".css-1l4w6pd").each(function(i, element) {

                var article = {
                    title: $(element).find("h4").text(),
                    body: $(element).find("p").text(),
                    link: $(element).find("a").attr("href"),
                    img: $(element).find("img").attr("src"),
                    siteName: scrapedUrl.siteName,
                    siteUrl: scrapedUrl.siteUrl
                }
                results.push(article);
                // // Create a new Article using the `result` object built from scraping
                // db.Article.create(article)
                //     .then(function(dbArticle) {
                //         // View the added result in the console
                //         article.id = dbArticle.id;
                //         // Save these results in an object that we'll push into the results array we defined earlier
                //         results.push(article);
                //         console.log(dbArticle);
                //     })
                //     .catch(function(err) {
                //         // If an error occurred, log it
                //         console.log(err);
                //     });   

            });
            // Create a new Article using the `result` object built from scraping
            // db.Article.insertMany(results)
            // .then(function(dbArticle) {
            //     // View the added result in the console
            //     res.send(dbArticle);
            //     console.log(dbArticle);
            // })
            // .catch(function(err) {
            //     // If an error occurred, log it
            //     res.send(err);
            //     console.log(err);
            // });   
            res.send(results);
        });
    });
  
  //gets article by id
  app.get("/articles/:id", function(req, res) {
    //finds article with the id supplied
    db.Article.findOne({ _id: req.params.id })
      //populates article with the note
      .populate("comment")
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

  //route for adding comment to article
  app.post("/article", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Article.findOneAndUpdate({title: req.body.title}, req.body, {new: true, upsert: true})
    .then(function(dbArticle) {
      res.json(dbArticle)
      console.log("ADDED ARTICLE: "+dbArticle);
    })
    .catch(function(err) {
      console.log("Article Add Error: "+err)
      err.type = "error";
      res.json(err);
    });
  });
  
  //route for adding comment to article
  app.post("/comment/:id/:user", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Comment.create(req.body)
      .then(function(dbComment) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate({ _id: req.params.id, user: req.params.user }, { note: dbComment._id }, { new: true });
      })
      .then(function(dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        console.log("UPDATED ARTICLE: "+dbArticle);
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        console.log("Article Update Error: "+err)
        err.type = "error";
        res.json(err);
      });
  });
  
  app.get("/delete/article/:id", function(req, res){
    db.Comment.remove({_id: req.params.id})
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      console.log("UPDATED ARTICLE: "+dbArticle);
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      console.log("Article Update Error: "+err)
      err.type = "error";
      res.json(err);
    });
  });
  
  app.get("/delete/comment/:id", function(req, res){
    db.Comment.remove({_id: req.params.id})
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      console.log("UPDATED ARTICLE: "+dbArticle);
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      console.log("Article Update Error: "+err)
      err.type = "error";
      res.json(err);
    });
  });

};

// function dateAs8LengthString(date){
//     var year = ""+date.getFullYear();
//     var month = date.getMonth()+1;
//     var day = date.getDate();
//     if(month<10){
//         month = "0"+month;
//     }
//     if(day<10){
//         day = "0"+day;
//     }
//     return year+month+day;
// }