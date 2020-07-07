const models = require('../models');
const SequelizeOperator = require('sequelize').Op;
var STATUS = require('../utils/status-codes-messages.utils');
var commonUtils = require('../utils/common.utils');
var AppConfig = require('../config/app-config')
const _ = require('lodash');
var ISASctrl = require('./isas.server.controller');
var logger = require('../utils/winston.utils').EnterpriseLogs
var AllDetectedPluginsHashTable = {}
var AllDetectedPluginsConfigInfo = []


/************************************************
 ********* DETECT ALL AVAILABLE PLUGINS *********
*************************************************/
async function detectAllAvailablePlugins(){
  logger.info("[DETECT PLUGINS] :\t DETECTING ALL AVAILABLE PLUGINS")
  return new Promise(async (resolve, reject)=>{
    let listOfavailablePlugins = []
    let availablePlugins = await commonUtils.getDetectedPluginConfigFiles()
    let pluginsLogInfo = {
      acceptedPlugins:[],
      rejectedPlugins:[]
    }
    _.forEach(availablePlugins.acceptedPluginConfigFiles,plugin =>{
      pluginsLogInfo.acceptedPlugins.push(plugin.name)
    })
    _.forEach(availablePlugins.rejectedPluginsConfigFiles,plugin =>{
      pluginsLogInfo.rejectedPlugins.push(plugin.name)
    })
    logger.info("[DETECT PLUGINS] :\t DETECTED PLUGINS :"+JSON.stringify(pluginsLogInfo))
    availablePlugins = availablePlugins.acceptedPluginConfigFiles || []
    if(availablePlugins && availablePlugins.length > 0){

      let allPlugins = await checkPluginStatusAndReturnAllPluginsInfo(availablePlugins, 0)
      listOfavailablePlugins = allPlugins
      AllDetectedPluginsConfigInfo = allPlugins
      resolve(listOfavailablePlugins)
    }
  })
}


/*************************************************************************************
 ********* CHECK DETECTED PLUGINS STATUS AND GET CONFIG INFO FROM THE PLUGINS ********
**************************************************************************************/
async function checkPluginStatusAndReturnAllPluginsInfo(availablePlugins, index) {
  let allPluginsConfigInfo = [];
  let plugin = availablePlugins[index]
  // let pluginStatus = await doIndividualPluginServicesRestart(availablePlugins[index])
  let pluginStatus = await ISASctrl.getPluginsConfigurationDetails(plugin)  
  if (pluginStatus.success === true) {
    logger.info("[DETECT PLUGINS]-["+ plugin.name +"]:\t CONFIGURATION RESPONSE :"+JSON.stringify(pluginStatus.response))
    allPluginsConfigInfo.push(pluginStatus.response)
    if (index < availablePlugins.length - 1) {
      index = index + 1
      let allPlugins = await checkPluginStatusAndReturnAllPluginsInfo(availablePlugins, index)
      allPlugins.forEach((singlePlugin) => {
        allPluginsConfigInfo.push(singlePlugin)
      })
    }
  } else {
    logger.error("[DETECT PLUGINS]-["+ plugin.name +"]:\t CONFIGURATION RESPONSE :"+JSON.stringify(pluginStatus.response))
    // let respOfRemovePluginInfoFromHash
    if( (pluginStatus.success === false) && ((pluginStatus.response.name).toLowerCase() != (AppConfig.securityApp).toLowerCase())){
      let respOfRemovePluginInfoFromHash = await removePluginDataFromHashTableAndDisableInDB(plugin)
    }
    if((index < availablePlugins.length - 1)) {
      index = index + 1
      let allPlugins = await checkPluginStatusAndReturnAllPluginsInfo(availablePlugins, index)
      allPlugins.forEach((singlePlugin) => {
        allPluginsConfigInfo.push(singlePlugin)
      })
    }
  }

  return allPluginsConfigInfo
}


/**************************************************************************************************
 ***** REMOVE EXISTING DATA FORM HASH TABLE AND DISABLE ITS SERVICES IF PLUGIN IS UNAVAILABLE ******
****************************************************************************************************/
async function removePluginDataFromHashTableAndDisableInDB(plugin){
  logger.info("[DETECT PLUGINS]-["+ plugin.name +"]:\t REMOVE PLUGIN DATA FROM HASH TABLE AND DISABLE IN DB")
  let respOfRemoveFromHashTable = await removePluginInfoFromHashTable(plugin) 
  if(respOfRemoveFromHashTable){
    await disablePluginServicesByUniqueName(plugin)
    return true;
  }
}


/********************************************
 **** REMOVE PLUGIN INFO FROM HASH TABLE ****
*********************************************/
async function removePluginInfoFromHashTable(plugin){
  logger.info("[DETECT PLUGINS]-["+ plugin.name +"]:\t REMOVE PLUGIN DATA FROM HASH TABLE")
  for(let key in AllDetectedPluginsHashTable){
    if(AllDetectedPluginsHashTable[key] && ((AllDetectedPluginsHashTable[key].name).toLowerCase() == (plugin.name).toLowerCase())){
      AllDetectedPluginsHashTable[key].servicesEnabled = false
    }
  }
  return true
}


/*************************************************
 ***** DISABLE PLUGIN SERVICES BY UNIQUE NAME*****
**************************************************/
async function disablePluginServicesByUniqueName(plugin){
  try{
    return models.Plugins_Details.update({
      ServicesEnabled : false,
    },{
      where : {
        [SequelizeOperator.or] : [
          {
            name : plugin.name
          },
          {
            PrependUrl : plugin.prependUrl
          }
        ]
      }
    }).then(resp=>{
      logger.info("["+ plugin.name +"]:\t DISABLE PLUGIN SERVICES : SUCCESS")
      return {success: true, response: resp}
    }).catch(error=>{
      logger.error("["+ plugin.name +"]:\t DISABLE PLUGIN SERVICES :"+error)
      return {success: false, response: error}
    })
  }catch(err){
    logger.error("["+ plugin.name +"]:\t DISABLE PLUGIN SERVICES :"+err)
    return {success: false, response: err}
  }
}


