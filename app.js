"use strict"

const calendar = require("./lib/calendar")
const cinema = require("./lib/cinema")
const restaurant = require("./lib/restaurant")
const presentation = require("./lib/presentation")
const validate = require("./lib/validate")

let url = process.argv[2]
let calendarURL
let cinemaURL
let restaurantURL

validate.url(url).then(function() {
    // Get links to calendar, cinema, and restaurant from the front page
    return calendar.getLinks(url)
}).then(function(links) {
    // Store links to global variables
    calendarURL = links[0]
    cinemaURL = links[1]
    restaurantURL = links[2]

    // Get links to the calendar page of each person
    return calendar.getLinks(calendarURL)
}).then(function(links) {
    // Get all friends and their what their status is on each day
    return calendar.getAllFriends(links)
}).then(function(friends) {
    // Get the movies which are shown on the days where all friends are available
    return cinema.findMovies(cinemaURL, calendar.findSuitableDates(friends))
}).then(function(movies) {
    // Match movies and table bookings. Return object containing a suggestion with a movie and an
    // available table.
    return restaurant.getSuitableBookings(restaurantURL, movies)
}).then(function(bookings) {
    // Present the alternatives to the user and ask for input on which should be booked.
    presentation.presentAlternatives(bookings)
    return restaurant.askForBookingTable(bookings)
}).then(function(finalBooking) {
    // Book the table choosen by the user
    return restaurant.bookTable(finalBooking, restaurantURL)
}).then(function(finalBooking) {
    // Present the final booking and exit
    presentation.presentFinalBooking(finalBooking)
    process.exit()
}).catch(function(error) {
    // Display error in console and exit
    console.log(error)
    process.exit()
})
