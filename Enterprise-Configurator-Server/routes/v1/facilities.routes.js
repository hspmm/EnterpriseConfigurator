

const express = require('express')
const router = express.Router();
const validate = require('../../validators/validate');
const utils = require('../../utils/check.utils')

var facilities = require('../../controllers/facilities.server.controller');


router.route('/list')
    .get(facilities.facilitiesList);


router.route('/list/import')
    .get(facilities.getImportFacilities)
    .post([validate.checkFacilityPrivileges, utils.facility.checkFacilityImportBody],facilities.importFacilities);

// Below route(/update) code commented for this version
/* router.route('/update') 
    .put(facilities.UpdateFacilities); */

/* router.route('/list/disable')
    .put(facilities.disableFacility); */

/* router.route('/add/mednet')
    .post([utils.facility.checkRequiredFieldsInBody],facilities.addMednetToFacilities); */


module.exports = router;