/*****************************************
 **** CHECK REQUIRED PLUGINS FOR EC ******
******************************************/
async function checkRequiredPluginsForEC(allDetectedPluginsInfo){
  console.log("## CHECKING REQUIRED PLUGINS FOR EC")
  logger.info("CHECKING REQUIRED PLUGINS FOR EC")
  let listOfAllPlugins = [], requiredPlugins = []
  if(allDetectedPluginsInfo && allDetectedPluginsInfo.length > 0){
    listOfAllPlugins = allDetectedPluginsInfo
  }else if(AllDetectedPluginsConfigInfo && AllDetectedPluginsConfigInfo.length > 0){
    listOfAllPlugins = AllDetectedPluginsConfigInfo
  }
  // else {
  //   let allPlugins = await getListOfPluginsInDB()
  //   listOfAllPlugins = allPlugins.success === true ? allPlugins.response : []
  // }

  let checkForSecurityPlugin = await ISASctrl.checkSecurityPluginAvailability(listOfAllPlugins)
  if(checkForSecurityPlugin){
    console.log("## SECURITY PLUGIN FOUND")
    logger.info("["+ checkForSecurityPlugin.name +"]\t SECURITY PLUGIN FOUND")
    checkForSecurityPlugin.IsLicenced = true
    let storeSecurityPlugin = await checkAndStoreConfigInfoOfPlugins(checkForSecurityPlugin)
    if(storeSecurityPlugin.success === true){
      logger.info("REGISTERING THE EC APPLICATION WITH SECURITY PLUGIN")
      console.log("## REGISTERING THE EC APPLICATION WITH SECURITY PLUGIN")
      let respOfRegisterApp = await registerApplicationWithSecurityPlugin(AppConfig)
      if(respOfRegisterApp && respOfRegisterApp.success === true){
        logger.info("SUCESSFULLY REGISTERED THE APPLICATION WITH SECURITY PLUGIN")
        console.log("## SUCESSFULLY REGISTERED THE APPLICATION WITH SECURITY PLUGIN")
        requiredPlugins.push(checkForSecurityPlugin)
        let checkForLicenseManager = await ISASctrl.CheckLicenseManagerPluginAvailability(listOfAllPlugins)
        if(checkForLicenseManager){
          console.log("## LICENSE MANAGER PLUGIN FOUND")
          logger.info("["+ checkForLicenseManager.name +"]\t LICENSE MANAGER PLUGIN FOUND")
          checkForLicenseManager.IsLicenced = true
          let storeLicenseManagerPlugin = await checkAndStoreConfigInfoOfPlugins(checkForLicenseManager)
          if(storeLicenseManagerPlugin.success === true){
            requiredPlugins.push(checkForLicenseManager)
            return {success: true, response: requiredPlugins}
          }else{
            return {success: false, response: storeLicenseManagerPlugin.response}
          }
        }else{
          console.log("## LICENSE MANAGER PLUGIN NOT FOUND")
          logger.error("LICENSE MANAGER PLUGIN NOT FOUND")
          return {success: false, response: "One of the required plugin, License Manager plugin not found"}
        }
      }else{
        console.log("## FAILED REGISTERED EC APPLICATION WITH SECURITY PLUGIN: ",respOfRegisterApp.response);
        logger.error("FAILED TO REGISTERED THE APPLICATION WITH SECURITY PLUGIN : "+respOfRegisterApp.response)
        return {success : false, response : false}
      }
    }else{
      return {success: false, response: storeSecurityPlugin.response}
    } 
  }else{
    console.log("## SECURITY PLUGIN NOT FOUND")
    logger.error("SECURITY PLUGIN NOT FOUND")
    return {success: false, response: "One of the required plugin, Security plugin not found"}
  }
}


/*********************************************************
 ******** CHECK AND STORE CONFIG DETAILS OF PLUGINS ******
**********************************************************/
async function checkAndStoreConfigInfoOfPlugins(pluginInfo){
  console.log("## CAME TO CHECK AND STORE CONFIG OF PLUGINS :",pluginInfo.name)
  logger.info("["+ pluginInfo.name +"]\t CHECK AND STORE CONFIG OF PLUGINS")
  let isPluginConfigInfo = await ISASctrl.checkPluginConfigDetailsInDB(pluginInfo)
  console.log("## "+pluginInfo.name+" Config Info :",isPluginConfigInfo.response.length > 0 ? 'Found In DB' : 'NotFound In DB')
  let responseOfPluginConfigInfo
  isPluginConfigInfo && isPluginConfigInfo.success === true ? isPluginConfigInfo.response.length == 0 ? responseOfPluginConfigInfo = await savePluginConfigDetails(pluginInfo) 
  : responseOfPluginConfigInfo = await updatePluginConfigDetails(isPluginConfigInfo.response[0],pluginInfo) : {succes:false, response:''}
  console.log("responseOfPluginConfigInfo:",responseOfPluginConfigInfo.success === true ? 'succesfully saved/updated' : 'Failed to save/update')
  return responseOfPluginConfigInfo;
}


/*************************************************
 ********* UPDATE PLUGIN CONFIG DETAILS **********
**************************************************/
async function updatePluginConfigDetails(previousDataOfPluginInfo, currentPluginInfo){
  console.log("## UPDATING PLUGIN CONFIG DETAILS IN DB: ",previousDataOfPluginInfo.Name)
  logger.info("["+ previousDataOfPluginInfo.Name +"]\t UPDATING PLUGIN CONFIG DETAILS IN DB")
  let pluginDetailsSchema = await commonUtils.schemaOfPluginConfigInfo(currentPluginInfo, previousDataOfPluginInfo)
  try{
    return models.Plugins_Details.update(pluginDetailsSchema,{
      where : {
        Uid : previousDataOfPluginInfo.Uid
      }
      // individualHooks: true
    }).then(resp =>{
      logger.info("["+ previousDataOfPluginInfo.Name +"]\t SUCCESSFULLY UPDATED PLUGIN CONFIG DETAILS IN DB")
      return models.Plugins_Details.findOne({
        raw : true,
        where : {          
          [SequelizeOperator.or] : [
            {
              Uid : previousDataOfPluginInfo.Uid
            },
            {
              UniqueName : previousDataOfPluginInfo.UniqueName
            }
          ]
        }
      }).then(plugins =>{
        return { success: true, response: plugins }
      }).catch(err =>{
        return { success: false, response: err }
      })
      
    }).catch(err =>{
      logger.error("["+ previousDataOfPluginInfo.Name +"]\t ERROR UPDATING PLUGIN CONFIG DETAILS IN DB:"+JSON.stringify(err))
      return  { success : false, response : err}
    })
  }catch(error){
    logger.error("["+ previousDataOfPluginInfo.Name +"]\t ERROR UPDATING PLUGIN CONFIG DETAILS IN DB:"+JSON.stringify(error))
    return  { success : false, response : error}
  }
}


/*****************************************************
 ********** SAVE PLUGIN CONFIG DETAILS IN DB *********
******************************************************/
async function savePluginConfigDetails(pluginInfo){
  console.log("## INSERTING PLUGIN CONFIG DETAILS IN DB: ",pluginInfo.name)
  logger.info("["+ pluginInfo.name +"]\t INSERTING PLUGIN CONFIG DETAILS IN DB")
  let pluginDetailsSchema = await commonUtils.schemaOfPluginConfigInfo(pluginInfo)
  try{
    return models.Plugins_Details.create(pluginDetailsSchema).then(resp =>{
      logger.error("["+ pluginInfo.name +"]\t SUCCESSFULLY INSERTED PLUGIN CONFIG DETAILS IN DB:")
      // let getPluginInfo = await getPluginFromDbByID(pluginDetailsSchema.Uid)
      return { success: true, response: resp }
    }).catch(err =>{
      logger.error("["+ pluginInfo.name +"]\t ERROR INSERTING PLUGIN CONFIG DETAILS IN DB: "+JSON.stringify(err))
      return  { success : false, response : err}
    })
  }catch(error){
    logger.error("["+ pluginInfo.name +"]\t ERROR INSERTING PLUGIN CONFIG DETAILS IN DB: "+JSON.stringify(error))
    return  { success : false, response : error}
  }
}


