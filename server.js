const cheerio = require("cheerio");
const Nightmare = require("nightmare");

const express = require("express");
const app = express();

const mongojs = require("mongojs");

//do we need this?
app.set("view-engine", "ejs");

const databaseURL = "scraper_db";
const collections = ["scapedData"];

var database = mongojs(databaseURL, collections);
database.on("error", function(error) {
  console.log("DB Error:", error);
});

app.get("/", function(request, results) {
  results.sendFile(path.join(__dirname, "index.html"));
  results.send("what up");
});

app.get("/scrape", function(req, res) {

  database.scrapedData.remove();
  
  var scrape = new Nightmare({
    show: true,
    waitTimeout: 1000 * 4
  })
    .goto("http://www.nfl.com/news")
    .evaluate(function() {
      return document.body.innerHTML;
    })
    .end()
    .then(function(html) {
      // Load the Response into cheerio and save it to a variable
      // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
      var $ = cheerio.load(html);

      // An empty array to save the data that we'll scrape
      var results = [];

      // With cheerio, find each p-tag with the "title" class
      // (i: iterator. element: the current element)
      $("div.text.col.caption").each(function(i, element) {
        // Save the text of the element in a "title" variable
        var title = $(element)
          .children("h3")
          .text();

        // In the currently selected element, look at its child elements (i.e., its a-tags),
        // then save the values for any "href" attributes that the child elements may have

        var link = $(element)
          .find("h3 > a")
          .attr("href");

        console.log(link);

        var body = $(element)
          .children("p")
          .text();

        // https://apnews.com/

        if (!link.includes("https://www.nfl.com/news/")) {
          link = "https://www.nfl.com/news/" + link;
        }

        // Save these results in an object that we'll push into the results array we defined earlier

        if (title && link && body) {
          database.scapedData.insert({
            title: title,
            link: link,
            body: body
          });
        }

        results.push({
          title: title,
          link: link,
          body: body
        });
      });

      // $('div.content > p').each(function(i, element) {

      //   let body = $(element).text()

      //   // Save these results in an object that we'll push into the results array we defined earlier
      //   results.push({
      //     body:body
      //   });
      // });

      // Log the results once you've looped through each of the elements found with cheerio
      console.log(results);
    });
});

app.listen(3000, function() {
  console.log("App running!");
});
