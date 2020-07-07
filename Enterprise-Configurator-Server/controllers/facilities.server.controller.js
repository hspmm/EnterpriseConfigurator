const models = require('../models');
// var glob = require('glob');
const _ = require('lodash');
var STATUS = require('../utils/status-codes-messages.utils')
var commonUtils = require('../utils/common.utils')
const Sequelize = require('sequelize');
let csc = require('country-state-city').default

async function facilitiesList(req,res,next){
    try{ 
        models.Nodes.findAll({
            raw: true,
            where: {
                IsActive : 1,
                TypeOf : "0"
            }
        }).then( async (facilities)=> {
            let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, facilities) 
            commonUtils.sendResponse(req, res, createdResp, next)
        }).catch( async err => {
            // console.log("err:",err)
            let createdResp = await commonUtils.createResponse(STATUS.ERROR.GET_FACILITIES_LIST,'', err)
            commonUtils.sendResponse(req, res, createdResp, next)
        });
    }catch(error){
        // console.log("error:",error)
        let createdResp = await commonUtils.createResponse(STATUS.ERROR.GET_FACILITIES_LIST,'', error)
        commonUtils.sendResponse(req, res, createdResp, next)
    }
}

/* async function UpdateFacilities(req, res,next){
    if(req.body.id && req.body.data){
        try{
            models.Nodes.update({
                NodeInfo: req.body.data
            }, {
                where: {
                    NodeID: req.body.id
                }
            }).then(async success => {
                // res.status(200).send({ message: "Successfully Updated", parentUrl: process.env.APP_URL })
                let createdResp = await commonUtils.createResponse(STATUS.SUCCESS)
                commonUtils.sendResponse(req, res, createdResp, next)
                // next({ message: STATUS.SUCCESS.MESSAGE.SUCSS_UPDATE_ELEMENT_FROM_HIERARCHY, parentUrl: process.env.APP_URL });
            }).catch(async err => {
                let createdResp = await commonUtils.createResponse(STATUS.ERROR.UPDATE_FACILITIES,'',err)
                commonUtils.sendResponse(req, res, createdResp, next)
            })
        }catch(error){
            let createdResp = await commonUtils.createResponse(STATUS.ERROR.UPDATE_FACILITIESUPDATE_FACILITIES,'',STATUS.ERROR.DB_FETCH[1])
            commonUtils.sendResponse(req, res, createdResp, next)
        }
    }else{
        let createdResp = await commonUtils.createResponse(STATUS.ERROR.UPDATE_FACILITIES,'',"ID or form-data is missing on the body")
        commonUtils.sendResponse(req, res, createdResp, next)
    }
} */


async function hasDupes(array) {
    var hash = Object.create(null);
    return array.some(function (a) {
      return a.Name && (hash[a.Name] || !(hash[a.Name] = true));
    });
}


async function checkallFieldsAvailabilityOfFacility(facilities, importFacilityHeadersArray){
    let checkAllKeysAvailability = [], parentCount = 0
    for(let i=0;i<facilities.length; i++){
        let facility = facilities[i]
        let availableFileds = [], count=0
        console.log("facility.length:",Object.keys(facility).length)
        for(let key in facility){
            let acceptedHeader = importFacilityHeadersArray.find(requiredHeader => (requiredHeader.name).toLowerCase() === (key).toLowerCase() )
            // console.log("acceptedHeader:",acceptedHeader)
            count = count + 1
            if(acceptedHeader){
                availableFileds.push(acceptedHeader)
            }
            if(Object.keys(facility).length == count){               
                if(importFacilityHeadersArray.length == availableFileds.length){
                    checkAllKeysAvailability.push(facility)
                }
                parentCount = parentCount + 1
            }
            

            if(facilities.length == parentCount){
                if(facilities.length == checkAllKeysAvailability.length){
                    return {success:true, response:facilities}
                }else{
                    return {success:false, response:"Few fields were missing in the request"}
                }
            }
        }
    }
}


