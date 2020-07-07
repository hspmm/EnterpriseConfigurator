const express = require('express');
const router = express.Router();
var plugins = require('../../controllers/plugins.server.controller');
const utils = require('../../utils/check.utils') ;
const validate = require('../../validators/validate') ;


/* router.route('/')
    .get(plugins.allRegisteredPluginList); */

    // privileges
router.route('/detect')
    .get(plugins.dectectListOfPlugins);


router.route('/services/activate')
    .put([validate.checkPluginServicesPrivileges, utils.plugin.checkPluginServicesEnableDisableBody],plugins.enableAndDisablePluginServices);

router.route('/services/restart/all')
    .get([validate.checkPluginServicesPrivileges],plugins.restartAllPluginServices);

router.route('/services/restart/:uid?')
    .get([validate.checkPluginServicesPrivileges, utils.plugin.checkPluginUidInParams],plugins.restartinvidualPluginServices);


router.route('/licensemanager/fetch')
    .get(plugins.getLicenseManagerInfo);


router.route('/notificationmanager/url')
    .get(plugins.getNotificationManagerUrl);


router.route('/:id')
    .get(plugins.getRegisteredpluginById);


module.exports = router;