/***************************************************
 *** DO INITIAL STEPS WITH LICENSE MANAGER APP *****
****************************************************/
async function doInitialStepsWithLicenseManager(){
  logger.info("[INITIALSTEPS OF LM] \t STARTED DOING INITAL STEPS WITH LICENSE MANAGER")
  let allPluginsLicenseInformation = await getAllPluginsLicenseInfoFromPortal()
  if(allPluginsLicenseInformation.success === true){
    let licensePluginConfigInfo = await ISASctrl.getLicensePluginConfigInfo()
    // console.log("++++++++++> licensePluginConfigInfo:",licensePluginConfigInfo)
    if(licensePluginConfigInfo){
      logger.info("[INITIALSTEPS OF LM] \t SUCCESS OF GETTING LICENSE MANAGER PLUGIN CONFIG INFO")
      let dumpEcPluginsLicenseInfoToLicenseApp = await dumpEcPluginsLicenseInfoinLIcenseApp(licensePluginConfigInfo,allPluginsLicenseInformation.response)
      if(dumpEcPluginsLicenseInfoToLicenseApp.success === true){
        logger.info("[INITIALSTEPS OF LM] \t SUCCESS OF DUMPING EC PLUGINS LICENSE INFO TO LICENSE APP")
        return { success:true, response : dumpEcPluginsLicenseInfoToLicenseApp.response}
      }else{
        logger.info("[INITIALSTEPS OF LM] \t ERROR OF DUMPING EC PLUGINS LICENSE INFO TO LICENSE APP: "+dumpEcPluginsLicenseInfoToLicenseApp.response)
        return { success:false, response : dumpEcPluginsLicenseInfoToLicenseApp.response}
      }
    }else{
      logger.error("[INITIALSTEPS OF LM] \t LICENSE MANAGE RPLUGIN NOT AVAILABLE IN DB")
      return { success:false, response : "License manager plugin not available in DB"}
    }
  }else{
    logger.error("[INITIALSTEPS OF LM] \t Failed to fetch EC plugins license info from portal")
    return { success:false, response : "Failed to fetch EC plugins license info from portal :"+JSON.stringify(allPluginsLicenseInformation.response)}
  }
  /* let licensePluginConfigInfo = await ISASctrl.getLicensePluginConfigInfo()
  if(licensePluginConfigInfo){
    let postApplicationsDataToLicenseApp = await sendApplicationDataToLicenseApp(licensePluginConfigInfo, licensedApplications)
    if(postApplicationsDataToLicenseApp.success === true){
      let postApplicationFeatures = await sendApplicationFeaturesToLicenseApp(licensePluginConfigInfo, licensedApplicationFeatures)
      if(postApplicationFeatures.success === true){
        return { success:true, response : postApplicationFeatures.response}
      }else{
        return { success:false, response : postApplicationFeatures.response}
      }
    }else{
      return { success:false, response : postApplicationsDataToLicenseApp.response}
    }
  }else{
    return { success:false, response : "License manager plugin not available in detetced plugins(in config files in specified folder path or something wrong in license plugin config.js)"}
  } */

}


/*********************************************************
 ***** DUMP EC PLUGINS LICENSE INFO IN LICENSE APP *******
***********************************************************/
async function dumpEcPluginsLicenseInfoinLIcenseApp(licensePluginConfigInfo, pluginsLicenseInfo){
  // let createApplicationOfLicenseReqBody = await commonUtils.createDumpEcPluginsInfoReqBody(pluginsLicenseInfo.item);
  // if(createApplicationOfLicenseReqBody.success === true){
    let createDumpEcPluginslIceseInfoApi = await commonUtils.licenseAppDumpEcPluginsLicenseInfoApiSchema(licensePluginConfigInfo)
    if(createDumpEcPluginslIceseInfoApi.success === true){
      let ecAppIdAndAppSecret = await ISASctrl.getEcAppIdAndAppSecret()
      if(ecAppIdAndAppSecret && ecAppIdAndAppSecret.success === true){
        let hmacSecretId = await commonUtils.createHmacHash(ecAppIdAndAppSecret.response.ApplicationId, ecAppIdAndAppSecret.response.ApplicationSecret)
        console.log("++++++++++> hmacSecretId for License manager dump:",hmacSecretId)
        let licenseAppApiSchema = await commonUtils.createApiSchemaForSecurityPlugin(createDumpEcPluginslIceseInfoApi.response,'POST',pluginsLicenseInfo,null,hmacSecretId);
        return ISASctrl.fetchSecurityPluginApi(licenseAppApiSchema).then(licenseResp =>{
          console.log("++++++++++> RESPONSE for License manager dump:",licenseResp)
          if(licenseResp && ((licenseResp.status).toLowerCase() == 'success')){
            logger.info("[INITIALSTEPS OF LM] \t license plugin manage applications api response:"+ JSON.stringify(licenseResp))
            return {success : true, response: licenseResp}
          }else{
            console.log("++++++++++> ELSE for License manager dump:",licenseResp)
            logger.error("[INITIALSTEPS OF LM] \t license plugin manage applications api response:"+ JSON.stringify(licenseResp))
            return {success : true, response: licenseResp}
          }
        }).catch(error =>{
          console.log("++++++++++> ERROR for License manager dump:",error)
          logger.error("[INITIALSTEPS OF LM] \t license plugin manage applications api response:"+ JSON.stringify(error))
          return {success: true, response: error}
        })
      }else{
        return {success: false, response: ecAppIdAndAppSecret.response}
      }
    }else{
      return { success:false, response : createDumpEcPluginslIceseInfoApiSchema.response}
    }
  /* }else{
    return { success:false, response : createApplicationOfLicenseReqBody.response}
  } */
}


/***************************************************
 ******* SEND APPLICATION DATA TO LICENSE APP ******(NOT USING NOW)
****************************************************/
/* async function sendApplicationDataToLicenseApp(licensePluginConfigInfo, licensedApplications){
  let createApplicationOfLicenseReqBody = await commonUtils.licenseAppCreateApplicationApiReqBody(licensedApplications);
  if(createApplicationOfLicenseReqBody.success === true){
    let createApplicationOfLicenseApiSchema = await commonUtils.licenseAppCreateApplicationApiSchema(licensePluginConfigInfo)
    if(createApplicationOfLicenseApiSchema.success === true){
      let licenseAppApiSchema = await commonUtils.createApiSchemaForSecurityPlugin(createApplicationOfLicenseApiSchema.response,'POST',createApplicationOfLicenseReqBody.response,null,'reqHeaders');
      return ISASctrl.fetchSecurityPluginApi(licenseAppApiSchema).then(licenseResp =>{
        if(licenseResp){
          logger.info("license plugin create application api response:"+ JSON.stringify(licenseResp))
          return {success : true, response: licenseResp}
        }else{
          logger.error("license plugin create application api response:"+ JSON.stringify(licenseResp))
          return {success : false, response: licenseResp}
        }
      }).catch(error =>{
        logger.error("license plugin create application api response:"+ JSON.stringify(error))
        return {success: false, response: error}
      })
    }else{
      logger.error(createApplicationOfLicenseApiSchema.response)
      return { success:false, response : createApplicationOfLicenseApiSchema.response}
    }
    
  }else{
    logger.error(createApplicationOfLicenseReqBody.response)
    return { success:false, response : createApplicationOfLicenseReqBody.response}
  }
} */