async function checkTypeOfFacilities(facilities, importFacilityHeadersArray){
    let checkAlldataTypesAvailability = [], parentCount = 0
    for(let i=0;i<facilities.length; i++){
        let facility = facilities[i]
        let acceptedFileds = [], count=0
        console.log("facility.length:",Object.keys(facility).length)
        for(let key in facility){
            let acceptedValueFromCsvFile = importFacilityHeadersArray.find(requiredHeader => ((requiredHeader.name).toLowerCase() === (key).toLowerCase() && ((requiredHeader.type).toLowerCase() === (typeof facility[key]).toLowerCase())))
            // console.log("acceptedHeader:",acceptedHeader)
            count = count + 1
            if(acceptedValueFromCsvFile){
                acceptedFileds.push(acceptedValueFromCsvFile)
            }
            if(Object.keys(facility).length == count){               
                if(importFacilityHeadersArray.length == acceptedFileds.length){
                    checkAlldataTypesAvailability.push(facility)
                }
                parentCount = parentCount + 1
            }
            

            if(facilities.length == parentCount){
                if(facilities.length == checkAlldataTypesAvailability.length){
                    return {success:true, response:facilities}
                }else{
                    return {success:false, response:"wrong formats found in the request"}
                }
            }
        }
    }
}

async function findRequiredHeadersForFacilities(facilities){
    let importFacilityHeadersArray = [
        {name : 'Name', type : 'string'},
        {name : 'AddressLine1', type : 'string'},
        {name : 'AddressLine2', type : 'string'},
        {name : 'AddressLine3', type : 'string'},
        {name : 'City', type : 'string'},
        {name : 'State', type : 'string'},
        {name : 'PostalCode', type : 'string'},
        {name : 'Country', type : 'string'},
        {name : 'IPRange', type : 'string'},
        {name : 'Status', type : 'boolean'},
        {name : 'Contact', type : 'string'},
        {name : 'Email', type : 'string'},
        {name : 'Department', type : 'string'},
        {name : 'Phone', type : 'string'}
    ]
    let requiredFieldsInHeaders = await checkallFieldsAvailabilityOfFacility(facilities, importFacilityHeadersArray)
    // console.log("AFter check requiredFieldsInHeaders:",requiredFieldsInHeaders.success)
    if(requiredFieldsInHeaders.success === true){
        let checkDataTypesOfFacilities = await checkTypeOfFacilities(facilities, importFacilityHeadersArray);
        // console.log("AFter check checkDataTypesOfFacilities:",checkDataTypesOfFacilities.success)
        if(checkDataTypesOfFacilities.success === true){
            return {success:true, response:facilities}
        }else{
            return {success:false, response:checkDataTypesOfFacilities.response}
        }
    }else{
        return {success:false, response:requiredFieldsInHeaders.response}
    }
}


async function assignCountryStateCityCodes(acceptedCsvRecords){
    let allRecords=[]
    let correctRecord = true
    for(let i=0;i<acceptedCsvRecords.length; i++) {
      let record = acceptedCsvRecords[i]
      record = await getCountryId(record)
      if(record){        
        record = await getStateId(record)
        if(record){          
          record = await getCityId(record)
          if(record){
            allRecords.push(record)
          }else{
            correctRecord = false
          }
          
        }else{
          correctRecord = false
        }        
      }else{
        correctRecord = false
      }
      
      
      if(i == acceptedCsvRecords.length-1){
        if(correctRecord == false){
          return correctRecord
        }else{
          return allRecords
        }
      }      
    }
  }

  async function getCountryId(record){
    let countries = await csc.getAllCountries()
    let foundCountry = countries.filter(country=>{
      let recordCountry = (record.Country).replace(/ /g,"")
      let relatedCountryName = (country.name).replace(/ /g,"")
      let relatedCountryId = (country.id).replace(/ /g,"")
      if((recordCountry).toLowerCase() == (relatedCountryName).toLowerCase()){
        return country
      }else if(parseInt(recordCountry) == parseInt(relatedCountryId)){
        return country
      }
    })
    if(foundCountry && foundCountry.length > 0){
      record.Country = foundCountry[0].id
      return record
    }else{
      return false
    }
    
  }

  async function getStateId(record){
    let states = await csc.getStatesOfCountry(record.Country)
    let foundState = states.filter(state=>{
      let recordState = (record.State).replace(/ /g,"")
      let relatedStateName = (state.name).replace(/ /g,"")
      let relatedStateId = (state.id).replace(/ /g,"")
      if((recordState).toLowerCase() == (relatedStateName).toLowerCase()){
        return state
      }else if(parseInt(recordState) == parseInt(relatedStateId)){
        return state
      }
    });
    if(foundState && foundState.length > 0){
      record.State = foundState[0].id
      return record
    }else{
      return false
    }
  }

  async function getCityId(record){
    let cities = await csc.getCitiesOfState(record.State)
    let foundCity = cities.filter(city=>{
      let recordCity = (record.City).replace(/ /g,"")
      let relatedCityName = (city.name).replace(/ /g,"")
      let relatedCityId = (city.id).replace(/ /g,"")
      if((recordCity).toLowerCase() == (relatedCityName).toLowerCase()){
        return city
      }else if(parseInt(recordCity) == parseInt(relatedCityId)){
        return city
      }
    });
    if(foundCity && foundCity.length > 0){
      record.City = foundCity[0].id
      return record
    }else{
      return false
    }
  }

