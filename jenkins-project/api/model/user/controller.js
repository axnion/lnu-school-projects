const Controller = require('../../lib/controller');
const userFacade = require('./facade');

class UserController extends Controller {

    /**
     *   /register {"lnu":"fw222ek", "github":"wallstedt"} 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    registerUser(req, res, next) {
        let input = JSON.parse(req.body.text, (key, value) => {
            return value;
        });
        input.slackUser = req.body.user_name;

        const output = {
            "text": "You have been successfully registered"
        };

        userFacade
            .createUser(input)
            .then(user => {
                return res.status(201).json(output);
            })
            .catch(err => {
                console.log(err);
                res.status(205).json({ "text": "A server error has occurred please try again later" })
            });
    }

}

module.exports = new UserController(userFacade);