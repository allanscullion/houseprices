var request = require('request');
var cheerio = require('cheerio');
var moment = require('moment');
var jsonfile = require('jsonfile');

//
// Lookup of Zoopla price changes
//
var price_change_times = {
    '0': '3m',
    '1': '6m',
    '2': '1y',
    '3': '2y',
    '4': '3y',
    '5': '4y',
    '6': '5y',
}

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

        var mainblock = $('.estimate-layout');

        if (mainblock.length > 0) {
            var price = mainblock.find('.estimate-col-1 p.neither .zestimate').text().replace(/[^\d.-]/g, '');
            var confidence = mainblock.find('#confidence_level span strong').text();
            var rental = mainblock.find('.estimate-col-3 strong.big span.big').text().replace(/[^\d.-]/g, '');

            console.log("Price data for: " + house.location);
            console.log("Zoopla Address: " + u);
            console.log('Estimated Price: ' + price);
            console.log('Confidence: ' + confidence);
            console.log('Estimated Rental: ' + rental);

            //
            // Get the house price deltas
            //
            var changes = mainblock.find('.estimate-col-2 span.vc').each(function(index) {
                var pricechg = $(this).find('strong.big').text().replace(/[^\d.-]/g, '');
                var pricechgpct = $(this).find('span.small').text().replace(/[^\d.-]/g, '');

                //
                // Fixup the price if the change % is a minus number
                //
                if (pricechgpct < 0){
                    pricechg = -pricechg;
                }

                console.log('Price change[' + price_change_times[index] + ']: ' + pricechg + ' - ' + pricechgpct + ' (' + (price - pricechg) + ')');
            });

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