/****************************************************
 ***** SEND APPLICATION FEATURES TO LICENSE APP *****(NOT USING NOW)
*****************************************************/
/* async function sendApplicationFeaturesToLicenseApp(licensePluginConfigInfo, licensedApplicationFeatures){
  let sendApplicationFeaturesOfLicenseReqBody = await commonUtils.licenseAppApplicationFeaturesApiReqBody(licensedApplicationFeatures);
  if(sendApplicationFeaturesOfLicenseReqBody.success === true){
    let applicationsFeaturesOfLicenseApiSchema = await commonUtils.licenseAppCreateApplicationFeaturesApiSchema(licensePluginConfigInfo)
    if(applicationsFeaturesOfLicenseApiSchema.success === true){
      let licenseAppApiSchema = await commonUtils.createApiSchemaForSecurityPlugin(applicationsFeaturesOfLicenseApiSchema.response,'POST',sendApplicationFeaturesOfLicenseReqBody.response,null,'reqHeaders');
      return ISASctrl.fetchSecurityPluginApi(licenseAppApiSchema).then(licenseResp =>{
        // console.log("licenseResp of create Application response: ",licenseResp)
        if(licenseResp){
          logger.info("license plugin application features api response:"+ JSON.stringify(licenseResp))
          return {success : true, response: licenseResp}
        }else{
          logger.error("license plugin application features api response:"+ JSON.stringify(licenseResp))
          return {success : false, response: licenseResp}
        }
      }).catch(error =>{
        logger.error("license plugin application features api response:"+ JSON.stringify(error))
        return {success: false, response: error}
      })
    }else{
      logger.error(applicationsFeaturesOfLicenseApiSchema.response)
      return { success:false, response : applicationsFeaturesOfLicenseApiSchema.response}
    }
  }else{
    logger.error(sendApplicationFeaturesOfLicenseReqBody.response)
    return { success:false, response : sendApplicationFeaturesOfLicenseReqBody.response}
  }
} */


/*****************************************************
 ***** GET ALL PLUGINS LICENSE INFO FROM PORTAL ******
******************************************************/
async function getAllPluginsLicenseInfoFromPortal(){
  logger.info("[INITIALSTEPS OF LM] \t GET ALL PLUGINS LICENSE INFO FROM PORTAL")
  let portalAccesstoken = await getPortalAccesstoken()
  // console.log("++++++++++> PORTAL TOKEN:",portalAccesstoken)
  if(portalAccesstoken.success === true){
    let getPluginsLicenseInfoFromPortlaApi = process.env.GET_LICENSES_FROM_PORTAL_API
    let apiSchema = await commonUtils.createApiSchemaForSecurityPlugin(getPluginsLicenseInfoFromPortlaApi,'GET',null,null,portalAccesstoken.response)
    console.log("++++++++++> apiSchema for portal get all license:",apiSchema)
    let responseFromPortalAPI = ISASctrl.fetchSecurityPluginApi(apiSchema)
    return responseFromPortalAPI.then(resp=>{
      console.log("++++++++++> RESPONSE OF LICENSEs from portal:",resp)
      logger.info("[INITIALSTEPS OF LM] \t SUCCESS OF GETTING ALL PLUGINS LICENSE FROM PORTAL")
      return {success:true,response:resp}
    }).catch(error=>{
      console.log("++++++++++> ERROR OF LICENSEs from portal:",error)
      logger.error("[INITIALSTEPS OF LM] \t ERROR OF GETTING ALL PLUGINS LICENSE FROM PORTAL: "+JSON.stringify(error))
      return {success:false, response:error}
    })
  }else{
    logger.error("[INITIALSTEPS OF LM] \t ERROR OF GETTING ALL PLUGINS LICENSE FROM PORTAL: "+JSON.stringify(portalAccesstoken.response))
    return {success:false, response:portalAccesstoken.response}
  }
}


/********************************************
 ******** GET PORTAL ACCESSTOKEN ************
*********************************************/
async function getPortalAccesstoken(){
  logger.info("[INITIALSTEPS OF LM] \t GET ACCESSTOKEN FROM PORTAL")
  let getPortalAccesstokenApi = process.env.GET_PORTAL_ACCESSTOKEN_API
  let portalKeyFile = await commonUtils.getPortalKeyFile()
  if(portalKeyFile.success === true){
    let customerId = portalKeyFile.response.CustomerID
    let getPortalAccesstokenReqBody = await commonUtils.createGetPortalAccesstokenReqBody(customerId)
    if(getPortalAccesstokenReqBody.success === true){
      let apiSchema = await commonUtils.createApiSchemaForSecurityPlugin(getPortalAccesstokenApi,'POST',getPortalAccesstokenReqBody.response,null,null)
      let responseFromPortalAPI = ISASctrl.fetchSecurityPluginApi(apiSchema)
      return responseFromPortalAPI.then(resp=>{
        // console.log("+++@@@@@@@@> RESPONSE OF PORTAL TOKEN:",resp)
        if(resp.error){
          logger.error("[INITIALSTEPS OF LM] \t ERROR OF GETTING ACCESSTOKEN FROM PORTAL: "+JSON.stringify(resp))
          return {success:false,response:resp}
        }else{
          logger.info("[INITIALSTEPS OF LM] \t SUCCESS OF GETTING ACCESSTOKEN FROM PORTAL: "+JSON.stringify(resp))
          return {success:true,response:resp.token}
        }

      }).catch(error=>{
        logger.error("[INITIALSTEPS OF LM] \t ERROR OF GETTING ACCESSTOKEN FROM PORTAL: "+JSON.stringify(error))
        return {success:false, response:error}
      })
    }else{
      logger.error("[INITIALSTEPS OF LM] \t ERROR OF GETTING ACCESSTOKEN FROM PORTAL: "+getPortalAccesstokenReqBody.response)
      return {success: false, response: getPortalAccesstokenReqBody.response}
    }
  }else{
    logger.error("[INITIALSTEPS OF LM] \t ERROR OF GETTING ACCESSTOKEN FROM PORTAL: "+portalKeyFile.response)
    return {success:false, response: portalKeyFile.response}
  } 
}


