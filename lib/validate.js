"use strict"

module.exports = {
    url: url
}

const request = require("request-promise")

/**
* Validates the url by checking if the protocol http if provided. It then also tries to send a
request to the url and if there is a problem the reject method is called, if not resolve is called.
*/
function url(url) {
    return new Promise(function(resolve, reject) {
        if (url.substr(0, 4) !== "http") {
            reject("Could not understand protocol. Please specify the protocol in the URL (http://)")
        }

        request(url).then(function() {
            resolve()
        }).catch(function(error) {
            reject("Problem with URL\n" + error)
        })
    })
}
