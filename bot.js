require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const rp = require('request-promise')
const fs = require('fs')
const http = require('https')
const cmd = require('node-cmd')

// create a .env with TELEGRAM_TOKEN, CLIENT_ID, and CLIENT_SECRET defined in it
const token= process.env.TELEGRAM_TOKEN;
const clientId= process.env.UNTAPPD_ID;
const clientSecret= process.env.UNTAPPD_SECRET;
const baseUrl= 'https://api.untappd.com/v4'
const bot = new TelegramBot(token, {polling: true});
const alphaUrl= 'https://www.alphavantage.co/query'
const alphaKey= process.env.ALPHA_KEY;

bot.onText(/\/beer (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  beerSearch(match, chatId)
});

bot.onText(/\/brewery (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  brewerySearch(match, chatId)
});

bot.onText(/\/stock (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  stockLookup(match, chatId)
    .then(function (body) {
       const stockInfo = body["Global Quote"]
       bot.sendMessage(chatId, stockInfoFormat(stockInfo))
       })
});

bot.onText(/\/crypto (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  cryptoLookup(match, chatId)
    .then(function (body) {
       const cryptoInfo = body["Realtime Currency Exchange Rate"]
       bot.sendMessage(chatId, cryptoInfoFormat(cryptoInfo))
       })
});

bot.onText(/\/lenny/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, randLenny())
});

bot.onText(/\/fle/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, randFlenny())
});

bot.onText(/\/boomer/, (msg) => {
  const chatId = msg.chat.id;
  const image =  'boomer';
  bot.sendPhoto(chatId, randImage(image))
});

bot.onText(/\/pepe/, (msg) => {
  const chatId = msg.chat.id;
  const image = 'pepe';
  bot.sendPhoto(chatId, randImage(image))
});

bot.on('message', function (message) {
      if (message.photo != undefined){
                bot.getFile(message.photo.slice(-1)[0].file_id).then(function (fileData) {
                              var downloadUrl = 'https://api.telegram.org/file/bot' + token + '/' + fileData.file_path;
                              var FileName = '/srv/' + fileData.file_path;
                              var file = fs.createWriteStream(FileName);
                              var request = http.get(downloadUrl, function(response) {
                                                response.pipe(file);
                                            });
                              console.log(downloadUrl);
                          });
            }
});

bot.onText(/\/deepfry/, (msg) => {
   const chatId = msg.chat.id;
   const photosPath = '/srv/photos/';
   const photoList = fs.readdirSync(photosPath)
   const revPhoto = photoList.reverse()
   const command = '/usr/local/bin/python3.6 /home/gonzoflip/deeppyer/deeppyer.py -t d7c38608954c412eaa148ecc3bfd74dc -o /srv/photos/deepfry.jpg ' + photosPath + revPhoto[0]
   cmd.get(command, function(){
     bot.sendPhoto(chatId, photosPath + 'deepfry.jpg')
   })
});



// beer search, this queries the untappd /search/beer api, grabs the "bid" of top the search result (based on checkins),
// and queries the /beer/info enpoint with the bid for the full info on the beer.
function beerSearch(match, chatId) {
  searchBeer(match)
    .then(function (body) {
      return body.response.beers.items[0].beer.bid
    })
    .catch(function (err) {
      console.log(err)
	    bot.sendmessage(chatid, "your search returned no results, try to broaden your search terms")
    })
    .then(bid => beerLookup(bid))
      .then(function (body) {
        var beerInfo = body.response.beer
        return beerInfo
      })
      .catch(function (err) {
          console.log(err)
      })
      .then(beerInfo => {
	      bot.sendPhoto(chatId, beerInfo.beer_label_hd)
	      bot.sendMessage(chatId, beerInfoFormat(beerInfo))
      })
};

function brewerySearch(match, chatId) {
  searchBrewery(match)
    .then(function (body) {
      console.log(body)
      return body.response.brewery.items[0].brewery.brewery_id
      console.log(body.response.brewery.items[0].brewery.brewery_id)
    })
    .catch(function (err) {
      bot.sendMessage(chatId, "Your search returned no results, try to broaden your search terms")
    })
    .then(brewery_id => breweryLookup(brewery_id))
      .then(function (body) {
        var breweryInfo = body.response.brewery
        return breweryInfo
      })
      .catch(function (err) {
          console.log(err)
      })
      .then(breweryInfo => {
	      bot.sendPhoto(chatId, breweryInfo.brewery_label)
	      bot.sendMessage(chatId, breweryInfoFormat(breweryInfo))
      })

}