/*******************************************************
 ********* DO INITIAL STEPS WITH SECURITY APP **********
********************************************************/
async function doInitialStepsWithSecurityPlugin(allDetectedPluginsConfigInfo){
  console.log("## Doing Initial Steps With Security Plugin")
  logger.info("[INITIAL STEPS WITH SECURITY PLUGIN] \t Doing Initial Steps With Security Plugin")
  /* let respOfRegisterApp = await registerApplicationWithSecurityPlugin(AppConfig) 
  // return {success : true, response : true} 
  if(respOfRegisterApp && respOfRegisterApp.success === true){
    logger.info("SUCESSFULLY REGISTERED THE APPLICATION WITH SECURITY PLUGIN")
    console.log("## SUCESSFULLY REGISTERED THE APPLICATION WITH SECURITY PLUGIN") */
    console.log("## DETECT ALL THE AVAILABLE PLUGINS WITH REQUIRED FIELDS")
    let detetctedPlugins = allDetectedPluginsConfigInfo ? allDetectedPluginsConfigInfo : await detectAllAvailablePlugins()
    let acceptedCount = 0, rejectedCount = 0
    for(let i=0; i<detetctedPlugins.length;i++){
      let plugin = detetctedPlugins[i]
      let doneOfInitialStepsOfPlugin = await doIndividualPluginServicesRestart(plugin)
      if(doneOfInitialStepsOfPlugin.success === true){
        acceptedCount = acceptedCount+ 1
      }else{
        rejectedCount = rejectedCount + 1
      }
      if((acceptedCount + rejectedCount) == detetctedPlugins.length){
        console.log("## TOTAL DETETCT PLUGINS INCLUDING SECURITY PLUGIN :",detetctedPlugins.length)
        console.log("## TOTAL ACCEPTED PLUGINS COUNT :",acceptedCount)
        console.log("TOTAL REJECTED COUNT :",rejectedCount)
        return {success:true, response:{acceptedPluginsCount:acceptedCount,rejectedPluginsCount:rejectedCount,totalPluginsCount:detetctedPlugins.length}}
      }
    }
  /*   let isPrivilegesRegistrationResp = await registerApplicationPriviliges(AppConfig)
    if(isPrivilegesRegistrationResp && isPrivilegesRegistrationResp.success === true){
      logger.info("SUCCESSFULLY REGISTERED EC PRIVILEGES")
      console.log("## SUCCESSFULLY REGISTERED EC PRIVILEGES")
      console.log("## DONE WITH INITIAL STEPS OF ON EC STARTING SERVER")
      console.log("## DETECT ALL THE AVAILABLE PLUGINS WITH REQUIRED FIELDS")
      let detetctedPlugins = await detectAllAvailablePlugins()
      console.log("## DETECTED PLUGINS EXCLUDING SECURITY PLUGIN:",detetctedPlugins.length)
      logger.info("DETECTED PLUGINS EXCLUDING SECURITY PLUGINS :"+detetctedPlugins.length)
      return {success :true, response :detetctedPlugins}
      
    }else{
      logger.error("FAILED TO REGISTERED EC PRIVILEGES")
      console.log("## FAILED TO REGISTERED EC PRIVILEGES")
      console.log("## REASON TO FAILED PRIVILEGE REGISTRATION :",isPrivilegesRegistrationResp.response)
      console.log("## DONE WITH INITIAL STEPS OF ON EC STARTING SERVER")
      return {success : false, response : false}
      //ISASctrl.closeMyECServer()
    } */
  /* }else{
    console.log("## FAILED REGISTERED EC APPLICATION WITH SECURITY PLUGIN: ",respOfRegisterApp.response);
    logger.error("FAILED TO REGISTERED THE APPLICATION WITH SECURITY PLUGIN : "+respOfRegisterApp.response)
    return {success : false, response : false}
  } */
}


/*******************************************************
 **** REGISTER APPLICATION WITH SECURITY PLUGIN ********
********************************************************/
async function registerApplicationWithSecurityPlugin(appInfo){
  // console.log("## REGISTERING APPLICATION With Security Plugin",appInfo.name)
  logger.info("[INITIAL STEPS WITH SECURITY PLUGIN] \t REGISTERING APPLICATION: "+appInfo.name)
  let registrationAppName = appInfo.name , registrationAppVersion = _.toString(appInfo.version);
  let registraionAppAdminName = appInfo.adminName ? appInfo.adminName : null
  let registrationAppAdminEmail = appInfo.adminEmail ? appInfo.adminEmail : null
  let registrationAppPrivileges = appInfo.privileges ? appInfo.privileges : []
  let respOfIsRegisteredApp = await ISASctrl.isRegisteredAppWithSecurityPlugin(registrationAppName, registrationAppVersion, registraionAppAdminName, registrationAppAdminEmail, registrationAppPrivileges)
  if(respOfIsRegisteredApp && respOfIsRegisteredApp.success === true){
    if(respOfIsRegisteredApp && respOfIsRegisteredApp.response.RegistrationResponse.ErrorCode == 0){
      let registerSaveResp = await checkAndsaveRegistrationResponseInDB(registrationAppName,registrationAppVersion, respOfIsRegisteredApp.response.RegistrationResponse)
      return registerSaveResp;
    }else{
      return respOfIsRegisteredApp
    }
  }else{
    return respOfIsRegisteredApp
  }
}


/**********************************************
 ***** SAVE REGISTARTION RESPONSE IN DB *******
***********************************************/
async function checkAndsaveRegistrationResponseInDB(registrationAppName,registrationAppVersion, registrationResponse){
  let isNewRegisteredApp = await checkDBisNewRegisteredApplication(registrationResponse)
  if((isNewRegisteredApp && isNewRegisteredApp.success === true) && (isNewRegisteredApp && isNewRegisteredApp.response == null)){
    let saveResponse = await saveResponseOfRegistration(registrationAppName,registrationAppVersion, registrationResponse)
    return saveResponse
  }else if((isNewRegisteredApp && isNewRegisteredApp.success === true) && (isNewRegisteredApp && isNewRegisteredApp.response != null)){
    return { success: true, response : isNewRegisteredApp.response}
  }else{
    return { success: false, response : isNewRegisteredApp.response}
  }
}


/**********************************************
 **** CHECK IS NEW REGISTERED APPLICATION *****
***********************************************/
async function checkDBisNewRegisteredApplication(registrationResponse){
  try{
    return await models.RegisteredApplications.findOne({
      raw: true,
      where : {
        // ApplicationId : registrationResponse.Application_Id
        ApplicationGuid : registrationResponse.Application_GUID
      }
    }).then(response =>{
      if(response){
        return  {success: true , response : response}
      }else{
        return  {success: true , response : null}
      }      
    }).catch(err =>{
      return {success: false , response : err}
    })
  }catch{
    return {success: false , response : STATUS.ERROR.DB_FETCH[1]}
  }
}


/********************************************
 **** STORE REGISTERED APPLICATION **********
*********************************************/
async function saveResponseOfRegistration(registrationAppName,registrationAppVersion, registrationResponse){
  let obj = {
    ApplicationId : registrationResponse.Application_Id,
    ApplicationName : registrationAppName,
    ApplicationVersion : registrationAppVersion,
    ApplicationSecret : registrationResponse.Application_Secret,
    ApplicationGuid : registrationResponse.Application_GUID
  }
  try{
    return models.RegisteredApplications.create(obj).then(response =>{
      return  {success: true , response : response.dataValues}
    }).catch(err =>{
      console.log("Error while saving register application response to DB:",err)
      return {success: false , response : err}
    })
  }catch(error){
    return { success: false, response: error}
  }
}

