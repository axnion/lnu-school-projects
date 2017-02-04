"use strict"

const request = require("request-promise")

const calendarScraper = require("./lib/calendar")
const cinemaScraper = require("./lib/cinema")
const restaurantScraper = require("./lib/restaurant")

// TODO: Write documentation on how to run the application
let frontPage = process.argv[2]

let calendarURL
let cinemaURL
let restaurantURL

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
    return cinemaScraper.findMovies(cinemaURL, calendarScraper.findSuitableDates(friends))
}).then(function(movies) {
    return restaurantScraper.getSuitableBookings(restaurantURL, movies)
}).then(function(bookings) {
    presentAlternatives(bookings)
    return restaurantScraper.askForBookingTable(bookings)
}).then(function(finalBooking) {
    return restaurantScraper.bookTable(finalBooking, restaurantURL)
}).then(function(finalBooking) {
    presentFinalBooking(finalBooking)
    process.exit()
}).catch(function(error) {
    console.log(error)
})

function presentAlternatives(bookings) {
    for (let i = 0; i < bookings.length; i += 1) {
        console.log("Alternative #" + (i + 1))
        console.log("Day: " + bookings[i].day)
        console.log("Movie: " + bookings[i].movie.title)
        console.log("Restaurant booking: " + bookings[i].table.from + ":00 to " +
            bookings[i].table.to + ":00\n")
    }
}

function presentFinalBooking(booking) {
    console.log("Table has been booked from " + booking.table.from + " to " + booking.table.to)
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
