// const fetch = require('node-fetch');
const axios = require("axios");
const models = require('../models');
const SequelizeOperator = require('sequelize').Op;
var commonUtils = require('../utils/common.utils');
var AppConfig = require('../config/app-config')
const _ = require('lodash');
var logger = require('../utils/winston.utils').EnterpriseLogs

/****************************************
 ********** CHECKING SECURITY APP *******
*****************************************/
async function checkSecurityPluginAvailability(listOfAllPlugins){
  console.log("## CHECKING FOR SECURIY PLUGIN AVAILABILITY")
  logger.info("CHECKING FOR SECURITY PLUGIN AVAILABILITY")
  let securityPlugin = false
  _.forEach(listOfAllPlugins, (plugin) =>{
    if((plugin.uniqueName && (plugin.uniqueName).toLowerCase() === (AppConfig.securityApp).toLowerCase()) && (plugin.type && (plugin.type).toLowerCase() === 'default')){
      securityPlugin = plugin
    }
  }); 
  return securityPlugin;
  // let securityPlugin = await getSecurityPlugin()
  // return securityPlugin === false ? false : securityPlugin  
}


/***********************************************
 ********** GET SECURITY PLUGIN FROM DB *******
************************************************/
async function getSecurityPluginFromDb(){
  try{
    return models.Plugins_Details.findOne({
      raw:true,
      where : {
        UniqueName : AppConfig.securityApp
      }
    }).then(securityPlugin=>{
      if(securityPlugin.UiUrls || securityPlugin.ServerUrls){
        securityPlugin.UiUrls = securityPlugin.UiUrls ? JSON.parse(securityPlugin.UiUrls) : {}
        securityPlugin.ServerUrls = securityPlugin.ServerUrls ? JSON.parse(securityPlugin.ServerUrls) : {}
      }
      return {success:true, response:securityPlugin}
    }).catch(err=>{
      return {success:false, response: 'Security plugin Info not found'}
    })
  }catch(error){
    return {success:false, response: 'Security plugin Info not found'}
  }
}


/***********************************************
 ********** CHECKING LICENSE MANAGER APP *******
************************************************/
async function CheckLicenseManagerPluginAvailability(listOfAllPlugins){
  console.log("## CHECKING FOR LICENSE MANAGER PLUGIN AVAILABILITY")
  logger.info("CHECKING FOR LICENSE MANAGER PLUGIN AVAILABILITY")
  let licenseManagerPlugin = false
  _.forEach(listOfAllPlugins, (plugin) =>{
    if((plugin.uniqueName && (plugin.uniqueName).toLowerCase() === (AppConfig.licenseManagerApp).toLowerCase()) && (plugin.type && (plugin.type).toLowerCase() === 'default')){
      licenseManagerPlugin = plugin
    }
  }); 
  return licenseManagerPlugin;
}


/****************************************************
 ********** CHECKING NOTIFICATION MANAGER APP *******
*****************************************************/
async function CheckNotificationManagerPluginAvailability(listOfAllPlugins){
  console.log("## CHECKING FOR NOTIFICATION MANAGER PLUGIN AVAILABILITY :",AppConfig.notificationManagerApp)
  logger.info("CHECKING FOR NOTIFICATION MANAGER PLUGIN AVAILABILITY")
  let notificationManagerPlugin = false
  if(listOfAllPlugins.length > 0){
    _.forEach(listOfAllPlugins, (plugin) =>{
      if((plugin.UniqueName && (plugin.UniqueName).toLowerCase() === (AppConfig.notificationManagerApp).toLowerCase())){
        notificationManagerPlugin = plugin
      }
    }); 
  }
  return notificationManagerPlugin;
}


/************************************************
 ********GET PLUGIN CONFIGURATION DETAILS *******
*************************************************/
async function getPluginsConfigurationDetails(plugin){
  console.log("### GET CONFIG DETAILS OF PLUGIN:",plugin.name)
  logger.info("[CONFIG REQ] \t GET CONFIG DETAILS OF PLUGIN: "+plugin.name)
  let getPluginConfigDetailsApi = await commonUtils.createApiToGetPluginConfigDetails(plugin.baseUrl, plugin.serverPort,plugin.prependUrl)
  console.log("###Creating API for posting the EC details to "+ plugin.name +"Plugin :",getPluginConfigDetailsApi)
  let apiSchema = await commonUtils.createApiSchemaForSecurityPlugin(getPluginConfigDetailsApi,'POST',{configInfoRequest:{baseUrl:AppConfig.baseUrl,port:(AppConfig.serverPort).toString(), applicationName:AppConfig.name,applicationVersion:AppConfig.version}})
  let responseFromSecurityPluginAPI = fetchSecurityPluginApi(apiSchema)
  return responseFromSecurityPluginAPI.then(response =>{
    console.log("### Success Response from configinfo req: "+ plugin.name)
    return {success : true, response: response}
  }).catch(error =>{
    console.log("### Error from configinfo req -->"+ plugin.name +" Plugin config API error")
    return {success : false, response: error}
  })
}

