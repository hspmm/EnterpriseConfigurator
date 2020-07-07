const express = require('express')
const router = express.Router();
const validate = require('../../validators/validate');
const utils = require('../../utils/check.utils')

var hierarchy = require('../../controllers/heirarchy.server.controller');


router.route('/')
    // .get(validate.user.requiresLogin,validate.user.checkAccesstoken,hierarchy.getHierarchy)
    // .post([validate.user.requiresLogin,validate.user.checkAccesstoken,utils.hierarchy.checkRequiredFieldsInBody],hierarchy.createHierarchy);
    .get(hierarchy.getHierarchy);

router.route('/node/add')
    .post([validate.checkAddHierarchyPrivileges, utils.hierarchy.checkBodyOfHierarchyNodeCreation],hierarchy.saveToHierarchy);
    
router.route('/node/add/bulk')
    .post(hierarchy.createHierarchyNodesInBulk);

router.route('/node/update')
    // .put([utils.hierarchy.checkHierarchyNodeUpdate],hierarchy.updateHierarchyNode);
    .put([validate.checkUpdateHierarchyPrivileges, utils.hierarchy.checkHierarchyNodeUpdate],hierarchy.updateHierarchyNodeToDB);

router.route('/node/delete/:uid?')
    .delete([validate.checkDeleteHierarchyPrivileges, utils.hierarchy.checkBodyOfDeleteHierarchyNode],hierarchy.deleteHierarchyNode);







router.route('/node/element/add')
    // .post([validate.plugin.checkNameInHeaders],heirarchy.addElementToHierarchy);
    // .post([utils.plugin.checkNameInHeaders,utils.plugin.checkRequiredFieldsInBody], hierarchy.addElementToHierarchyEXAMPLE);
    // .post([utils.plugin.checkNameInHeaders,utils.plugin.checkRequiredFieldsInBody], hierarchy.addElementToHierarchy);
    .post([validate.checkAddHierarchyPrivileges, utils.plugin.checkPluginNameInHeaders,utils.hierarchy.checkBodyOfAddElement], hierarchy.addElementToHierarchyNode);

router.route('/node/element/:uid?')
    .get([utils.plugin.checkPluginNameInHeaders,utils.hierarchy.checkIdInParamsOfGetElement],hierarchy.getHierarchyNodeElement);


router.route('/node/element/update')
    .put([validate.checkUpdateHierarchyPrivileges, utils.plugin.checkPluginNameInHeaders,utils.hierarchy.checkBodyOfAddElement], hierarchy.updateHierarchyElementById);


router.route('/node/update/parentId')
    .put(hierarchy.updateparentId);


router.route('/node/element/delete')
    .delete([validate.checkDeleteHierarchyPrivileges, utils.plugin.checkPluginNameInHeaders,utils.hierarchy.checkBodyOfRemoveElement],hierarchy.deleteHierarchyElement);

/* router.route('/update/nodetype')
    .put(hierarchy.updateHierarchyNodeType); */

/* router.route('/removeelement')
    .put([utils.hierarchy.checkBodyOfDeleteHierarchyNode],hierarchy.removeElementFromHierarchy); */





router.route('/hierarchyLevel')
    .get(hierarchy.getHierarchyLevel)
    .post([validate.checkHierarchyLevelsPrivileges, utils.hierarchy.checkCreateHierarchyLevels],hierarchy.createHierarchyLevel)
    .put([validate.checkHierarchyLevelsPrivileges,  utils.hierarchy.checkUpdateHierarchyLevels],hierarchy.updateHierarchyLevel);

router.route('/tree')
    .get(hierarchy.getHierarchyTree);

/* router.route('/fetch/:id?')
    .get(hierarchy.getAdditionalProperties); */



module.exports = router;