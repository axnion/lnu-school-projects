"use strict"

const request = require("request-promise")
const cheerio = require("cheerio")

// TODO: Validate argument so it's a valid URI
// TODO: Check so the protocol is specified. HTTP should always be included
let frontPage = process.argv[2]
let root = "http://" + frontPage.split("/")[2]

let calendar
let cinema
let restaurant

getLinks(frontPage).then(function(links) {
    calendar = links[0]
    cinema = links[1]
    restaurant = links[2]

    return getLinks(calendar)
}).then(function(links) {
    return Promise.all(function() {
        let promises = []

        links.forEach(function(link) {
            promises.push(analyseCalendarPage(link))
        })

        return promises
    })
}).catch(function(error) {
    console.log(error)
})

function analyseCalendarPage(url) {
    return new Promise(function(resolve, reject) {
        console.log(url)
        resolve()
    })
}

function getLinks(url) {
    return new Promise(function(resolve, reject) {
        request(url).then(function(html) {
            let links = []
            const analyzer = cheerio.load(html)
            let tags = analyzer("a")
            let link

            analyzer(tags).each(function(i, tag) {
                link = analyzer(tag).attr("href")

                if(link.charAt(0) === "/") {
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