/************************************************
 ***** FETCH SECURITY PLUGIN CONFIG DETAILS *****
*************************************************/
async function getSecurityPluginConfigInfo(){
  // let securityPlugin = await getSecurityPlugin()
  // console.log(securityPlugin != false ? "Found Security Plugin with required Fields" : "Security Plugin found with no required Fields")
  let securityPlugin = {
    name : AppConfig.securityApp,
    uniqueName : AppConfig.securityApp
  }
  let pluginInfo
  securityPlugin != false ? pluginInfo = await checkPluginConfigDetailsInDB(securityPlugin) : pluginInfo = false
  pluginInfo != false ? pluginInfo.success === true ? pluginInfo = pluginInfo.response[0] : pluginInfo = false : pluginInfo = false
  return pluginInfo;
}


/********************************************
 **** FETCH LICENSE PLUGIN CONFIG DETAILS ****
*********************************************/
async function getLicensePluginConfigInfo(){
  let licensePlugin = {
    name : AppConfig.licenseManagerApp,
    uniqueName : AppConfig.licenseManagerApp
  }
  let pluginInfo
  licensePlugin != false ? pluginInfo = await checkPluginConfigDetailsInDB(licensePlugin) : pluginInfo = false
  pluginInfo != false ? pluginInfo.success === true ? pluginInfo = pluginInfo.response[0] : pluginInfo = false : pluginInfo = false
  return pluginInfo;
}


/********************************************
 **** FETCH LICENSE PLUGIN CONFIG DETAILS ****
*********************************************/
async function getNotificationPluginConfigInfo(){
  let notificationPlugin = {
    name : AppConfig.notificationManagerApp,
    uniqueName : AppConfig.notificationManagerApp
  }
  let pluginInfo
  notificationPlugin != false ? pluginInfo = await checkPluginConfigDetailsInDB(notificationPlugin) : pluginInfo = false
  pluginInfo != false ? pluginInfo.success === true ? pluginInfo = pluginInfo.response[0] : pluginInfo = false : pluginInfo = false
  return pluginInfo;
}


/**********************************************************************
 **** CHECK IS REGISTERED APPLICATION WITH SECURITY PLUGIN OR NOT *****
***********************************************************************/
async function isRegisteredAppWithSecurityPlugin(registrationAppName, registrationAppVersion, registrationAppAdminName, registrationAppAdminEmail, regitsrationAppPrivileges){
  let securityPlugin = await getSecurityPluginConfigInfo()  
  if(securityPlugin){
    let registartionApi = await commonUtils.createRegisterationApi(securityPlugin)
    if(registartionApi != false){
      let registrationApiRequestBody = await commonUtils.createRegisterApplicationBody(registrationAppName, registrationAppVersion, registrationAppAdminName, registrationAppAdminEmail, regitsrationAppPrivileges)
      if(registrationApiRequestBody && registrationApiRequestBody.success === true){
        let registrationApiSchema = await commonUtils.createApiSchemaForSecurityPlugin(registartionApi,'POST',registrationApiRequestBody.response)
        return fetchSecurityPluginApi(registrationApiSchema).then(async responseFromSecurityPlugin =>{
          if(responseFromSecurityPlugin && responseFromSecurityPlugin.RegistrationResponse.ErrorCode != 0){
            return {success:false, response: responseFromSecurityPlugin}
          }else{
            return {success:true, response: responseFromSecurityPlugin}
          }          
        }).catch(error =>{
          return {success : false, response: error}
        })
      }else{
        return {success : false, response: registrationApiRequestBody}
      }
    }
  }else{
    return {success: false, response: "Failed to register, Security plugin not found"}
  }
}


/************************************************
 ***** CHECK IS PLUGIN CONFIG DEATILS IN DB *****
*************************************************/
async function checkPluginConfigDetailsInDB(pluginInfo){
  console.log("## CHECK IS PLUGIN CONFIG DETAILS ALREADY SAVED:",pluginInfo.name)
  if(pluginInfo){
    try{
      return models.Plugins_Details.findAll({
        raw: true,
        where : {
          [SequelizeOperator.or] : [
            {
              UniqueName : pluginInfo.uniqueName
            }
          ]
        }
      }).then(plugins =>{
        if(plugins && plugins.length > 0){
          _.forEach(plugins,(plugin) =>{            
            if(plugin.UiUrls || plugin.ServerUrls){
              plugin.UiUrls = plugin.UiUrls ? JSON.parse(plugin.UiUrls) : {}
              plugin.ServerUrls = plugin.ServerUrls ? JSON.parse(plugin.ServerUrls) : {}
            }
          })
        }
        return { success : true, response : plugins}
      }).catch(resErr =>{
        return  { success : false, response : resErr}
      })
    }catch(error){
      return  { success : false, response : error}
    }
  }else{
    return { success : false, response : "Required parameters not found in the request"}
  }
}


