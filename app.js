"use strict"

const calendarScraper = require("./lib/calendar")

// TODO: Validate argument so it's a valid URI
// TODO: Check so the protocol is specified. HTTP should always be included
let frontPage = process.argv[2]

let calendarURL
let cinemaURL
let restaurantURL

// TODO: Get JSON data from cinema with this link: http://vhost3.lnu.se:20080/cinema/check?day=05&movie=03
// TODO: Throw exeptions when for example there are no dates available
calendarScraper.getLinks(frontPage).then(function(links) {
    calendarURL = links[0]
    cinemaURL = links[1]
    restaurantURL = links[2]

    return calendarScraper.getLinks(calendarURL)
}).then(function(links) {
    return calendarScraper.getAllFriends(links)
}).then(function(friends) {
    let dates = calendarScraper.findSuitableDates(friends)
    return cinemaScraper.findMovies(dates)
}).catch(function(error) {
    console.log(error)
})
