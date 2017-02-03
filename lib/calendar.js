"use strict"

module.exports = {
    getAllFriends: getAllFriends,
    findSuitableDates: findSuitableDates,
    getLinks: getLinks
}

const request = require("request-promise")
const cheerio = require("cheerio")

let friends = []

function getAllFriends(urls) {
    return new Promise(function(resolve, reject) {
        let promises = []
        friends = []

        urls.forEach(function(url) {
            promises.push(analyseCalendarPage(url))
        })

        Promise.all(promises).then(function() {
            resolve(friends)
        }).catch(function(error) {
            reject(error)
        })
    })
}

function analyseCalendarPage(url) {
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

function findSuitableDates(friends) {
    let days = []

    if (friends[0].friday === friends[1].friday === friends[2].friday) {
        days.push("05")
    } else if (friends[0].saturday === friends[1].saturday === friends[2].saturday) {
        days.push("06")
    } else if (friends[0].sunday === friends[1].sunday === friends[2].sunday) {
        days.push("07")
    }

    return days
}

function getLinks(url) {
    return new Promise(function(resolve, reject) {
        let options = {
            url: url,
            headers: {"User-Agent": "an222yp@student.lnu.se"}
        }

        request(options).then(function(html) {
            const analyzer = cheerio.load(html)

            let links = []
            let tags = analyzer("a")
            let link

            analyzer(tags).each(function(i, tag) {
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
