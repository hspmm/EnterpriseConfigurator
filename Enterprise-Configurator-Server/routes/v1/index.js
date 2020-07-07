const express = require('express')
const router = express.Router();

var hierarchyRoutes = require('./heirarchy.routes');
// var additionalPropertiesRoutes = require('./additionalProperties.routes');
var authenticationRoutes = require('./authentication.routes');
var pluginRoutes = require('./plugins.routes');
var dbRoutes = require('./db.routes');
var facilitiesRoutes = require('./facilities.routes');
var SharedRoutes = require('./shared.routes');

var pluginApiRoutes = require('./additional.routes');
// var applicationRoutes = require('./application.routes');

router.use('/plugin', pluginApiRoutes);

router.use('/hierarchy', hierarchyRoutes);

router.use('/user', authenticationRoutes);

router.use('/plugins', pluginRoutes);

router.use('/db', dbRoutes);

router.use('/server', dbRoutes);

router.use('/facilities', facilitiesRoutes);

router.use('/logs', SharedRoutes);

// router.use('/additionalproperties', additionalPropertiesRoutes);

// router.use('/application', applicationRoutes);


module.exports = router;