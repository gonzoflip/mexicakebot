const UntappdClient = require("node-untappd");



var debug = false;
var untappd = new UntappdClient(debug);

Set your credientials

var clientId = process.env.UNTAPPD_KEY;
var clientSecret = process.env.UNTAPPD_SECRET; 
//var accessToken = "[ your access token goes here ]"; // Replace this with an Access Token, Optional

untappd.setClientId(clientId);
untappd.setClientSecret(clientSecret);
untappd.setAccessToken(accessToken); // Optional



var lookupuser = "[ dirtstar ]";
untappd.userFeed(function(err,obj){
	var beers = obj.results.forEach(function(checkin){
		console.log("\n"+username,"drank",checkin.beer_name);
		console.log("by",checkin.brewery_name);
		if (checkin.venue_name) console.log("at",checkin.venue_name);
		console.log("on",checkin.created_at);
	});
},lookupuser);
