"use strict"

module.exports = {
    createWebhook: createWebhook,
    getIssues: getIssues,
    removeWebhooks: removeWebhooks,
    getRepositories: getRepositories
}

const request   = require("request-promise")
const linkParser    = require("parse-link-header")

function createWebhook(repo, id) {
    let options = {
        url: "https://api.github.com/repos/" + repo + "/hooks",
        method: "POST",
        headers: {
            Host: "api.github.com",
            Authorization: "Basic " + new Buffer(
                process.env.USER + ":" + process.env.API
            ).toString("base64"),
            "User-Agent": process.env.USER_AGENT
        },
        body: JSON.stringify({
            name: "web",
            config: {
                url: process.env.URL + "/webhook/" + id,
                content_type: "json",
                secret: process.env.WEBHOOK
            },
            events: [
                "issues",
                "issue_comment"
            ],
            active: true
        })
    }

    request(options)
}

function removeWebhooks(id) {
    getRepositories("https://api.github.com/user/repos").then(function(repos) {
        let promises = []
        repos.forEach(function(repo) {
            promises.push(getWebhooks(repo))
        })

        return Promise.all(promises)
    }).then(function(webhooks) {
        let webhooksData = []
        let validWebhooks = []
        webhooks.forEach(function(el) {
            if (el !== "[]") {
                JSON.parse(el).forEach(function(webhook) {
                    webhooksData.push({
                        apiURL: webhook.url,
                        callbackURL: webhook.config.url
                    })
                })
            }
        })

        webhooksData.forEach(function(webhook) {
            let callback = webhook.callbackURL
            if (callback) {
                let webhookId = callback.substr(callback.lastIndexOf("/") + 1)

                if (webhookId === id) {
                    validWebhooks.push(webhook)
                }
            }
        })

        validWebhooks.forEach(function(webhook) {
            let options = {
                url: webhook.apiURL,
                method: "DELETE",
                headers: {
                    Host: "api.github.com",
                    Authorization: "Basic " + new Buffer(
                        process.env.USER + ":" + process.env.API
                    ).toString("base64"),
                    "User-Agent": process.env.USER_AGENT
                }
            }

            request(options)
        })
    }).catch(function(err) {
        console.log(err)
    })
}

function getIssues(repo) {
    return new Promise(function(resolve, reject) {
        let options = {
            url: "https://api.github.com/repos/" + repo + "/issues",
            headers: {
                Host: "api.github.com",
                Authorization: "Basic " + new Buffer(
                    process.env.USER + ":" + process.env.API
                ).toString("base64"),
                "User-Agent": process.env.USER_AGENT
            }
        }

        request(options).then(function(body) {
            let issues = JSON.parse(body).map(function(issue) {
                return {
                    id: issue.id,
                    repo: repo,
                    url: issue.html_url,
                    title: issue.title,
                    number: issue.number,
                    comments: issue.comments,
                    user: {
                        username: issue.user.login,
                        avatar: issue.user.avatar_url
                    },
                    createdAt: issue.created_at,
                    updatedAt: issue.updated_at
                }
            })

            resolve(issues)
        }).catch(function(err) {
            reject(err)
        })
    })
}

function getRepositories(url) {
    return new Promise(function(resolve, reject) {
        let options = {
            url: url,
            headers: {
                Host: "api.github.com",
                Authorization: "Basic " + new Buffer(
                    process.env.USER + ":" + process.env.API
                ).toString("base64"),
                "User-Agent": process.env.USER_AGENT
            },
            resolveWithFullResponse: true
        }

        request(options).then(function(res) {
            let link = linkParser(res.headers.link)
            if (link.next) {
                getRepositories(link.next.url).then(function(repos) {
                    let allRepos = repos
                    allRepos =  allRepos.concat(JSON.parse(res.body))
                    resolve(mapRepos(allRepos))
                }).catch(function(err) {
                    throw err
                })
            } else {
                resolve(mapRepos(JSON.parse(res.body)))
            }
        }).catch(function(err) {
            reject(err)
        })
    })
}

function getWebhooks(repo) {
    return new Promise(function(resolve, reject) {
        let options = {
            url: "https://api.github.com/repos/" + repo.full_name + "/hooks",
            headers: {
                Host: "api.github.com",
                Authorization: "Basic " + new Buffer(
                    process.env.USER + ":" + process.env.API
                ).toString("base64"),
                "User-Agent": process.env.USER_AGENT
            }
        }

        request(options).then(function(webhooks) {
            resolve(webhooks)
        }).catch(function(err) {
            resolve("[]")
        })
    })
}

// function getWebhooks(repos) {
//     return new Promise(function(resolve, reject) {
//         let promises = []
//         let allHooks = []
//
//         repos.forEach(function(repo) {
//             let options = {
//                 url: "https://api.github.com/repos/" + repo.full_name + "/hooks",
//                 headers: {
//                     Host: "api.github.com",
//                     Authorization: "Basic " + new Buffer(
//                         process.env.USER + ":" + process.env.API
//                     ).toString("base64"),
//                     "User-Agent": process.env.USER_AGENT
//                 }
//             }
//
//             let promise = request(options).then(function(webhooks) {
//                 allHooks = allHooks.concat(webhooks)
//             }).catch(function(err) {
//
//             })
//
//             promises.push(promise)
//         })
//
//         Promise.all(promises).then(function() {
//             resolve(allHooks)
//         }).catch(function(err) {
//             reject(err)
//         })
//     })
// }

function mapRepos(repos) {
    return repos.map(function(repo) {
        return {
            full_name: repo.full_name
        }
    })
}
