
var heirarchy = require('../controllers/heirarchy.server.controller');
var plugins = require('../controllers/plugins.server.controller');
var user = require('../controllers/users.server.controller');
var validate = require('../validators/validate');
const express = require('express')
const router = express.Router();

/********* Authentication Routes ***************/
router.route('/login')
    .post(user.login);

/********* Hierarchy Routes ***************/
router.route('/heirarchy')
    .get(validate.user.requiresLogin,validate.user.checkAccesstoken,heirarchy.read)
    .post(validate.user.requiresLogin,validate.user.checkAccesstoken,heirarchy.add);

router.route('/heirarchy/addelement')
    .post(heirarchy.addElement);

router.route('/heirarchy/update')
    .put(heirarchy.updateNode);

router.route('/heirarchy/removeelement')
    .put(heirarchy.removeElement);

router.route('/heirarchy/getelementdata/:id')
    .get(heirarchy.getElement);

router.route('/heirarchy/hierarchyLevel')
    .get(heirarchy.getHierarchyLevel)
    .post(heirarchy.saveHierarchyLevel)
    .put(heirarchy.updateHierarchyLevel);


/********* Plugin Routes ***************/
router.route('/plugins')
    .get(plugins.allRegisteredPluginList)
    


router.route('/plugins/detect')
    .get(plugins.dectectListOfPlugins)

router.route('/plugins/:id')
    .get(plugins.pluginById)


/********* Db connection Routes ***************/
router.route('/dbconnectioninfo')
    .get(validate.user.requiresLogin,validate.user.checkAccesstoken,user.dbConnectionInfo);

module.exports = router;