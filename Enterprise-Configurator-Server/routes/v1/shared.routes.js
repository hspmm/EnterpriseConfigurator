const express = require('express')
const router = express.Router();

// var plugins = require('../../controllers/plugins.server.controller');
var Eclogs = require('../../controllers/ec-logs.server.controller');

// router.route('/register')
//     .post(plugins.registerApplicationsWithMsas);


router.route('/error')
    .get(Eclogs.exportErrorLogs)

router.route('/ecserver')
    .get(Eclogs.exportEcServerLogs)

router.route('/global')
    .get(Eclogs.exportGlobalLogs)

module.exports = router;