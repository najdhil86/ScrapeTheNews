// Dependencies
var express = require("express");
var mongojs = require("mongojs");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");
var path = require("path");

// Initialize Express
var app = express();

app.set("view engine", "ejs");

// Database configuration
var databaseUrl = "scraper_db";
var collections = ["scrapedData"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// Main route (simple Hello World Message)
app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
  // res.send("Hello world");
});

// Retrieve data from the db
app.get("/all", function(req, res) {
  // Find all results from the scrapedData collection in the db
  db.scrapedData.find({}, function(error, found) {
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as json
    else {
      res.json(found);
    }
  });
});

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function(req, res) {
  //Delete the colection scrapedData
  db.scrapedData.remove();
  // Make a request via axios for the news section of `ycombinator`
  axios.get("https://news.ycombinator.com/").then(function(response) {
    console.log(response.data);
    console.log("====================================");
    // Load the html body from axios into cheerio
    var $ = cheerio.load(response.data);
    // For each element with a "title" class
    $(".title").each(function(i, element) {
      // Save the text and href of each link enclosed in the current element
      console.log("---------------------------");
      console.log($(element).html());

      var title = $(element)
        .children("a")
        .text();
      var link = $(element)
        .children("a")
        .attr("href");
      var today = new Date();
      var date =
        today.getFullYear() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getDate();
      var time =
        today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      var dateTime = date + " " + time;
      // If this found element had both a title and a link
      if (title && link) {
        // Insert the data in the scrapedData db
        db.scrapedData.insert(
          {
            title: title,
            link: link,
            time: Date()
          },
          function(err, inserted) {
            if (err) {
              // Log the error if one is encountered during the query
              console.log(err);
            } else {
              // Otherwise, log the inserted data
              console.log(inserted);
            }
          }
        );
      }
    });
  });

  // Send a "Scrape Complete" message to the browser
  res.send("Scrape Complete");
});

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