async function importFacilities(req,res,next){
    let facilities = req.body
    let requiredFields = await findRequiredHeadersForFacilities(facilities)
    // console.log("requiredFields :",requiredFields)
    if(requiredFields && requiredFields.success === true){
        if(await hasDupes(facilities)){
            let createdResp = await commonUtils.createResponse(STATUS.ERROR.IMPORT_FACILITIES,'',"Duplicates found")
            commonUtils.sendResponse(req, res, createdResp, next)
        }else{
            let allAcceptedFacilitiesRecords = await assignCountryStateCityCodes(facilities)
            if(_.isEmpty(allAcceptedFacilitiesRecords)){
                let createdResp = await commonUtils.createResponse(STATUS.ERROR.IMPORT_FACILITIES,'',"Country/State/City(s) found wrong in the data")
                commonUtils.sendResponse(req, res, createdResp, next)
            }else{
                try{
                    models.Facilities.bulkCreate(facilities).then( async resp =>{
                        let createdResp = await commonUtils.createResponse(STATUS.SUCCESS,resp)
                        commonUtils.sendResponse(req, res, createdResp, next)
                    }).catch(async err =>{
                        // console.log("ERROR :",err)
                        let createdResp = await commonUtils.createResponse(STATUS.ERROR.IMPORT_FACILITIES,'',STATUS.ERROR.DB_FETCH[1] + ' or facilities schema might be in wrong format')
                        commonUtils.sendResponse(req, res, createdResp, next)
                    })
                }catch(error){
                    // console.log("ERROR1 :",error)
                    let createdResp = await commonUtils.createResponse(STATUS.ERROR.IMPORT_FACILITIES,'',STATUS.ERROR.DB_FETCH[1])
                    commonUtils.sendResponse(req, res, createdResp, next)
                }
            }
        }
    }else{
        let resp = requiredFields ? requiredFields.response : 'Required fileds were not found or wrong formats found in the request'
        let createdResp = await commonUtils.createResponse(STATUS.ERROR.IMPORT_FACILITIES,'',resp)
        commonUtils.sendResponse(req, res, createdResp, next) 
    }
}


async function getImportFacilities(req,res,next){
    try{
        models.Facilities.findAll({
            where: {
                IsActive: true
            }
        }).then(async resp =>{
            let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, resp)
            commonUtils.sendResponse(req, res, createdResp, next)
        }).catch(async err =>{
            console.log("ERROR :",err)
            let createdResp = await commonUtils.createResponse(STATUS.ERROR.GET_IMPORTED_FACILITIES,'',STATUS.ERROR.DB_FETCH[1])
            commonUtils.sendResponse(req, res, createdResp, next)
        })
    }catch(error){
        console.log("ERROR1 :",error)
        let createdResp = await commonUtils.createResponse(STATUS.ERROR.GET_IMPORTED_FACILITIES,'',STATUS.ERROR.DB_FETCH[1])
        commonUtils.sendResponse(req, res, createdResp, next)
    }

}

