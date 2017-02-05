"use strict"

module.exports = {
    getAllFriends: getAllFriends,
    findCommonDates: findCommonDates,
    getLinks: getLinks
}

const request = require("request-promise")
const cheerio = require("cheerio")

/**
 This function takes an array of urls to each persons calendar page. It returns a promise which
 resolves with an array of friend objects containing the name and a boolean value for each day,
 false if person is unavailable, true if available.
*/
function getAllFriends(urls) {
    return new Promise(function(resolve, reject) {
        let promises = []
        let friends = []

        urls.forEach(function(url) {
            promises.push(analyseCalendarPage(url, friends))
        })

        Promise.all(promises).then(function() {
            resolve(friends)
        }).catch(function(error) {
            reject(error)
        })
    })
}

/**
 Takes url and an array to store all friends. Returns a promise which resolves when a new person is
 added to the friends array, but no arguments are sent though the resolve method.
*/
function analyseCalendarPage(url, friends) {
    return new Promise(function(resolve, reject) {
        let options = {
            url: url,
            headers: {"User-Agent": "an222yp@student.lnu.se"}
        }

        request(options).then(function(html) {
            const analyzer = cheerio.load(html)
            let tags = analyzer("td")

            let friday = analyzer(tags).first().text()
            let saturday = analyzer(tags).first().next().text()
            let sunday = analyzer(tags).first().next().next().text()

            let person = {
                name: analyzer("h2").text(),
                friday: friday.toLowerCase() === "ok",
                saturday: saturday.toLowerCase() === "ok",
                sunday: sunday.toLowerCase() === "ok"
            }

            friends.push(person)

            resolve()

        }).catch(function(error) {
            reject(error)
        })
    })
}

/**
 Takes an array of friend objects. The function goes though the array to find which days all objects
 in the array have in common. Returns an array with the id of all days the friends had in common.
*/
function findCommonDates(friends) {
    let days = []

    let friday = true
    let saturday = true
    let sunday = true

    friends.forEach(function(person) {
        friday = friday && person.friday
        saturday = saturday && person.saturday
        sunday = sunday && person.sunday
    })

    if (friday) {
        days.push("05")
    } else if (saturday) {
        days.push("06")
    } else if (sunday) {
        days.push("07")
    }

    return days
}

/**
 Takes a url and return a promise. The promise resolves with an array containing all links from the
 website.
*/
function getLinks(url) {
    return new Promise(function(resolve, reject) {
        let options = {
            url: url,
            headers: {"User-Agent": "an222yp@student.lnu.se"}
        }

        request(options).then(function(html) {
            let analyzer = cheerio.load(html)
            let links = []
            let link

            analyzer("a").each(function(i, tag) {
                link = analyzer(tag).attr("href")

                if (link.charAt(0) === "/") {
                    link = "http://" + url.split("/")[2] + link
                } else {
                    link = url + "/" + link
                }

                links.push(link)
            })

            resolve(links)
        }).catch(function(error) {
            reject(error)
        })
    })
}