/************************************************
 ******* DO API CAL TO EXPTERNAL PLUGINS ********
*************************************************/
async function fetchSecurityPluginApi(apiSchema){
  let requestApi = apiSchema.requestApi
  let requestMethod = apiSchema.requestMethod
  let requestHeaders = apiSchema.requestHeaders
  let requestBody = apiSchema.requestBody
  let secondParameter = {}
  if(requestBody){
    secondParameter.method = requestMethod
    secondParameter.headers= requestHeaders
    secondParameter.body = requestBody 
  }else{
    secondParameter.method = requestMethod
    secondParameter.headers= requestHeaders
  }
  // console.log("apiSchema:",apiSchema)
  return new Promise(async (resolve, reject)=>{
    if(requestApi && requestMethod && requestHeaders){
      axios({method:requestMethod,url:requestApi,headers:requestHeaders,data:requestBody}).then(resp=>{
        // console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$:",_.get(resp, "isAxiosError", false))
        resolve(resp.data)
      }).catch(error=>{
        // console.log("###ERROR:",_.get(error, "isAxiosError", false))
        if (_.get(error, "isAxiosError", false)){
          reject(error.response ?error.response.data : error)
        }
        
      })
     /*  if((requestHeaders.accept && requestHeaders.accept.toLowerCase().indexOf("xml") != -1)){
        axios({method:requestMethod,url:requestApi,headers:requestHeaders,data:requestBody}).then(resp=>{
          // console.log("###RESPO:",resp)
          resolve(resp.data)
        }).catch(error=>{
          reject(error)
        })
        // fetch(requestApi, secondParameter).then(resp => {
        //   return resp.text()        
        // }).then((xmlStrng) => (new DOMParser().parseFromString(xmlStrng, "text/xml")))
        // .then(response => {
        //   console.log("###RESPO:",response)
        //   resolve(response)
        // }).catch((err) => {
        //   reject(err)
        // });
      }else{
        fetch(requestApi, secondParameter).then(resp => {
          return resp.json()        
        }).then((jsonData) => {
          resolve(jsonData)
        }).catch((err) => {
          reject(err)
        });
      } */
    }else{
      reject("required fields are missing(requestApi,requestMethod,requestHeaders,requestBody(body is optional))")
    }
  })
}



/************************************************
 ****** POST HIERARCHY TREE DATA TO PORTAL ******
*************************************************/
async function doAPostCallWithTimeIntervelToPortalWithTreeData(hierarchyTree, portalAccessToken){
  let apiSchema = await commonUtils.createApiSchemaForSecurityPlugin(process.env.PORTAL_HIERARCHY_TREE_POST_API,'POST',hierarchyTree,null,portalAccessToken)
  let responseFromPortalAPI = fetchSecurityPluginApi(apiSchema)
  return responseFromPortalAPI.then(resp=>{
    return {success:true,response:resp}
  }).catch(error=>{
    return {success:false, response:error}
  })
}


/************************************************
 ****** CREATE DEFAULT USER FOR EC IN ISAS ******
*************************************************/
async function createDefaultUserForEc(rootNodeInfo){
  let defaultUserReqBody = await commonUtils.createDefaultUserReqBody(rootNodeInfo)
  // console.log("REQ BODY :",defaultUserReqBody)
  let securityPluginInfo = await getSecurityPluginConfigInfo()
  if(securityPluginInfo){
    let defaultUserApi = await commonUtils.createDefaultUserApiSchema(securityPluginInfo)
    if(defaultUserApi !== false){
      let ecAppIdAndAppSecret = await getEcAppIdAndAppSecret()
      if(ecAppIdAndAppSecret && ecAppIdAndAppSecret.success === true){
        let hmacId = await commonUtils.createHmacHash(ecAppIdAndAppSecret.response.ApplicationId, ecAppIdAndAppSecret.response.ApplicationSecret)
        let apiSchema = await commonUtils.createApiSchemaForSecurityPlugin(defaultUserApi,'POST',defaultUserReqBody,hmacId,null)
        let responseFromSecurityPluginAPI = fetchSecurityPluginApi(apiSchema)
        return responseFromSecurityPluginAPI.then(response =>{
          if(response && response.RegistrationResponse.ErrorCode === 0){
            return {success : true, response: response}
          }else{
            return {success : false, response: response}
          }          
        }).catch(error =>{
          return {success : false, response: error}
        })
      }else{
        return {success:false, response: ecAppIdAndAppSecret.response}
      }
    }else{
      return {success:false, response: 'Create Default user Api not found'}
    }
  }else{
    return {success:false, response: 'Security plugin not found in DB'}
  }
}