/****************************************************
 **** DO INDIVIDUAL PLUGIN SERVICES RESTART *********
*****************************************************/
async function doIndividualPluginServicesRestart(plugin){
  console.log("PLUGIN IN INDIVIDUAL :",plugin.name)
      if((plugin.uniqueName && (plugin.uniqueName).toLowerCase() != (AppConfig.securityApp).toLowerCase())){
        if((plugin.uniqueName && (plugin.uniqueName).toLowerCase() != (AppConfig.licenseManagerApp).toLowerCase())){
          let licenseCheck = await checkLicenceForPlugin(plugin)
          // console.log("**********************> CHECK LICENSE FOR",plugin.uniqueName +" :",licenseCheck)
          console.log("**********************> CHECK LICENSE FOR",plugin.uniqueName)
          plugin.IsLicenced = licenseCheck.success === true ?  licenseCheck.response.item.enabled : false;
          plugin.ServicesEnabled = plugin.IsLicenced === true ? true : false
          // console.log("**********************> CHECK LICENSE FOR plugin",plugin.ServicesEnabled)
        }else{
          plugin.IsLicenced =  true
          plugin.ServicesEnabled = true
        }
        let registration = await registerApplicationWithSecurityPlugin(plugin)
        if(registration && registration.success === true){
          plugin.IsRegistered = true          
          plugin.Guid = registration.response.ApplicationGuid
          let storeConfigDetailsInDb = await checkAndStoreConfigInfoOfPlugins(plugin)
          // console.log("storeConfigDetailsInDb:",storeConfigDetailsInDb.response)
          if(storeConfigDetailsInDb && storeConfigDetailsInDb.success === true){
            let pluginRedirectionUrl = plugin.baseUrl + ':' + plugin.serverPort
            let pluginHashTable = {}
            pluginHashTable.name = plugin.name
            pluginHashTable.url = pluginRedirectionUrl
            pluginHashTable.prependUrl = plugin.prependUrl
            pluginHashTable.servicesEnabled = storeConfigDetailsInDb.response.ServicesEnabled
            pluginHashTable.IsLicenced = storeConfigDetailsInDb.response.IsLicenced
            AllDetectedPluginsHashTable[(plugin.uniqueName).toLowerCase()] = {}
            AllDetectedPluginsHashTable[(plugin.uniqueName).toLowerCase()] = pluginHashTable
            return {success : true, response: storeConfigDetailsInDb.response, plugin:plugin }
          }else{ return {success : false, response: storeConfigDetailsInDb.response, plugin:plugin } }
        }else{ return {success : false, response: registration.response, plugin:plugin} }
      }else{
        plugin.IsLicenced = true
          plugin.IsRegistered = true
          plugin.ServicesEnabled = true
          let storeConfigDetailsInDb = await checkAndStoreConfigInfoOfPlugins(plugin)
          if(storeConfigDetailsInDb && storeConfigDetailsInDb.success === true){
            let pluginRedirectionUrl = plugin.baseUrl + ':' + plugin.serverPort
            let pluginHashTable = {}
            pluginHashTable.name = plugin.name
            pluginHashTable.url = pluginRedirectionUrl
            pluginHashTable.prependUrl = plugin.prependUrl
            pluginHashTable.servicesEnabled = storeConfigDetailsInDb.response.ServicesEnabled
            pluginHashTable.IsLicenced = storeConfigDetailsInDb.response.IsLicenced
            AllDetectedPluginsHashTable[(plugin.uniqueName).toLowerCase()] = {}
            AllDetectedPluginsHashTable[(plugin.uniqueName).toLowerCase()] = pluginHashTable
            return {success : true, response: storeConfigDetailsInDb.response, plugin:plugin }
          }else{ return {success : false, response: storeConfigDetailsInDb.response, plugin:plugin } }
      }
}


/*****************************************
 ***** CHECK LICENCE FOR PLUGINS *********
******************************************/
async function checkLicenceForPlugin(pluginConfigInfo){
  let licenseConfigInfo = await ISASctrl.getLicensePluginConfigInfo()
  let licenseAppCheckStatusApiSchema = await commonUtils.checkAppLicenseStatusApiSchema(licenseConfigInfo, pluginConfigInfo)
  if(licenseAppCheckStatusApiSchema.success === true){
    let ecAppIdAndAppSecret = await ISASctrl.getEcAppIdAndAppSecret()
    if(ecAppIdAndAppSecret && ecAppIdAndAppSecret.success === true){
      let hmacSecretId = await commonUtils.createHmacHash(ecAppIdAndAppSecret.response.ApplicationId, ecAppIdAndAppSecret.response.ApplicationSecret)
      let licenseAppApiSchema = await commonUtils.createApiSchemaForSecurityPlugin(licenseAppCheckStatusApiSchema.response,'GET',null,null,hmacSecretId);
      return ISASctrl.fetchSecurityPluginApi(licenseAppApiSchema).then(licenseResp =>{
        if(licenseResp && ((licenseResp.status).toLowerCase() == 'success') && (licenseResp.item.error == "")){
          logger.info("[LICENSE CHECK] \t license check for "+pluginConfigInfo.name+":"+ JSON.stringify(licenseResp))
          return {success : true, response: licenseResp}
        }else{
          logger.error("[LICENSE CHECK] \t license check for "+pluginConfigInfo.name+":"+ JSON.stringify(licenseResp))
          return {success : false, response: licenseResp}
        }
      }).catch(error =>{
        logger.info("[LICENSE CHECK] \t license check for "+pluginConfigInfo.name+":"+ JSON.stringify(error))
        return {success: false, response: error}
      })  
    }else{
      return {success : false, response: ecAppIdAndAppSecret.response}
    }
  }else{
    logger.error("License status of "+pluginConfigInfo.Name+" :"+JSON.stringify(licenseAppCheckStatusApiSchema.response))
    return {success : false, response: licenseAppCheckStatusApiSchema.response}
  }
  // return {success:true, response: {item:{enabled:true}}}
}


/*******************************************
 ***** GET LICENSE MANAGER PLUGIN INFO *****
********************************************/
async function getLicenseManagerInfo(req,res,next){
  let licenseManagerPluginInfo = await ISASctrl.getLicensePluginConfigInfo();
  if(licenseManagerPluginInfo){
    let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, licenseManagerPluginInfo)
    commonUtils.sendResponse(req, res, createdResp, next)
  }else{
    let createdResp = await commonUtils.createResponse(STATUS.ERROR.GET_LICENSEMANAGER_INFO,'')
    commonUtils.sendResponse(req, res, createdResp, next)
  }
}


/*******************************************
 ***** GET NOTIFICATION MANAGER URL*** *****
********************************************/
async function getNotificationManagerUrl(req,res,next){
  let notificationManagerPluginInfo = await ISASctrl.getNotificationPluginConfigInfo();
  if(notificationManagerPluginInfo && notificationManagerPluginInfo.BaseUrl && notificationManagerPluginInfo.UiPort){
    let obj = {
      notificationViewerUiUrl : notificationManagerPluginInfo.BaseUrl + ':' + notificationManagerPluginInfo.UiPort
    }
    let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, obj)
    commonUtils.sendResponse(req, res, createdResp, next)
  }else{
    let createdResp = await commonUtils.createResponse(STATUS.ERROR.GET_NOTIFICATION_VIEWER_URL,'Failed to fetch the notification manager')
    commonUtils.sendResponse(req, res, createdResp, next)
  }
}


