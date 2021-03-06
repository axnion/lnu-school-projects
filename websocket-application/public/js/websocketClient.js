var socket = io()

function watch(button, repo) {
    button.remove()
    socket.emit("addWatch", repo)
}

socket.on("closed", function(data) {
    removeIssue(data)
    createNotification(data)
})

socket.on("opened", function(data) {
    addIssue(data)
    createNotification(data)
})

socket.on("reopened", function(data) {
    addIssue(data)
    createNotification(data)
})

socket.on("created", function(data) {
    updateIssue(data)
    createNotification(data)
})

socket.on("deleted", function(data) {
    updateIssue(data)
    createNotification(data)
})

socket.on("edited", function(data) {
    updateIssue(data)
    createNotification(data)
})

socket.on("addRepo", function(repo) {
    let ul = document.getElementById("watchRepos")
    let html = "<div class=\"repo\">"
    html += "<h4>" + repo.name + "</h4>"
    html += "<ul id=\"" + repo.name + "\">"
    repo.issues.forEach(function(issue) {
        html += "<li id=\"" + repo.name + issue.id + "\">"
        html += "<div class=\"issue\">"
        html += "<h4><a href=\"" + issue.url + "\">Issue #" + issue.number + " - " + issue.title + "</a></h4>"
        html += "<p class=\"date\">" + issue.user.username
        html += "<p class=\"date\">Comments: " + issue.comments
        html += "<p class=\"date\">" + issue.createdAt
        html += "<p class=\"date\">" + issue.updatedAt
        html += "</li>"
    })

    html += "</ul>"
    html += "</div>"

    ul.innerHTML = html + ul.innerHTML
})

function createNotification(data) {
    let ul = document.getElementById("notifications")
    let notification = "<li class=\"notification\">"
    notification += "<h4>" + data.repo + "#" + data.number + "</h4>"
    notification += "<img src=\"" + data.user.avatar + "\">"

    switch (data.action) {
        case "closed":
            notification += "<p class=\"action\">Closed Issue"
            break
        case "opened":
            notification += "<p class=\"action\">Opened Issue"
            break
        case "reopened":
            notification += "<p class=\"action\">Reopened Issue"
            break
        case "created":
            notification += "<p class=\"action\">Commented"
            break
        case "deleted":
            notification += "<p class=\"action\">Removed Comment"
            break
        case "edited":
            notification += "<p class=\"action\">Edited Comment"
            break
    }

    notification += "<p><b>" + data.user.username + "</b>"
    ul.innerHTML = notification + "</li>" + ul.innerHTML
}

function updateIssue(data) {
    try {
        removeIssue(data)
    } catch (err) {
        return
    }

    addIssue(data)
}

function removeIssue(data) {
    let element = document.getElementById(data.repo + data.id)
    element.parentNode.removeChild(element)
}

function addIssue(data) {
    let ul = document.getElementById(data.repo)
    let html = "<li id=\"" + data.repo + data.id + "\">"
    html += "<div class=\"issue\">"
    html += "<h4><a href=\"" + data.url + "\">Issue #" + data.number + " - " + data.title + "</a></h4>"
    html += "<p class=\"date\">" + data.user.username
    html += "<p class=\"date\">Comments: " + data.comments
    html += "<p class=\"date\">" + data.createdAt
    html += "<p class=\"date\">" + data.updatedAt
    html += "</li>"

    ul.innerHTML = html + ul.innerHTML
}