/************************************************
 ****** GET EC APP ID AND APP SECRET ID *********
*************************************************/
async function getEcAppIdAndAppSecret(){
  try{
      return models.RegisteredApplications.findOne({
          raw:true,
          where : {
              ApplicationName : AppConfig.name
          }
      }).then(resp=>{
          if(resp){
              return {success:true, response:resp}
          }else{
              return {success:false, response:resp}
          }           
      }).catch(error=>{
          return {success:false, response:error}
      })
  }catch(error){
      return {success:false, response:error}
  }
}



/********************************
 ****** CLOSE EC SERVER *********
*********************************/
async function closeMyECServer(){
console.log("## CLOSING EC SERVER")
logger.info("Closing EC server")
logger.error("Closing EC server")
process.exit(1)
}




// /****** DETECT SECURITY PLUGIN AND ITS CONFIG DETAILS ************/
// async function detectSecurityPluginAndConfigDetails(){
//   let isSecurityPluginAvailable = await checkSecurityPluginAvailability()
//   console.log(isSecurityPluginAvailable != false ? "Detected Security Plugin with required Fields" : "Security Plugin detected with no required Fields")
//   if(isSecurityPluginAvailable != false){
//     console.log("## SECURITY PLUGIN IS AVAILABLE:",isSecurityPluginAvailable.name)
//     let securityPluginConfigInfo = await getPluginsConfigurationDetails(isSecurityPluginAvailable)
//     securityPluginConfigInfo && securityPluginConfigInfo.success === true ? securityPluginConfigInfo = securityPluginConfigInfo : securityPluginConfigInfo = securityPluginConfigInfo
//     return securityPluginConfigInfo
//   }else{
//     // closeMyECServer()
//     return {success: false, response: 'Security plugin not found'}
//   }
// }



// /************ GET SECURITY PLUGIN ****************/
// async function getSecurityPlugin(){
//   let securityPlugin = false
//   let pluginConfigFiles = await commonUtils.getDetectedPluginConfigFiles()
//   pluginConfigFiles = pluginConfigFiles.acceptedPluginConfigFiles || []
//   if(pluginConfigFiles && pluginConfigFiles.length > 0){
//       _.forEach(pluginConfigFiles, (plugin) =>{
//           if((plugin.uniqueName && (plugin.uniqueName).toLowerCase() === (AppConfig.securityApp).toLowerCase()) && (plugin.type && (plugin.type).toLowerCase() === 'default')){
//             securityPlugin = plugin
//           }
//       });

//   }
//   return securityPlugin
// }



// /************ GET SECURITY PLUGIN ****************/
// async function getLicensePlugin(){
//   let licensePlugin = false
//   let pluginConfigFiles = await commonUtils.getDetectedPluginConfigFiles()
//   pluginConfigFiles = pluginConfigFiles.acceptedPluginConfigFiles || []
//   if(pluginConfigFiles && pluginConfigFiles.length > 0){
//       _.forEach(pluginConfigFiles, (plugin) =>{
//           if((plugin.uniqueName && (plugin.uniqueName).toLowerCase() === (AppConfig.licenseManagerApp).toLowerCase()) && (plugin.type && (plugin.type).toLowerCase() === 'default')){
//             licensePlugin = plugin
//           }
//       });

//   }
//   return licensePlugin
// }




module.exports = {
  checkSecurityPluginAvailability : checkSecurityPluginAvailability,
  CheckLicenseManagerPluginAvailability : CheckLicenseManagerPluginAvailability,
  CheckNotificationManagerPluginAvailability : CheckNotificationManagerPluginAvailability,
  getSecurityPluginFromDb : getSecurityPluginFromDb,
    // getSecurityPlugin : getSecurityPlugin,
    // getLicensePlugin : getLicensePlugin,
    fetchSecurityPluginApi : fetchSecurityPluginApi,
    getPluginsConfigurationDetails : getPluginsConfigurationDetails,
    isRegisteredAppWithSecurityPlugin : isRegisteredAppWithSecurityPlugin,
    createDefaultUserForEc : createDefaultUserForEc,
    closeMyECServer : closeMyECServer,
    getEcAppIdAndAppSecret : getEcAppIdAndAppSecret,
    // detectSecurityPluginAndConfigDetails : detectSecurityPluginAndConfigDetails,
    checkPluginConfigDetailsInDB : checkPluginConfigDetailsInDB,
    getSecurityPluginConfigInfo : getSecurityPluginConfigInfo,
    getLicensePluginConfigInfo : getLicensePluginConfigInfo,
    getNotificationPluginConfigInfo : getNotificationPluginConfigInfo,
    doAPostCallWithTimeIntervelToPortalWithTreeData : doAPostCallWithTimeIntervelToPortalWithTreeData
}
