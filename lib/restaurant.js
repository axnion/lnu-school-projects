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

// TODO: Scrape the form to see the action link
// TODO: Use HTTP header User-Agent
// TODO: Try to remove the cookies and see if redirect still works
// TODO: Check so all URL are scraped and not hard coded
function getSuitableBookings(url, movies) {
    return new Promise(function(resolve, reject) {
        let options = {
            url: url + "/login",
            jar: cookieJar,
            followAllRedirects: true,
            form: {
                username: "zeke",
                password: "coys"
            }
        }

        request.post(options).then(function(html) {
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

// TODO: Fix user input. Kolla på att använda en listener med callback
function askForBookingTable(bookings) {
    return new Promise(function(resolve, reject) {
        prompt("Alternative: ").then(function(answer) {
            if (answer < 1) {
                resolve(null)
            } else {
                resolve(bookings[answer - 1])
            }
        })
    })


    return inquirer.prompt("Alternative: ").then(function(answer) {

    })
}

function bookTable(booking) {
    return new Promise(function(resolve, reject) {
        let choice = booking[0]
        console.log(index)

        console.log("---------------------------")
        console.dir(choice)
        console.log("---------------------------")
        resolve(choice)
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

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n)
}