function searchBeer(match) {
  var options = {
    uri: baseUrl +'/search/beer',
    qs: {
      client_id: clientId,
      client_secret: clientSecret,
      q: match[1]
    },
    headers: {
      'User-Agent': 'Request-Promise'
    },
    json: true // Automatically parses the JSON string in the response
  };
  return rp(options)
}

function beerLookup(bid) {
  var options = {
    uri: baseUrl +'/beer/info/' +bid,
    qs: {
      client_id: clientId,
      client_secret: clientSecret,
    },
    headers: {
     'User-Agent': 'Request-Promise'
  },
    json: true
  };
  return rp(options)
}

function searchBrewery(match) {
  var options = {
    uri: baseUrl +'/search/brewery',
    qs: {
      client_id: clientId,
      client_secret: clientSecret,
      q: match[1]
    },
    headers: {
      'User-Agent': 'Request-Promise'
    },
    json: true
  };
  return rp(options)
}

function breweryLookup(brewery_id) {
  var options = {
    uri: baseUrl +'/brewery/info/' +brewery_id,
    qs: {
      client_id: clientId,
      client_secret: clientSecret,
    },
    headers: {
     'User-Agent': 'Request-Promise'
  },
    json: true
  };
  return rp(options)
}

function cryptoLookup(match) {
  var options = {
    uri: alphaUrl,
    qs: {
      function: 'CURRENCY_EXCHANGE_RATE',
      from_currency: match[1],
	    to_currency: 'USD',
      apikey: alphaKey,
    },
    headers: {
     'User-Agent': 'Request-Promise'
  },
    json: true
  };
  return rp(options)
}

function stockLookup(match) {
  var options = {
    uri: alphaUrl,
    qs: {
      function: 'GLOBAL_QUOTE',
      symbol: match[1],
      apikey: alphaKey,
    },
    headers: {
     'User-Agent': 'Request-Promise'
  },
    json: true
  };
  return rp(options)
}



function beerInfoFormat(beerInfo) {
  var output = 'Name:' + beerInfo['beer_name'] + '\n'
  output += 'Brewery:' + beerInfo.brewery['brewery_name'] + '\n'
  output +='ABV:' + beerInfo['beer_abv'] + '\n'
  output +='IBU:' + beerInfo['beer_ibu'] + '\n'
  output +='Style:' + beerInfo['beer_style'] + '\n'
  output +='Rating:' + beerInfo['rating_score'] + '\n'
  return output
}

function breweryInfoFormat(breweryInfo) {
  var output = 'Brewery:' + breweryInfo['brewery_name'] + '\n'
  output +='City:' + breweryInfo.location['brewery_city'] + '\n'
  output +='State:' + breweryInfo.location['brewery_state'] + '\n'
  output +='Country:' + breweryInfo['country_name'] + '\n'
  output +='Rating:' + breweryInfo.rating['rating_score'] + '\n'
  return output
}

function stockInfoFormat(stockInfo) {
  var output = 'Ticker:' + stockInfo['01. symbol'] + '\n'
  output +='Open:' + stockInfo['02. open'] + '\n'
  output +='Price:' + stockInfo['05. price'] + '\n'
  output +='Change:' + stockInfo['10. change percent'] + '\n'
  return output
}

function cryptoInfoFormat(cryptoInfo) {
  var output = 'Token:' + cryptoInfo['2. From_Currency Name'] + '\n'
  output +='Price:$' + parseFloat(cryptoInfo['5. Exchange Rate']) + '\n'
  return output
}

function getRandElement(array) {
  return array[Math.floor(Math.random()*array.length)];
}

function randLenny() {
  const lenny = fs.readFileSync('./lib/lenny', 'utf8')
  const lennys = lenny.split("\n");
  return getRandElement(lennys)
};

function randFlenny() {
  const flenny = fs.readFileSync('./lib/fatlenny', 'utf8')
  const flennys = flenny.split("\n");
  return getRandElement(flennys)
};

function randImage(image) {
  const images =  fs.readdirSync('/srv/'+image)
  const imagePath = '/srv/' + image + '/' + getRandElement(images);
  return imagePath
};

