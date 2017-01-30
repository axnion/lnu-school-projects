"use strict"

const request = require("request-promise")
const cheerio = require("cheerio")

// TODO: Validate argument so it's a valid URI
// TODO: Check so the protocol is specified. HTTP should always be included
let frontPage = process.argv[2]

let calendar
let cinema
let restaurant

let friends = []

getLinks(frontPage).then(function(links) {
    calendar = links[0]
    cinema = links[1]
    restaurant = links[2]

    return getLinks(calendar)
}).then(function(links) {
    return Promise.all(analyseCalendarPages(links))
}).then(function() {
    console.log(findAvailableDate(friends))
}).catch(function(error) {
    console.log(error)
})

function analyseCalendarPages(urls) {
    let promises = []

    urls.forEach(function(url) {
        promises.push(analyseCalendarPage(url))
    })

    return promises
}

function findAvailableDate(friends) {
    let days = []

    if (friends[0].friday === friends[1].friday === friends[2].friday) {
        days.push("friday")
    } else if (friends[0].saturday === friends[1].saturday === friends[2].saturday) {
        days.push("saturday")
    } else if (friends[0].sunday === friends[1].sunday === friends[2].sunday) {
        days.push("sunday")
    }

    return days
}

function analyseCalendarPage(url) {
    return new Promise(function(resolve, reject) {
        request(url).then(function(html) {
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

function getLinks(url) {
    return new Promise(function(resolve, reject) {
        request(url).then(function(html) {
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
