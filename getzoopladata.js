var request = require('request');
var cheerio = require('cheerio');
var moment = require('moment');
var jsonfile = require('jsonfile');

///
/// Get Zoopla House Data
///
function get_zoopladata(root_url, house) {
    var u = root_url + house.url;
    //console.log("Scraping: " + u);

    request(u, function(err, resp, body) {
        if (err)
            throw err;

        $ = cheerio.load(body);

        var mainblock = $('.pdp-estimate');

        if (mainblock.length > 0) {
            var prices = [];
            mainblock.find('.pdp-estimate__price').each(function(index){
                prices[index] = $(this).text().replace(/[^\d.-]/g, '');
            });
            var confidence = mainblock.find('.pdp-confidence-rating__copy').text().replace(/[^\d.-]/g, '');

            console.log("Price data for: " + house.location);
            console.log("Zoopla Address: " + u);
            console.log('Estimated Price: ' + prices[0]);
            console.log('Confidence: ' + confidence);
            console.log('Estimated Rental: ' + prices[1]);
            console.log();

        } 
        else {
            console.log("ERROR: Could not find house data for " + house.location);
        }
    });
}

//
// Loop over the targets
//
var dt = new moment();
console.log("Zoopla House Price Data for " + dt.format("DD MMM YYYY") + "\n")

jsonfile.readFile("./housedata_zoopla.json", function(err, data) {
    if (err) {
        console.log("Error: could not load configuration file - " + err);
    }
    else {
        for (var i = 0, l = data.houses.length; i < l; i++) {
            get_zoopladata(data.root_url, data.houses[i]);
        }
    }
});
