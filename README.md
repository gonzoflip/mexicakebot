# untappd-telegrambot


This is a WIP telegram bot for looking up beers on Untappd from telegram

There are some issues associated with the way Untappd sorts query results. They offer sorting by checkin count or alphebetical. If you search for a specific beer that returns a result that has more checkins the bot will return the info on the beer with more checkins. I plan on eventually adding a /beertop command wich would return the top 5 results and prompt the user to pick which beer to return info on.

The only supported commands at this time are "/beer" and "/brewery"
