var Browser = require('zombie');
var moment = require('moment');
var async = require('async');
var jsonfile = require('jsonfile');

//
// Setup a headless browser
//
browser = new Browser({ debug: false });
browser.runScripts = true;

var root_url;

//
// Iterator for async.eachSeries
//
var iterator = function(house, callback) {
    var u = root_url + house.url;
    var html;

    console.log("Price data for: " + house.location)
    console.log("Calnea Address: " + u);
    browser.visit(u, { debug: false, runScripts: true, maxWait: 15, waitFor: 10 }).
	then(function() {
            console.log("Estimated Value: " + browser.text("#SpanValEstimate").replace(/[^\d.-]/g, ''));
            console.log("Estimated Rental: " + browser.text("#SpanRentEstimate").replace(/[^\d.-]/g, ''));
            console.log();
            callback();
        });
}

//
// Get Calnea Data
//
function scrape_all(houses) {

    //
    // Synchronously loop over the targets
    //
    var dt = new moment();
    console.log("Calnea Analytics House Price Data for " + dt.format("DD MMM YYYY") + "\n");

    async.eachSeries(houses, iterator, function(err) {
        console.log("Calnea download complete.");
    });
}

function get_calnea_data(data) {
    //console.log("Logging into Calnea... " + data.user + ":" + data.password);
    root_url = data.root_url;
    browser.visit(data.login_url, function (err) {
        if (err) {
            console.log("Error loading Calnea login page: " + err)
        } else {
            browser.fill('input[name="ctl00$ctl00$cntMainArea$MainContent$txtEmail"]', data.user);
            browser.fill('input[name="ctl00$ctl00$cntMainArea$MainContent$txtPassword"]', data.password);
            browser.pressButton('input[name="ctl00$ctl00$cntMainArea$MainContent$cmdLogin"]', null);
            browser.wait().then(function() {
                scrape_all(data.houses);
            });
        }
    });
}

//
// Load the setup data and process
//
jsonfile.readFile("./housedata_calnea.json", function(err, data) {
    if (err) {
        console.log("Error: could not load configuration file - " + err);
    }
    else {
        get_calnea_data(data);
    }
});
