const cheerio = require("cheerio")
const Nightmare = require("nightmare")


const express = require('express')
const app = express()

var scrape = new Nightmare({
    show: true,
    waitTimeout: 1000*4
})
.goto("https://old.reddit.com/r/news/")
.evaluate(function() {
    return document.body.innerHTML;
}).end().then(function(html) {
  
  // Load the Response into cheerio and save it to a variable
  // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
  var $ = cheerio.load(html);

  console.log($)

  // An empty array to save the data that we'll scrape
  var results = [];

  // With cheerio, find each p-tag with the "title" class
  // (i: iterator. element: the current element)
  $('p.title > a').each(function(i, element) {

    // Save the text of the element in a "title" variable
    var title = $(element).text();

    // In the currently selected element, look at its child elements (i.e., its a-tags),
    // then save the values for any "href" attributes that the child elements may have
    
    var link = $(element).attr("href");

    // https://apnews.com/

    // if (!link.includes('https://apnews.com/')){
    //   link = "https://apnews.com" + link;
    // }


    // Save these results in an object that we'll push into the results array we defined earlier
    results.push({
      title: title,
      link: link
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