/*******************************************
 ****** DETECT ALL REGISTERED PLUGINS ******
********************************************/
async function dectectListOfPlugins(req,res,next){
  let listOfPlugins = await getListOfPluginsInDB()
  if(listOfPlugins.success === true){
    let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, listOfPlugins.response)
    commonUtils.sendResponse(req, res, createdResp, next)
  }else{
    let createdResp = await commonUtils.createResponse(STATUS.ERROR.DETECTING_PLUGINS,'',error)
    commonUtils.sendResponse(req, res, createdResp, next)
  }

}


/*******************************************
 ****** GET LIST OF PLUGINS FROM DB ********
********************************************/
async function getListOfPluginsInDB(){
  try{
    return models.Plugins_Details.findAll({
      raw: true,
      where : {
        IsActive : true
      }
    }).then(registeredPlugins =>{
      if(registeredPlugins && registeredPlugins.length > 0){
        _.forEach(registeredPlugins,(plugin)=>{
          if(plugin.UiUrls || plugin.ServerUrls){
            plugin.UiUrls = plugin.UiUrls ? JSON.parse(plugin.UiUrls) : {}
            plugin.ServerUrls = plugin.ServerUrls ? JSON.parse(plugin.ServerUrls) : {}
          }
        })
      }
      return {success: true, response: registeredPlugins}
    }).catch(err =>{
      return {success: false, response: err}
    })
  }catch(error){
    return {success: false, response: error}
  }
}


/*******************************************
 *********** GET PLUGIN BY UID *************
********************************************/
async function getRegisteredpluginById(req,res,next){
  if(req.params.id){
    let pluginUid = req.params.id
    let plugin = await getPluginFromDbByID(pluginUid)
    if(plugin.success === true){
      if((plugin.response != null)){
        let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, plugin.response)
        commonUtils.sendResponse(req, res, createdResp, next)
      }else{
        let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, 'No plugins found with the requested id')
        commonUtils.sendResponse(req, res, createdResp, next)
      }
    }else{
      let createdResp = await commonUtils.createResponse(STATUS.ERROR.REGISTERED_PLUGIN_BY_ID,'',STATUS.ERROR.REGISTERED_PLUGIN_BY_ID[1])
      commonUtils.sendResponse(req, res, createdResp, next)
    }
  }else{
    let createdResp = await commonUtils.createResponse(STATUS.ERROR.PLUGIN_ID_NOT_FOUND_REGISTERED_PLUGIN)
    commonUtils.sendResponse(req, res, createdResp, next)
  }
}


/*******************************************
 ******* GET PLUIGIN BY UID FROM DB ********
********************************************/
async function getPluginFromDbByID(pluginUid){
  try{
    return await models.Plugins_Details.findOne({
      raw : true,
      where:{
        Uid : pluginUid
      }
    }).then(plugin =>{
      return  {success: true , response : plugin}
    }).catch(err =>{
      return {success: false , response : err}
    })
  }catch(error){
    return {success: false , response : error}
  }
}


/****************************************
 ***** GET PLUGIN FROM DB BY NAME *******
*****************************************/
async function getPluginFromDbByName(pluginName){
  if(pluginName){
    try{
      return models.Plugins_Details.findOne({
        raw: true,
        where : {
          UniqueName : pluginName
        }
      }).then(plugin =>{
        if(plugin){
          return {success: true, response: plugin}
        }else{
          return {success: false, response: "Requested plugin found as not registered"}
        }
      }).catch(err =>{
        return {success: false, response: err}
      })
    }catch(error){
      return {success: false, response: error}
    }
  }else{
    return {success : false, response: "plugin name not found in request"}
  }

}


/*******************************************************************************************
 ***** ENABLE OR DISABLE THE PLUGIN SERVICES (Update in DB in plugin_details table) ********
********************************************************************************************/
async function enableAndDisablePluginServices(req,res,next){
  let pluginInfo = req.body
  try{
    models.Plugins_Details.update({
      ServicesEnabled : pluginInfo.serviceEnabled
    },{
      where : {
        Uid : pluginInfo.uid
      }
    }).then(async response =>{
      if( !(_.includes(response, 0)) ){
        let allPlugins = await getListOfPluginsInDB()
        if(allPlugins.success === true){
          if(AllDetectedPluginsHashTable[(pluginInfo.uniqueName).toLowerCase()]){
            AllDetectedPluginsHashTable[(pluginInfo.uniqueName).toLowerCase()].servicesEnabled = pluginInfo.serviceEnable //updating detectedPlugins Hash table
          }          
          let appConfigInfo = await commonUtils.createAppConfigInfoSchema(AppConfig)
          allPlugins.response.unshift(appConfigInfo)
          let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, allPlugins.response)
          commonUtils.sendResponse(req, res, createdResp, next)
        }else{
          let createdResp = await commonUtils.createResponse(STATUS.ERROR.UPDATE_ENABLE_DISABLE_PLUGIN_SERVICES,'',allPlugins.response)
          commonUtils.sendResponse(req, res, createdResp, next)
        }
      }else{
        let createdResp = await commonUtils.createResponse(STATUS.ERROR.UPDATE_ENABLE_DISABLE_PLUGIN_SERVICES,'','Requested uid not found in DB')
        commonUtils.sendResponse(req, res, createdResp, next)
      }
    }).catch(async err =>{
      let createdResp = await commonUtils.createResponse(STATUS.ERROR.UPDATE_ENABLE_DISABLE_PLUGIN_SERVICES,'',err)
      commonUtils.sendResponse(req, res, createdResp, next)
    })
  }catch(error){
    let createdResp = await commonUtils.createResponse(STATUS.ERROR.UPDATE_ENABLE_DISABLE_PLUGIN_SERVICES,'',error)
    commonUtils.sendResponse(req, res, createdResp, next)
  }
}


/*************************************************
 ***** RESTART INDIVIDUAL PLUGIN SERVICES ********
**************************************************/
async function restartinvidualPluginServices(req,res,next){
  let pluginUid = req.params.uid
  let plugin = await getPluginFromDbByID(pluginUid); 
  if(plugin.success === true){
    let availablePlugins = await commonUtils.getDetectedPluginConfigFiles()
    availablePlugins = availablePlugins.acceptedPluginConfigFiles || []
    if(availablePlugins && availablePlugins.length > 0){
      let detectedPlugin = {
        name : plugin.response.Name,
        baseUrl : plugin.response.BaseUrl,
        serverPort : plugin.response.ServerPort,
        prependUrl : plugin.response.PrependUrl
      }
      let pluginConfigDetails = await ISASctrl.getPluginsConfigurationDetails(detectedPlugin)
      if(pluginConfigDetails.success === true){
        let doneWithRestartingPluginServices = await doIndividualPluginServicesRestart(pluginConfigDetails.response);
        if(doneWithRestartingPluginServices.success === true){
          let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, doneWithRestartingPluginServices.response)
          commonUtils.sendResponse(req, res, createdResp, next)
        }else{
          let createdResp = await commonUtils.createResponse(STATUS.ERROR.RESTARTING_INDIVIDUAL_PLUGIN_SERVICES,'',doneWithRestartingPluginServices.response)
          commonUtils.sendResponse(req, res, createdResp, next)
        }
      }else{
        let createdResp = await commonUtils.createResponse(STATUS.ERROR.RESTARTING_INDIVIDUAL_PLUGIN_SERVICES,'',STATUS.ERROR.RESTARTING_INDIVIDUAL_PLUGIN_SERVICES[1])
        commonUtils.sendResponse(req, res, createdResp, next)
      }
    }else{
      let createdResp = await commonUtils.createResponse(STATUS.ERROR.RESTARTING_INDIVIDUAL_PLUGIN_SERVICES,'',STATUS.ERROR.RESTARTING_INDIVIDUAL_PLUGIN_SERVICES[1])
      commonUtils.sendResponse(req, res, createdResp, next)
    }
  }else{
    let createdResp = await commonUtils.createResponse(STATUS.ERROR.RESTARTING_INDIVIDUAL_PLUGIN_SERVICES,'',STATUS.ERROR.RESTARTING_INDIVIDUAL_PLUGIN_SERVICES[1])
    commonUtils.sendResponse(req, res, createdResp, next)
  } 
}


