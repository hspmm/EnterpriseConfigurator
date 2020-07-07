const express = require('express');
const router = express.Router();
// const xmlparser = require('express-xml-bodyparser');


var user = require('../../controllers/users.server.controller');
// var validate = require('../../validators/validate');


/* router.route('/info')
    .get([validate.user.requiresLogin,validate.user.checkAccesstoken],user.dbConnectionInfo);
    // .get(user.dbConnectionInfo);

router.route('/dev/info')
    .get([validate.user.requiresLogin,validate.user.checkAccesstoken],user.dbDevConnectionInfo); */



router.route('/app/info')
    .get(user.getAppConfigInfo);

/* router.route('/restart')
    .get(user.restartServer); */

/* router.route('/details')
    .get(user.serverDetails); */
    


module.exports = router;