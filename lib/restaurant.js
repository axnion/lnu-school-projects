"use strict"

module.exports = {
    getAvailableBookings: getAvailableBookings
}

const request = require("request-promise")
const cheerio = require("cheerio")

// TODO: Scrape the form to see the action link
function getAvailableBookings(url) {
    return new Promise(function(resolve, reject) {
        request.post({url: url + "/login", jar: true, followAllRedirects: true, form: {username: "zeke", password: "coys"}}).then(function(html) {
            console.log(html)
            resolve(findBookingAlternatives(html))
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
    return {
        day: str.substr(0, 3),
        from: str.substr(3, 2),
        to: str.substr(5, 2)
    }
}
