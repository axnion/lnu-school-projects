const Controller = require('../../lib/controller');
const userFacade = require('./facade');

class UserController extends Controller {

    registerUser(req, res, next) {
        let input = JSON.parse(req.body.text, (key, value) => {
            return value;
        });
        input.slackUser = req.body.user_name;

        const output = {
            "text": "You have been successfully registered"
        };

        console.log(req.body);
        console.log(input);

        userFacade.create(input).then();

        userFacade
            .create(input)
            .then(user => {
                console.log(user);
                return res.status(201).json(output);
            })
            .catch(err => res.status(500).json({"text":"A server error has occurred please try again later"}));


        //return res.status(201).json(output);
    }

}

module.exports = new UserController(userFacade);