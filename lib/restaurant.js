"use strict"

module.exports = {
    getSuitableBookings: getSuitableBookings,
    askForBookingTable, askForBookingTable,
    bookTable, bookTable
}

const request = require("request-promise")
const cheerio = require("cheerio")
const inquirer = require("inquirer")
const prompt = require("prompt-promise")

let cookieJar = request.jar()

function getSuitableBookings(url, movies) {
    return new Promise(function(resolve, reject) {
        login(url).then(function(response) {
            let html = response.body
            let availableBookings = findBookingAlternatives(html)
            let matchingBookings = findMatchingMoviesAndBookings(availableBookings, movies)

            if (matchingBookings.length < 1) {
                reject("No matching restaurant bookings")
            } else {
                resolve(findMatchingMoviesAndBookings(availableBookings, movies))
            }
        }).catch(function(error) {
            reject(error)
        })
    })
}

function askForBookingTable(bookings) {
    return new Promise(function(resolve, reject) {
        prompt("Alternative: ").then(function(answer) {
            if (answer < 1) {
                resolve(null)
            } else {
                resolve(bookings[answer - 1])
            }
        }).catch(function(error) {
            reject(error)
        })
    })
}

function bookTable(booking, url) {
    return new Promise(function(resolve, reject) {
        let options = {
            url: url
        }

        login(url).then(function(response) {
            console.log(response.request.uri.href)

            let options = {
                url: response.request.uri.href,
                jar: cookieJar,
                headers: {"User-Agent": "an222yp@student.lnu.se"},
                form: {value: "s32552534245"}
            }

            request.post(options).then(function(html) {
                console.log(html)
            })
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
        to: to,
        value: str
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

function login(url) {
    let options = {
        url: url + "/login",
        jar: cookieJar,
        followAllRedirects: true,
        resolveWithFullResponse: true,
        headers: {"User-Agent": "an222yp@student.lnu.se"},
        form: {username: "zeke", password: "coys"}
    }

    return request.post(options)
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n)
}
