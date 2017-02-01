"use strict"

const request = require("request-promise")

const calendarScraper = require("./lib/calendar")
const cinemaScraper = require("./lib/cinema")
const restaurantScraper = require("./lib/restaurant")

// TODO: Write documentation on how to run the application
// TODO: Go though all promises and check so they are needed. Remove any unnessecary
// TODO: Add the booking functionallity
// TODO: DONE Validate argument so it's a valid URI
// TODO: DONE Check so the protocol is specified. HTTP should always be included
let frontPage = process.argv[2]

let calendarURL
let cinemaURL
let restaurantURL

let dates = []
let movies = []

// TODO: Get JSON data from cinema with this link: http://vhost3.lnu.se:20080/cinema/check?day=05&movie=03
// TODO: Throw exeptions when for example there are no dates available

validateURL(frontPage).then(function() {

    return calendarScraper.getLinks(frontPage)
}).then(function(links) {
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
}).then(function(bookings) {
    presentBookings(bookings)
}).catch(function(error) {
    console.log(error)
})

function presentBookings(bookings) {
    for (let i = 0; i < bookings.length; i += 1) {
        console.log("Alternative #" + (i + 1))
        console.log("Movie: " + bookings[i].movie.movie)
        console.log("Restaurant booking: " + bookings[i].booking.from + ":00 to " + bookings[i].booking.to + ":00\n")
    }
}

function validateURL(url) {
    return new Promise(function(resolve, reject) {
        if (url.substr(0, 4) !== "http") {
            reject("Could not understand protocol. Please specify the protocol in the URL (http://)")
        }

        request(url).then(function() {
            resolve()
        }).catch(function(error) {
            reject("Problem with URL\n" + error)
        })
    })
}
