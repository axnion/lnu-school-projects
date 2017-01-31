"use strict"

module.exports = {
    getSuitableBookings: getSuitableBookings
}

const request = require("request-promise")
const cheerio = require("cheerio")

// TODO: Scrape the form to see the action link
function getSuitableBookings(url, movies) {
    return new Promise(function(resolve, reject) {
        request.post({url: url + "/login", jar: true, followAllRedirects: true, form: {username: "zeke", password: "coys"}}).then(function(html) {
            let availableBookings = findBookingAlternatives(html)

            resolve(findMatchingMoviesAndBookings(availableBookings, movies))
        }).catch(function(error) {
            reject(error)
        })
    })
}

function findBookingAlternatives(html) {
    let bookings = []
    let analyzer = cheerio.load(html)
    let inputs = analyzer("input[name=group1]")

    analyzer(inputs).each(function(i, el) {
        bookings.push(parseBooking(analyzer(el).val()))
    })

    return bookings
}

function parseBooking(str) {
    let day = str.substr(0, 3)
    let from = str.substr(3, 2)
    let to = str.substr(5, 2)

    if (day === "fri") {
        day = "05"
    } else if (day === "sat") {
        day = "06"
    } else if (day === "sun") {
        day = "07"
    }

    return {
        day: day,
        from: from,
        to: to
    }
}

function findMatchingMoviesAndBookings(bookings, movies) {
    let options = []

    movies.forEach(function(movie) {
        bookings.forEach(function(booking) {
            let movieEndTime = String(Number(movie.time) + 2)
            if (movie.day === booking.day && movieEndTime === booking.from) {
                options.push({movie, booking})
            }
        })
    })

    return options
}
