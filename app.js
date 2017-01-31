"use strict"

const calendarScraper = require("./lib/calendar")
const cinemaScraper = require("./lib/cinema")
const restaurantScraper = require("./lib/restaurant")

// TODO: Go though all promises and check so they are needed. Remove any unnessecary
// TODO: Validate argument so it's a valid URI
// TODO: Check so the protocol is specified. HTTP should always be included
let frontPage = process.argv[2]

let calendarURL
let cinemaURL
let restaurantURL

let dates = []
let movies = []
let bookings = []

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
    dates = calendarScraper.findSuitableDates(friends)
    return cinemaScraper.findMovies(cinemaURL, dates)
}).then(function(availableMovies) {
    movies = availableMovies
    return restaurantScraper.getSuitableBookings(restaurantURL, movies)
}).then(function(suitableBookings) {
    presentBookings(suitableBookings)
}).catch(function(error) {
    console.log(error)
})

function presentBookings(bookings) {
    for (let i = 0; i < bookings.length; i++) {
        console.log("Alternative #" + (i + 1))
        console.log("Movie: " + bookings[i].movie.movie)
        console.log("Restaurant booking: " + bookings[i].booking.from + ":00 to " + bookings[i].booking.to + ":00\n")
    }
}
