"use strict"

module.exports = {
    getSuitableBookings: getSuitableBookings,
    askForBookingTable, askForBookingTable,
    bookTable, bookTable
}

const request = require("request-promise")
const cheerio = require("cheerio")
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
            url = response.request.uri.href
            options = {
                url: response.request.uri.href,
                jar: cookieJar,
                headers: {"User-Agent": "an222yp@student.lnu.se"},
                form: {group1: booking.table.value, csrf_token: getCsrfToken(response.body)}
            }

            return request.post(options)
        }).then(function() {
            resolve(booking)
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
                let day = ""
                if (movie.day === "05") {
                    day = "Friday"
                } else if (movie.day === "06") {
                    day = "Saturday"
                } else if (movie.day === "07") {
                    day = "Sunday"
                }

                options.push({
                    dayId: movie.day,
                    day: day,
                    movie: {
                        id: movie.movie,
                        title: movie.title,
                        startTime: movie.time
                    },
                    table: {
                        id: booking.value,
                        from: booking.from + ":00",
                        to: booking.to + ":00"
                    }
                })
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

function getCsrfToken(html) {
    let analyzer = cheerio.load(html)
    return analyzer("input[name=csrf_token]").val()
}

function getFirstHeader(html) {
    let analyzer = cheerio.load(html)
    return analyzer("h1").first().text()
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n)
}
