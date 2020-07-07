const express = require('express')
const router = express.Router();
const utils = require('../../utils/check.utils')
const validate = require('../../validators/validate')

var user = require('../../controllers/users.server.controller');


// router.route('/authtypes')
//     .get(user.getAuthTypes);


router.route('/login')
    .post([utils.authentication.checkRequiredFields],user.login);


router.route('/logout')
    .delete([validate.checkReqHeaders],user.logout);
    // .post([utils.authentication.checkRequiredFields],user.authentication);


router.route('/valid')
    .get([validate.checkReqHeaders],user.checkValidUser);
    // .post([utils.authentication.checkRequiredFields],user.authentication);


module.exports = router;