"use strict"

module.exports = {
    getSuitableBookings: getSuitableBookings,
    askForBookingTable: askForBookingTable,
    bookTable: bookTable
}

const request = require("request-promise")
const cheerio = require("cheerio")
const prompt = require("prompt-promise")

let cookieJar = request.jar()

/**
 Takes the url to the restaurant page and an array of movies. It then calls on
 findBookingAlternatives and findMatchingMoviesAndBookings to find bookings suitable to the movies
 provided as argument. If matches are found they are put as arguments in the resolve method. If no
 matches are found then the reject method is called.
*/
function getSuitableBookings(url, movies) {
    return new Promise(function(resolve, reject) {
        login(url).then(function(response) {
            let html = response.body
            let availableBookings = findBookingAlternatives(html)
            let matchingBookings = findMatchingMoviesAndBookings(availableBookings, movies)

            if (matchingBookings.length < 1) {
                reject("No matching restaurant bookings")
            } else {
                resolve(matchingBookings)
            }
        }).catch(function(error) {
            reject(error)
        })
    })
}

/**
 The function takes the array of booking and promts the user to choose one of the bookings. The
 input is validated so it is numeric and not out of range because then the reject method os called
 with the reason. If the input is valid the resolve method is called with the choosen booking.
*/
function askForBookingTable(bookings) {
    return new Promise(function(resolve, reject) {
        prompt("Alternative: ").then(function(answer) {
            if (isNaN(answer) || Number(answer) > bookings.length) {
                reject("That was not a valid alternative")
            } else if (answer < 1) {
                reject("No table was booked")
            } else {
                resolve(bookings[answer - 1])
            }
        }).catch(function(error) {
            reject(error)
        })
    })
}

/**
 Takes the booking object we want to book, and the url to the restaurant page and returns a promise.
 The function logs in to the restaurant page and a post request with the booking value and the csrf
 token is sent to the booking page. If all goes well the promise resolves with the booking object.
*/
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

/**
 Takes a string containing html code and analyzes it for booking alternatives
*/
function findBookingAlternatives(html) {
    let bookings = []
    let analyzer = cheerio.load(html)
    let inputs = analyzer("input[name=group1]")

    analyzer(inputs).each(function(i, el) {
        bookings.push(parseBooking(analyzer(el).val()))
    })

    return bookings
}

/**
 Takes the string value from a booking and converts it to an objects which easier describes the
 booking.
*/
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

/**
 Takes an array with table bookings and an array with movies. The function then matches which table
 bookings starts two hours after a movie ends. An array of objects containing the day, movie, and
 table booking is returned.
*/
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

/**
 Takes a url to the login page to the restaurant. It then sends a post request to with the login
 credentials. The cookies are saved in the global cookieJar.
*/
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

/**
 Takes a string with html, analyzes the content to find the csrf token. Return the token.
*/
function getCsrfToken(html) {
    let analyzer = cheerio.load(html)
    return analyzer("input[name=csrf_token]").val()
}
