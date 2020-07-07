const express = require('express')
const router = express.Router();

var rehost = require('../../controllers/rehost.server.controller');

router.route('/*')
    .get(rehost.redirectionApi)
    .post(rehost.redirectionApi)
    .put(rehost.redirectionApi)
    .delete(rehost.redirectionApi);
    // .get(rehost.redirectApi);

module.exports = router;