/********************************************
 ******** RESTART ALL PLUGIN SERVICES *******
*********************************************/
async function restartAllPluginServices(req,res,next){
  try{
    let doneWithInitialSteps = await doInitialStepsWithSecurityPlugin()
    if(doneWithInitialSteps.success != true){
      let createdResp = await commonUtils.createResponse(STATUS.ERROR.RESTARTING_ALL_PLUGIN_SERVICES,'',STATUS.ERROR.RESTARTING_ALL_PLUGIN_SERVICES[1])
      commonUtils.sendResponse(req, res, createdResp, next)
    }else{
      let listOfPlugins = await getListOfPluginsInDB()
      let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, listOfPlugins.response)
      commonUtils.sendResponse(req, res, createdResp, next)
    }
  }catch(error){
    let createdResp = await commonUtils.createResponse(STATUS.ERROR.RESTARTING_ALL_PLUGIN_SERVICES,'',STATUS.ERROR.RESTARTING_ALL_PLUGIN_SERVICES[1])
    commonUtils.sendResponse(req, res, createdResp, next)
  }
}


/************* REGISTER APPLICATION PRIVILIGES **************/
/* async function registerApplicationPriviliges(registrationAppInfo){
  console.log("## REGISTERING APPLICATION PRIVILEGES WITH SECURITY PLUGIN :",registrationAppInfo.name)
  let registrationAppName = registrationAppInfo.name , registrationAppVersion = _.toString(registrationAppInfo.version), registrationAppPrivileges = registrationAppInfo.privileges ? registrationAppInfo.privileges : []
  let registraionAppAdminName = registrationAppInfo.adminName ? registrationAppInfo.adminName : null
  let registrationAppAdminEmail = registrationAppInfo.adminEmail ? registrationAppInfo.adminEmail : null
  console.log("## CHEKING IS APPLICATION ALREADY REGISTERED OR NOT :",registrationAppInfo.name)
  let respOfIsRegisteredApp = await ISASctrl.isRegisteredAppWithSecurityPlugin(registrationAppName, registrationAppVersion, registraionAppAdminName, registrationAppAdminEmail, registrationAppPrivileges)
  if(respOfIsRegisteredApp && (respOfIsRegisteredApp.success === true) && (respOfIsRegisteredApp.response.RegistrationResponse.ErrorCode == 0)){
    let respOfRegisterPrivileges = await goToRegisterPrivileges(respOfIsRegisteredApp.response.RegistrationResponse, registrationAppPrivileges)
    if(respOfRegisterPrivileges && respOfRegisterPrivileges.succes === true){
      return {success: true, response: respOfRegisterPrivileges.response}
    }else{
      return respOfRegisterPrivileges
    }
  }else{
    return respOfIsRegisteredApp
  }
} */


/************* REGISTER APPLICATION PRIVILIGES (interlink function of register privileges method) **************/
/* async function goToRegisterPrivileges(appRegistrationInfo, registrationAppPrivileges){
  console.log("## CAME TO MAIN LOGIC OF REGISTERING PRIVILEGES ") 
  let securityPlugin = await ISASctrl.getSecurityPluginConfigInfo()
  if(securityPlugin != false){
    let privilegesRegistrationApiRequestBody = await commonUtils.createPrivilegeRegistrationApiBody(registrationAppPrivileges)
    if(privilegesRegistrationApiRequestBody && (privilegesRegistrationApiRequestBody.success === true)){
      privilegesRegistrationApiRequestBody = privilegesRegistrationApiRequestBody.response
      let privilegesRegistartionApi = await commonUtils.createPrivilegesRegisterationApi(securityPlugin)
      let hashedBase64 = await commonUtils.createHmacHash(appRegistrationInfo.Application_Id, appRegistrationInfo.Application_Secret)
      let privilegesRegistrationApiSchema = await commonUtils.createApiSchemaForSecurityPlugin(privilegesRegistartionApi, 'POST', privilegesRegistrationApiRequestBody, hashedBase64)
      return ISASctrl.fetchSecurityPluginApi(privilegesRegistrationApiSchema).then(privilegesResp =>{
        if(privilegesResp && privilegesResp.PrivilegeRegistrationResponse && privilegesResp.PrivilegeRegistrationResponse.ErrorCode === 0){
          return {success : true, response: privilegesResp.PrivilegeRegistrationResponse}
        }else{
          return {success : false, response: privilegesResp.PrivilegeRegistrationResponse}
        }
      }).catch(error =>{
        return {success: false, response: error}
      })
    }else{
      return privilegesRegistrationApiRequestBody
    }
  }else{
    return {success : false, response: 'Failed to register privileges'}
  }
} */



/***********************************************************************************************************************************************************************
 ******************************************************** END OF NEW CHANGES *******************************************************************************************
 ************************************************************************************************************************************************************************/
module.exports = {
  detectAllAvailablePlugins : detectAllAvailablePlugins,
  checkRequiredPluginsForEC : checkRequiredPluginsForEC,
  doInitialStepsWithLicenseManager : doInitialStepsWithLicenseManager,

  checkAndStoreConfigInfoOfPlugins : checkAndStoreConfigInfoOfPlugins,
  doInitialStepsWithSecurityPlugin : doInitialStepsWithSecurityPlugin,  
  detectedPluginsHashtable : AllDetectedPluginsHashTable,
  enableAndDisablePluginServices : enableAndDisablePluginServices,
  getRegisteredpluginById : getRegisteredpluginById,
  dectectListOfPlugins : dectectListOfPlugins,
  getListOfPluginsInDB : getListOfPluginsInDB,
  restartAllPluginServices : restartAllPluginServices,
  restartinvidualPluginServices : restartinvidualPluginServices,
  getPluginFromDbByID : getPluginFromDbByID,
  getPluginFromDbByName : getPluginFromDbByName,
  getLicenseManagerInfo : getLicenseManagerInfo,
  getNotificationManagerUrl : getNotificationManagerUrl,
  getPortalAccesstoken : getPortalAccesstoken,


  checkDBisNewRegisteredApplication : checkDBisNewRegisteredApplication,
  // checkIsPluginRegistered : checkIsPluginRegistered,   
  // allRegisteredPluginList : allRegisteredPluginList,
}