/* async function getFacilityType(){
    try{
        return models.Very_New_Hierarchy_levels.findAll({raw:true}).then(async levels =>{
            // console.log("levels:",levels)
            levels = levels && levels.length>0 ? levels : []
            if(!(_.isEmpty(levels))){
                levels = levels[0].LevelData ? JSON.parse(levels[0].LevelData) : []
                if(!(_.isEmpty(levels))){
                    levels = await sortHierarchyLevels(levels)
                    return {success: true, response: levels[levels.length-1]}
                }
            }
            //return {success: true, response: facilities}
        }).catch(err =>{
            return {success: false, response: err}
        })
    }catch(error){
        return {success: false, response: error}
    }

}

async function sortHierarchyLevels(hierarchyLevels){
    return hierarchyLevels.sort((n1,n2) => {
        if (n1.LevelType > n2.LevelType) {
            return 1;
        }
    
        if (n1.LevelType < n2.LevelType) {
            return -1;
        }
    
        return 0;
      });
} */




/* exports.addMednetToFacilities = function(req,res,next){
    console.log("Add mednet under facilities:",req.body)

    let nodeId = req.body.id
    let facilities = req.body.facilities
    try{
        models.Nodes.findOne({
            raw: true,
            where: {
                NodeID: nodeId
            }
        }).then( function (requestedMednetNode) {
            if(facilities && facilities.length > 0){
                addMednetundeFacilities(facilities,requestedMednetNode,0,req, res,next)
            }
            //iterateFacilities(requestedMednetNode,facilities)
            //res.status(200).send(requestedMednetNode)
        }).catch(async err => {
            let createdResp = commonUtils.createResponse(STATUS.ERROR.ADD_MEDNET_FACILITIES,'', err)
            commonUtils.sendResponse(req, res, createdResp, next)
        });
    }catch{
        let createdResp = commonUtils.createResponse(STATUS.ERROR.ADD_MEDNET_FACILITIES,'', STATUS.ERROR.DB_FETCH[1])
        commonUtils.sendResponse(req, res, createdResp, next)
    }
}


function addMednetundeFacilities(facilities,requestedMednetNode,index,req, res,next){
    let facility = facilitiesp[index]

    let mednetNode = {
        NodeName: requestedMednetNode.NodeName,
        NodeShartName :  requestedMednetNode.NodeName,
        ParentID : facility.NodeID,
        NodeType : requestedMednetNode.NodeType,
        TypeOf : requestedMednetNode.TypeOf,
        PluginID : requestedMednetNode.PluginID,
        Data : requestedMednetNode.Data,
        CreatedBy : requestedMednetNode.CreatedBy,
        ModifyBy : requestedMednetNode.ModifyBy,
        IsActive : requestedMednetNode.IsActive
    }

    try{
        models.Nodes.create(mednetNode).then(success => { 
            if(facilities.length-1 > index){
                index = index + 1
                addMednetundeFacilities(facilities,requestedMednetNode,index,req, res,next)
            }else{
                let createdResp = commonUtils.createResponse(STATUS.SUCCESS)
                commonUtils.sendResponse(req, res, createdResp, next)
            }
        }).catch(err => {
            if(facilities.length-1 > index){
                index = index + 1
                addMednetundeFacilities(facilities,requestedMednetNode,index,req, res,next)
            }else{
                let createdResp = commonUtils.createResponse(STATUS.ERROR.ADD_MEDNET_FACILITIES,'', {message: 'Few facilities not update'})
                commonUtils.sendResponse(req, res, createdResp, next)
            }
        })
    }catch(error){
        if(facilities.length-1 > index){
            index = index + 1
            addMednetundeFacilities(facilities,requestedMednetNode,index,req, res,next)
        }else{
            let createdResp = commonUtils.createResponse(STATUS.ERROR.ADD_MEDNET_FACILITIES,'', {message: 'Few facilities not update'})
            commonUtils.sendResponse(req, res, createdResp, next)
        }
    }

} */


module.exports = {
    facilitiesList : facilitiesList,
    // UpdateFacilities : UpdateFacilities,
    importFacilities : importFacilities,
    getImportFacilities : getImportFacilities
}