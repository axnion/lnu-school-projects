# slackapp

## Api Specification

If you wish to test the slack routes send the information in req.body.text

###Create exam

Slack Command
```bash
/createexamtest {"date": "2017-12-30", "name": "exam", "duration": 30, "timeSlots": 20}
```
__POST /exam/create__

Body 
```json
{ "date": "2017-12-30", 
  "name": "exam", 
  "duration": 30, 
  "timeSlots": 20
}
```

###List exam

Slack Command
```bash
/showexam
```

__IMPORTANT__ the command /showexam will be expanded to get a specific exam by 
name like the example below 

```bash
/showexam examName
```

__POST /exam/get__

Body 
```bash
  Input is empty right now. Exept for the slack information
```

__IMPORTANT__ When calling this route req.body.channel_name needs to be set to the 
channel name for the desired exam list.

###Helper Routes during development

__/exam__ GET and POST for creating and listing exams

__/exam/:id__ GET, PUT, DELETE for getting, updating or deleting a exam

### Report build status

Slack Command
```bash
No command for this
```

__IMPORTANT__ This route is for Jenkis to signal a successful build

__POST /reportexam__

Body 
```bash
  req.body.buildOk Boolean value true/false
```

### Book Exam

Slack Command
```bash
This is triggered by pushing the bookExam button in slack
```

__IMPORTANT__ This route is trigger by user interaction need to gather more info 
to determine the reburied input from test classes 

__POST /bookexam__

Body 
```bash
  Duno
```

## developing

run locally run using docker-compose:

```bash
sudo docker-compose up
```

the app runs on `localhost:8080`

## production

build the Docker :whale: container and run it:

_you'll likely be consuming mongodb as a service, so make sure you set the env var to connect to it._

```bash
sudo docker build -t <image-name> .
sudo docker run \
  -p <host-port>:8080 \
  -d <image-name> \
  -e MONGO_DB_URI=mongodb://<username>:<password>@<host>:<port> \
  npm run start
```



--------------------------------------------------------------------------------
