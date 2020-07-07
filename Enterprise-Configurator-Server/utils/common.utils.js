// var jsonxml = require('jsontoxml');
// var path = require('path');
var o2x = require('object-to-xml');
const fs = require('fs');
var appRoot = require('app-root-path');
const glob = require('glob');
var moment = require('moment');
var crypto = require('crypto');
var AppConfig = require('../config/app-config')
const _ = require('lodash');
const uuidv1 = require('uuid/v1');
// const models = require('../models');
var logger = require('../utils/winston.utils').EnterpriseLogs
var env = process.env.NODE_ENV || 'development';
var config = require('../config/db.config')[env];
// var session = require('express-session');

async function schemaOfPluginConfigInfo(pluginInfo, previousDataOfPluginInfo){
    //console.log("previousDataOfPluginInfo:",previousDataOfPluginInfo)
    if(previousDataOfPluginInfo){
        pluginInfo.Uid = previousDataOfPluginInfo.Uid
        // pluginInfo.ServicesEnabled = previousDataOfPluginInfo.ServicesEnabled
    }

    // if(pluginInfo && !pluginInfo.Uid && (_.toLower(AppConfig.licenseManagerApp) == _.toLower(pluginInfo.uniqueName))){
    //     pluginInfo.Uid = ''
    // }
    let schema = {
        // Uid: pluginInfo.Uid ? pluginInfo.Uid : uuidv1(),
        // Uid: pluginInfo.Uid ? pluginInfo.Uid : pluginInfo.Guid ? pluginInfo.Guid : 'Default-'+uuidv1(),
        Uid: pluginInfo.Guid ? pluginInfo.Guid : pluginInfo.Uid ? pluginInfo.Uid : 'Default-'+uuidv1(),
        Name: pluginInfo.name ? pluginInfo.name : '',
        UniqueName: pluginInfo.uniqueName ? pluginInfo.uniqueName : '',
        Version: pluginInfo.version ? _.toString(pluginInfo.version) : '',
        Description: pluginInfo.description ? pluginInfo.description : '',
        UiPort: pluginInfo.uiPort ? _.toString(pluginInfo.uiPort) : '',
        BaseUrl: pluginInfo.baseUrl ? pluginInfo.baseUrl : '',
        Type: pluginInfo.type ? pluginInfo.type : '',
        Instances: pluginInfo.instances ? _.toString(pluginInfo.instances) : '',
        ServerPort: pluginInfo.serverPort ? _.toString(pluginInfo.serverPort) : '',
        PrependUrl: pluginInfo.prependUrl ? pluginInfo.prependUrl : '',
        IconUrl : pluginInfo.iconUrl ? pluginInfo.iconUrl : '',
        UiUrls: pluginInfo.uiUrls ? JSON.stringify(pluginInfo.uiUrls) : '',
        ServerUrls: pluginInfo.serverUrls ? JSON.stringify(pluginInfo.serverUrls)  : '',
        IsRegistered: pluginInfo.IsRegistered ? pluginInfo.IsRegistered : false,
        ServicesEnabled: pluginInfo.ServicesEnabled ? pluginInfo.ServicesEnabled : false,
        IsLicenced: pluginInfo.IsLicenced ? pluginInfo.IsLicenced : false,
        IsActive: pluginInfo.IsActive ? pluginInfo.IsActive : true
    }
    // console.log("schema:",schema)
    return schema;
}

async function schemaOfNodeCreation(nodeObj, req){
    try{
        let schema = {
            NodeName: nodeObj.nodeName ? nodeObj.nodeName : null,
            NodeShortName: nodeObj.nodeShortName ? nodeObj.nodeShortName : nodeObj.nodeName,
            ParentID: nodeObj.parentId ? nodeObj.parentId : null,
            NodeType: nodeObj.nodeType ? nodeObj.nodeType : null,
            TypeOf: nodeObj.typeOf == 0 ? 0 : nodeObj.typeOf != 0 ? nodeObj.typeOf : null,
            PluginID: nodeObj.pluginId ? nodeObj.pluginId : null,
            NodeInfo: nodeObj.nodeInfo ? nodeObj.nodeInfo : null,
            PluginInfoId: nodeObj.pluginInfoId ? nodeObj.pluginInfoId : null,
            IsActive: nodeObj.isActive ? nodeObj.isActive : null,
            // CreatedBy: nodeObj.nodeUid ? '' : req.session.user,
            // CreatedBy: req.session ? req.session.user ? req.session.user : 'test' : 'test',
            CreatedBy: req ? req.session ? req.session.user ? req.session.user : req.headers ? req.headers.accesstoken ? req.headers.accesstoken : 'test' : 'test' : req.headers.accesstoken : 'test',
            // ModifiedBy: req.session.user ? req.session.user : ''
            // ModifiedBy: req.session ? req.session.user ? req.session.user : 'test' : 'test'
            ModifiedBy: req ? req.session ? req.session.user ? req.session.user : req.headers ? req.headers.accesstoken ? req.headers.accesstoken : 'test' : 'test' : req.headers.accesstoken : 'test',
        }
        if(nodeObj.uid){
            schema.Uid = nodeObj.uid
        }
        return await schema;
    }catch(err){
        console.log("error in schema:",err)
    }

}

async function createApiToGetPluginConfigDetails(baseUrl, serverPort, prependUrl){
    return baseUrl + ':' + serverPort + prependUrl + AppConfig.EcUrls.getPluginConfigDetailsAPI
}

async function createRegisterationApi(securityPluginInfo){
    console.log("CREATING API FOR REGISTRATION WITH SECURITY PLUGIN INFO")
    let registerationApi
    if(securityPluginInfo && securityPluginInfo.ServerPort && securityPluginInfo.BaseUrl && securityPluginInfo.ServerUrls){
        let securityPluginBaseUrl = securityPluginInfo.BaseUrl,
            securityPluginPort = securityPluginInfo.ServerPort, 
            securityPluginServerUrls = securityPluginInfo.ServerUrls
        if(securityPluginServerUrls.applicationRegistration){
            registerationApi = securityPluginBaseUrl +':'+ securityPluginPort +'/' + securityPluginServerUrls.applicationRegistration
        }else{
            registerationApi = false
        }        
        return registerationApi
    }else{
        return false
    }
}

async function createPrivilegesRegisterationApi(securityPluginInfo){
    console.log("CREATING API FOR PRIVELEGES REGISTRATION WITH SECURITY PLUGIN INFO")
    let privilegesRegisterationApi
    if(securityPluginInfo && securityPluginInfo.ServerPort && securityPluginInfo.BaseUrl && securityPluginInfo.ServerUrls){
        let securityPluginBaseUrl = securityPluginInfo.BaseUrl,
            securityPluginPort = securityPluginInfo.ServerPort, 
            securityPluginServerUrls = securityPluginInfo.ServerUrls
        if(securityPluginServerUrls.privilegeRegistration){
            privilegesRegisterationApi = securityPluginBaseUrl +':'+ securityPluginPort +'/' + securityPluginServerUrls.privilegeRegistration
        }else{
            privilegesRegisterationApi = false
        }
        
        return privilegesRegisterationApi
    }else{
        return false
    }
}


async function createValidateApplicationApi(securityPluginInfo){
    let getValidateApplicationApi
    if(securityPluginInfo && securityPluginInfo.ServerPort && securityPluginInfo.BaseUrl && securityPluginInfo.ServerUrls){
        let securityPluginBaseUrl = securityPluginInfo.BaseUrl,
            securityPluginPort = securityPluginInfo.ServerPort, 
            securityPluginServerUrls = securityPluginInfo.ServerUrls
        if(securityPluginServerUrls.validateApplication){
            getValidateApplicationApi = securityPluginBaseUrl +':'+ securityPluginPort +'/' + securityPluginServerUrls.validateApplication
        }else{
            getValidateApplicationApi = false
        }            
        return getValidateApplicationApi
    }else{
        return false
    }
}


async function getSecurityPluginAuthTypeApi(securityPluginInfo){
    let getAuthenticationTypeApi
    if(securityPluginInfo && securityPluginInfo.ServerPort && securityPluginInfo.BaseUrl && securityPluginInfo.ServerUrls){
        let securityPluginBaseUrl = securityPluginInfo.BaseUrl,
            securityPluginPort = securityPluginInfo.ServerPort, 
            securityPluginServerUrls = securityPluginInfo.ServerUrls
        if(securityPluginServerUrls.getSecurityModel){
            getAuthenticationTypeApi = securityPluginBaseUrl +':'+ securityPluginPort +'/' + securityPluginServerUrls.getSecurityModel
        }else{
            getAuthenticationTypeApi = false
        }        
        return getAuthenticationTypeApi
    }else{
        return false
    }
}


async function createAuthenticationApi(securityPluginInfo){
    console.log("CREATING API FOR AUTHENTICATION")
    let authenticationApi
    if(securityPluginInfo && securityPluginInfo.ServerPort && securityPluginInfo.BaseUrl && securityPluginInfo.ServerUrls){
        let securityPluginBaseUrl = securityPluginInfo.BaseUrl,
            securityPluginPort = securityPluginInfo.ServerPort, 
            securityPluginServerUrls = securityPluginInfo.ServerUrls
        if(securityPluginServerUrls.userAuthentication){
            authenticationApi = securityPluginBaseUrl +':'+ securityPluginPort +'/' + securityPluginServerUrls.userAuthentication
        }else{
            authenticationApi = false
        }        
        return authenticationApi
    }else{
        return false
    }
}


async function createApiToGetRolesAndPrivilegesForUser(securityPluginInfo){
    console.log("CREATING API TO GET ROLES AND PRIVILEGES OF USER")
    let getRolesAndPrivilegesApi
    if(securityPluginInfo && securityPluginInfo.ServerPort && securityPluginInfo.BaseUrl && securityPluginInfo.ServerUrls){
        let securityPluginBaseUrl = securityPluginInfo.BaseUrl,
            securityPluginPort = securityPluginInfo.ServerPort, 
            securityPluginServerUrls = securityPluginInfo.ServerUrls
        if(securityPluginServerUrls.introspect){
            getRolesAndPrivilegesApi = securityPluginBaseUrl +':'+ securityPluginPort +'/' + securityPluginServerUrls.introspect
        }else{
            getRolesAndPrivilegesApi = false
        }            
        return getRolesAndPrivilegesApi
    }else{
        return false
    }
}


async function createDefaultUserApiSchema(securityPluginInfo){
    let createDefaultUserApi
    if(securityPluginInfo && securityPluginInfo.ServerPort && securityPluginInfo.BaseUrl && securityPluginInfo.ServerUrls){
        let securityPluginBaseUrl = securityPluginInfo.BaseUrl,
            securityPluginPort = securityPluginInfo.ServerPort, 
            securityPluginServerUrls = securityPluginInfo.ServerUrls
        if(securityPluginServerUrls.createDefaultUser){
            createDefaultUserApi = securityPluginBaseUrl +':'+ securityPluginPort +'/' + securityPluginServerUrls.createDefaultUser
        }else{
            createDefaultUserApi = false
        }            
        return createDefaultUserApi
    }else{
        return false
    }
}



async function createApiSchemaToGetNewToken(securityPluginInfo){
    if(securityPluginInfo && securityPluginInfo.ServerPort && securityPluginInfo.BaseUrl && securityPluginInfo.ServerUrls){
        let getNewTokenApi;
        let securityPluginBaseUrl = securityPluginInfo.BaseUrl,
            securityPluginPort = securityPluginInfo.ServerPort, 
            securityPluginServerUrls = securityPluginInfo.ServerUrls
        if(securityPluginServerUrls.getNewToken){
            getNewTokenApi = securityPluginBaseUrl +':'+ securityPluginPort +'/' + securityPluginServerUrls.getNewToken
            return {success:true, response:getNewTokenApi}
        }else{
            return {success:false, response:"'getNewToken' api field not found in the security plugin config info in DB"}
        }
    }else{
        return {success:false, response:"required fields not found in security plugin config info in DB"}
    }
}


async function licenseAppCreateApplicationApiSchema(licensePluginInfo){
    if(licensePluginInfo && licensePluginInfo.ServerPort && licensePluginInfo.BaseUrl && licensePluginInfo.ServerUrls){
        let licensePluginCreateApplicationApi;
        let licenseManagerBaseUrl = licensePluginInfo.BaseUrl,
        licensePluginPort = licensePluginInfo.ServerPort, 
        licensePluginServerUrls = licensePluginInfo.ServerUrls;
        if(licensePluginServerUrls.manageapplication){
            licensePluginCreateApplicationApi = licenseManagerBaseUrl +':'+ licensePluginPort + licensePluginServerUrls.manageapplication;
            return { success: true, response:licensePluginCreateApplicationApi}
        }else{
            return {success:false, response: "'manageapplication' api field not found in license manager config info in DB"}
        }
        
    }else{
        return {success:false, response: "required fields not found in license manager config info in DB"}
    }
}


async function licenseAppCreateApplicationFeaturesApiSchema(licensePluginInfo){
    if(licensePluginInfo && licensePluginInfo.ServerPort && licensePluginInfo.BaseUrl && licensePluginInfo.ServerUrls){
        let licensePluginCreateApplicationApi;
        let licenseManagerBaseUrl = licensePluginInfo.BaseUrl,
        licensePluginPort = licensePluginInfo.ServerPort, 
        licensePluginServerUrls = licensePluginInfo.ServerUrls;
        if(licensePluginServerUrls.associateFeatureToApp){
            licensePluginCreateApplicationApi = licenseManagerBaseUrl +':'+ licensePluginPort + licensePluginServerUrls.managefeatures;
            return { success: true, response:licensePluginCreateApplicationApi}
        }else{
            return {success:false, response: "'managefeatures' api field not found in license manager config info in DB"}
        }
        
    }else{
        return {success:false, response: "required fields not found in license manager config info in DB"}
    }
}


async function checkAppLicenseStatusApiSchema(licensePluginInfo, pluginInfoOfLicenseCheck){
    if(licensePluginInfo && licensePluginInfo.ServerPort && licensePluginInfo.BaseUrl && licensePluginInfo.ServerUrls){
        let licensePluginCreateApplicationApi;
        let licenseManagerBaseUrl = licensePluginInfo.BaseUrl,
        licensePluginPort = licensePluginInfo.ServerPort, 
        licensePluginServerUrls = licensePluginInfo.ServerUrls;
        let portalKeyFile = await getPortalKeyFile()
        if(portalKeyFile.success === true){
            let customerKey = portalKeyFile.response.CustomerID ? portalKeyFile.response.CustomerID : null
            if(licensePluginServerUrls.checkapplicationstatus && customerKey){
                licensePluginCreateApplicationApi = licenseManagerBaseUrl +':'+ licensePluginPort + licensePluginServerUrls.checkapplicationstatus + '/'+customerKey + '/'+ pluginInfoOfLicenseCheck.uniqueName;
                return { success: true, response:licensePluginCreateApplicationApi}
            }else{
                return {success:false, response: "'checkapplicationstatus' api field not found in license manager config info in DB or customerID not found in portalkey file"}
            }
        }else{
            return {success:false, response: "portalkey file not found for check the license status of app"}
        }

        
    }else{
        return {success:false, response: "required fields not found in license manager config info in DB"}
    }
}



async function licenseAppDumpEcPluginsLicenseInfoApiSchema(licensePluginInfo){
    if(licensePluginInfo && licensePluginInfo.ServerPort && licensePluginInfo.BaseUrl && licensePluginInfo.ServerUrls){
        let licensePluginDumpEcPluginsLicenseInfoApi;
        let licenseManagerBaseUrl = licensePluginInfo.BaseUrl,
        licensePluginPort = licensePluginInfo.ServerPort, 
        licensePluginServerUrls = licensePluginInfo.ServerUrls;
        if(licensePluginServerUrls.managelicenses){
            licensePluginDumpEcPluginsLicenseInfoApi = licenseManagerBaseUrl +':'+ licensePluginPort + licensePluginServerUrls.managelicenses;
            return { success: true, response:licensePluginDumpEcPluginsLicenseInfoApi}
        }else{
            return {success:false, response: "'managelicenses' api field not found in license manager config info in DB"}
        }
    }else{
        return {success:false, response: "required fields not found in license manager config info in DB"}
    }
}


async function registerWithNotificationAppApi(notificationPluginInfo){
    if(notificationPluginInfo && notificationPluginInfo.ServerPort && notificationPluginInfo.BaseUrl && notificationPluginInfo.ServerUrls){
        let registerAppWithNotificationApi;
        let notificationManagerBaseUrl = notificationPluginInfo.BaseUrl,
        notificationPluginPort = notificationPluginInfo.ServerPort, 
        notificationPluginServerUrls = notificationPluginInfo.ServerUrls;
        if(notificationPluginServerUrls.registerapplicationprofile){
            registerAppWithNotificationApi = notificationManagerBaseUrl +':'+ notificationPluginPort + notificationPluginServerUrls.registerapplicationprofile +'/register';
            return { success: true, response:registerAppWithNotificationApi}
        }else{
            return {success:false, response: "'registerapplicationprofile' api field not found in notification manager config info in DB"}
        }
    }else{
        return {success:false, response: "required fields not found in notification manager config info in DB"}
    }
}


async function sendNotificationApi(notificationPluginInfo){
    if(notificationPluginInfo && notificationPluginInfo.ServerPort && notificationPluginInfo.BaseUrl && notificationPluginInfo.ServerUrls){
        let sendNotificationApi;
        let notificationManagerBaseUrl = notificationPluginInfo.BaseUrl,
        notificationPluginPort = notificationPluginInfo.ServerPort, 
        notificationPluginServerUrls = notificationPluginInfo.ServerUrls;
        if(notificationPluginServerUrls.managemessage){
            sendNotificationApi = notificationManagerBaseUrl +':'+ notificationPluginPort + notificationPluginServerUrls.managemessage;
            return { success: true, response:sendNotificationApi}
        }else{
            return {success:false, response: "'managemessage' api field not found in notification manager config info in DB"}
        }
    }else{
        return {success:false, response: "required fields not found in notification manager config info in DB"}
    }
}



async function createApiSchemaForSecurityPlugin(reqApi,reqMethod,requestBody,hashedBase64,reqHeaders){
    // console.log("------------->requestBody:",requestBody)
    let headers = hashedBase64 ? { "Content-Type" : 'application/json', "Authorization" : "Basic "+hashedBase64} : { "Content-Type" : 'application/json'}
    if(reqHeaders){
        headers["accesstoken"] = reqHeaders
    }
    let apiSchema
    if(((reqMethod).toLowerCase() == "put") || (reqMethod).toLowerCase() == "post" || ((reqMethod).toLowerCase() == "delete")){
        // requestBody = JSON.stringify(requestBody)
        apiSchema = {
            requestApi : reqApi,
            requestMethod : reqMethod,
            requestHeaders : headers,
            requestBody : requestBody
        }
      }else{
        apiSchema = {
            requestApi : reqApi,
            requestMethod : reqMethod,
            requestHeaders : headers
        }
      }

    return apiSchema
}

async function createAppConfigInfoSchema(appConfig){
    let appConfigInfo = {
        Name : appConfig.name,
        Description : appConfig.description,
        UniqueName : appConfig.uniqueName,
        Version : appConfig.version,
        UiPort : 4200,
        BaseUrl : appConfig.baseUrl,
        ServerPort : appConfig.serverPort,
        SecurityApp : appConfig.securityApp,
        Type : 'Default',
        Privileges : appConfig.privileges,
        IsRegistered : false,  
        ServicesEnabled : appConfig.isServicesEnabled         
    }
    return appConfigInfo
}


async function getDBInfo(){
    let dbInfo = {
        db: config.options.dialect,
        username: config.username,        
        password: config.password,
        database: config.database,
        host: config.options.host,
        server: config.server,
        instance : config.options.dialectOptions.options.instanceName
    }
    return dbInfo
}


async function createResponse(status, respData, errorData){
    // console.log("%%% EROR DATA:",errorData)
    let response = {
        responseCode : status[0],
        statusCode : status[2]
    }

    if(status[0] != 0){
        response.statusMessage = status[1]
    }

    if(respData){
        response.data = respData
    }

    if(errorData){
        response.errorMessage = errorData
    }

    return response;
}


function sendResponse(req,res,message,next){
    //console.log("%%%:",req.headers)
    // console.log("+++++++++++++++++> req.url",req.originalUrl)
    let logMsg = message.responseCode == 0 ? "[RESPONSE-CODE:"+message.responseCode+", Status-code:"+ message.statusCode+"]" : "[RESPONSE:"+JSON.stringify(message)+"]"
    // let logUser = req.session.user ? req.session.user : req.headers.accesstoken
    let logUser = req.headers.accesstoken
    let log = JSON.stringify(`${req.originalUrl}`)+"\t"+JSON.stringify(logMsg) +"\t" + JSON.stringify(`${logUser}`)
    if(message.statusCode != 200){
      logger.error(log)  
    }else{
        
        // let log = message.responseCode ? message.responseCode : message
        logger.info(log)
    }
    if((req.headers['content-type'] && req.headers['content-type'].toLowerCase().indexOf("xml") != -1) || (req.headers['accept'] && req.headers['accept'].toLowerCase().indexOf("xml") != -1)){
        res.set('Content-Type', 'text/xml');
        res.status(message.statusCode).send(o2x({
            '?xml version="1.0" encoding="utf-8"?' : null,
            message
        }));
    }else{
        // console.log("7777&&&& MESSAGE:",message)
        res.status(message.statusCode).send(message)
    }
    
}


async function createHmacHash(ApplicationId, ApplicationSecret){
    // console.log("Secret key:", ApplicationSecret)
    // let UtcDateTime = moment.utc().valueOf();
    let UtcDateTime = moment.utc().format();
    // console.log("MOMENT TIME:", UtcDateTime)
    let hmac = await crypto.createHmac('sha256', ApplicationSecret).update(UtcDateTime.toString()).digest('hex');
    // console.log("UtcDateTime.toString():",UtcDateTime.toString())
    // console.log("HMAC:",hmac)
    let jsonObj = ApplicationId + ":" + UtcDateTime.toString() + ":" + hmac;
    let hashedBase64 = Buffer.from(jsonObj).toString('base64')
    console.log("hashedBase64:",hashedBase64)
    return hashedBase64
}





async function createRegisterApplicationBody(appName,appVersion,adminName,adminEmail,appPrivileges){
    let requestBody = {
      ApplicationRegistration : {
        ApplicationName : appName,
        ApplicationVersion : appVersion,
        AdminName : adminName,
        AdminEmail : adminEmail,
        PrivilegeDetails : {
            Privilege : []
        }
      }
    }
    let returnObj 
    if(_.isArray(appPrivileges)){
        let privilegeArr = []
        let count = 0
        _.forEach(appPrivileges,(privilege)=>{
            let privilegeSchema =  {
                name : privilege.name,
                key : privilege.key
            }  
      
            count = count + 1
            privilegeArr.push(privilegeSchema)
            if(count == appPrivileges.length){
            //   console.log("privilegeArr : ",privilegeArr)
              if(privilegeArr < appPrivileges.length){
                returnObj= {success : false, response : "Privileges schema should have to be (name,key)"}
              }else{
                // console.log("privilegeArr success in register api schema")
                requestBody.ApplicationRegistration.PrivilegeDetails.Privilege = privilegeArr
                returnObj = {success : true, response : requestBody}
              }         
            }
        })
    }else if(_.isPlainObject(appPrivileges)){
        let privilegeArr = []
        privilegeArr.push(appPrivileges)
        requestBody.ApplicationRegistration.PrivilegeDetails.Privilege = privilegeArr
        returnObj = {success : true, response : requestBody}
    }else{
        returnObj = { success: false , response : "Privileges should have to be in Array in configuration file"}
    }
    return returnObj
}


async function createPrivilegeRegistrationApiBody(appPrivileges){
    let privilegeArr = []
    let configFilePrivileges = appPrivileges
    let returnObj 
    if(_.isArray(configFilePrivileges)){
      let count = 0
      let requestBody2 = {
        privilegeregistration : {
          privilege : []
        }
      }
      _.forEach(configFilePrivileges,(configPrivilege)=>{
        let privilegeSchema =  {
            name : configPrivilege.name,
            key : configPrivilege.key
        }  
  
        count = count + 1
        privilegeArr.push(privilegeSchema)
        if(count == configFilePrivileges.length){
        //   console.log("privilegeArr : ",privilegeArr)
          if(privilegeArr < configFilePrivileges.length){
            returnObj= {success : false, response : "Privileges schema should have to be (name,key)"}
          }else{
            // console.log("privilegeArr success ")
            requestBody2.privilegeregistration.privilege = privilegeArr
            returnObj = {success : true, response : requestBody2}
          }         
        }
      })
    }else{
      returnObj = { success: false , response : "Privileges should have to be in Array in configuration file"}
    }  
    return returnObj  
}


async function createLDAPauthenticationApiReqBody(userName, password, authenticationType){
    let requestBody = {
        authenticationRequest : {
            authenticationType : authenticationType,
            authenticationMethod : 'Password',
            authenticationParameters : {
                username : userName,
                password : password,
                // domainname : 'icuinnov.corp' // ISAS removed the domain name for latest build
            }
        }
    }
    return requestBody;
}


async function createStandaloneUserAuthenticationApiReqBody(userName, password, authenticationType){
    let requestBody = {
        authenticationRequest : {
            authenticationType : authenticationType,
            authenticationMethod : 'Password',
            authenticationParameters : {
                username : userName,
                password : password
            }
        }
    }
    return requestBody;
}


async function createDefaultUserReqBody(rootNodeInfo){
    let requestBody = {
        defaultUserRequest: {
            nodeinfo: {
                uid: rootNodeInfo.Uid,
                nodeid: rootNodeInfo.NodeID,
                nodename: rootNodeInfo.NodeName,
                nodetype: rootNodeInfo.NodeType
            }
        }
    }
    return requestBody;
}


async function createReqBodyOfValidateApplication(accessToken){
    let reqBody = {
        Validateapplicationrequest:{
            Applicationtoken: accessToken
        }
    }
    return reqBody;  
}


async function createReqBodyOfGetNewToken(refreshToken){
    let reqBody = {
        newtokenrequest : {
            refreshtoken : refreshToken
        }
    }
    return reqBody;
}

async function createReqBodyToSendNotification(msgProfileKey, msgProfilePriority, msgCategory, msgText, msgAdditionalInfo){
    let reqBody = {
        item: [
            {
                msg_app_key: AppConfig.uniqueName,
                msg_profile_key: msgProfileKey,
                msg_profile_priority: msgProfilePriority,
                msg_category: msgCategory,
                msg_text: msgText,
                msg_additional_info: msgAdditionalInfo
            }
        ]
    }
        
    return reqBody;  
}


async function createReqBodyOfRegistrationWithNotificationApp(msgProfileKey, msgProfileDisplyTxt, msgPriority){
    let reqBody = {
        item: {
            app_key: AppConfig.uniqueName,
            app_name: AppConfig.name,
            msg_profile_key: msgProfileKey,
            msg_profile_display_text: msgProfileDisplyTxt,
            msg_profile_priority: msgPriority
        }
    }
    return reqBody;  
}


async function licenseAppCreateApplicationApiReqBody(applications){
    if(_.isArray(applications)){
        let reqBody = {
            item : applications
        }
        return { success:true, response: reqBody}
    }else{
        return {success:false, response: "applications should have to be in Array to post the data to license manager App"}
    }
}


async function licenseAppApplicationFeaturesApiReqBody(licensedApplicationFeatures){
    if(_.isArray(licensedApplicationFeatures)){
        let reqBody = {
            item : licensedApplicationFeatures
        }
        return { success:true, response: reqBody}
    }else{
        return {success:false, response: "applications features should have to be in Array to post the data to license manager App"}
    }
}

async function createDumpEcPluginsInfoReqBody(pluginsLicenseInfo){
    if(_.isArray(pluginsLicenseInfo)){
        let reqBody = {
            item : pluginsLicenseInfo
        }
        return { success:true, response: reqBody}
    }else{
        return {success:false, response: "pluginsLicenseInfo should have to be in Array to post the data to license manager App"}
    }
}


async function createGetPortalAccesstokenReqBody(customerId){
    if(customerId){
        let reqBody = {
            CustomerId : customerId
        }
        return {success: true, response: reqBody}
    }else{
        return {success: true, response: "'CutomerId' not found to create req body of getAccesstoken from portal"}
    }
}



async function createReqBodyToGetRolesAndPrivilegesForUser(userAccessToken, siteId){
    let requestBody = {
        introspectrequest : {
          accesstoken : userAccessToken,
          siteid : siteId
        }
    }
    return requestBody;
}


async function getDetectedPluginConfigFiles(){
    let acceptedPluginConfigFiles = [], rejectedPluginsConfigFiles = [], pluginConfigFiles = {}
    return new Promise((resolve,reject)=>{
        glob(process.env.PLUGINS_PATH, async function(err,files){
            if(err){
                reject(err)
            }else{
                if(files && files.length > 0){
                    let totalCount = files.length, acceptedCount = 0, rejectedCount = 0
                    for(let i=0;i<files.length;i++){
                        let plugingData =await require('../'+files[i]);
                        if(plugingData && plugingData.name && plugingData.serverPort && plugingData.baseUrl && plugingData.prependUrl){
            
                        acceptedCount = acceptedCount + 1
                        acceptedPluginConfigFiles.push(plugingData)    
                        }else{
                        rejectedCount = rejectedCount + 1
                        rejectedPluginsConfigFiles.push(plugingData)
                        }

                        if(totalCount == acceptedCount + rejectedCount){
                            // console.log("#####%%% REJECTED PLUGINS :",rejectedCount)
                            // console.log("#####%%% ACCEPTED PLUGINS :",acceptedCount)
                            console.log("#####%%% TOTAL DETECTED PLUGINS :",totalCount)
                            pluginConfigFiles.acceptedPluginConfigFiles = acceptedPluginConfigFiles
                            pluginConfigFiles.rejectedPluginsConfigFiles = rejectedPluginsConfigFiles
                            
                            resolve(pluginConfigFiles)
                        }
            
                    }
                }else{
                    pluginConfigFiles.acceptedPluginConfigFiles = acceptedPluginConfigFiles
                    pluginConfigFiles.rejectedPluginsConfigFiles = rejectedPluginsConfigFiles

                    resolve(pluginConfigFiles)
                }
        
            }
        })
      })
}


async function getPortalKeyFile(){
    try{
        let portalKeyFile = fs.readFileSync(`${appRoot}/shared/${process.env.PORTAL_MUTUAL_KEY_FILE}`);
        if(portalKeyFile){
          portalKeyFile = JSON.parse(portalKeyFile);
          return {success:true, response:portalKeyFile}
        }else{
          return {success:false, response:"Portal mutual key file not found"}
        } 
    }catch(error){
        return {success:false, response:"Portal mutual key file not found"}
    }

}



async function createUserSession(req, response){
   /*  console.log("###@@@ SESSION INFO :",req.session)
    console.log("###@@@ SESSION INFO :",req.session.id)
    console.log("###@@@ response INFO :",response) */
    // console.log("###@@@ Came to create session in utils js:",req.session)
    try{
        // let sessionId  = req.session.id, seesionExpiry = req.session.cookie.originalMaxAge = response.ExpiresIn * 60
        // let sessionId  = req.session.id, seesionExpiry  = new Date(Date.now() + 3600000) 
        // let sessionId  = req.session.id, seesionExpiry  = new Date(response.AccessToken_ExpiryTime).toISOString()
        // console.log("###@@@ SESSION OBJ response.AccessToken_ExpiryTime :",response.AccessToken_ExpiryTime)
        let currentExpiryTime = new Date(response.AccessToken_ExpiryTime) - new Date(Date.now())

        let sessionId  = req.session.id, sessionExpiry  = new Date(Date.now() + parseInt(currentExpiryTime))
        // console.log("###@@@ SESSION OBJ :",sessionExpiry)
        let sessionObj = {
            sessionId : sessionId,
            userName : response.UserDetails.Username,
            mappedPrivileges : response.MappedPrivileges,
            expires : sessionExpiry,
            // tokenRefreshedAt : new Date(Date.now()),
            // data : currentExpiryTime,
            // tokenTimeOutInterval : currentExpiryTime
        }
        // console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$ Session:",sessionObj)
        req.session.userName = response.UserDetails.Username
        req.session.accessToken = response.AccessToken
        req.session.refreshToken = response.RefreshToken
        req.session.privileges = JSON.stringify(response.MappedPrivileges)
        req.session.expires = sessionExpiry
        req.session.tokenRefreshedAt = new Date(Date.now()),
        // req.session.data = currentExpiryTime
        req.session.tokenTimeOutInterval = currentExpiryTime
        // console.log("###@@@ Before saving session in utils js:",req.session)
        // console.log("-------------------------:",req.session.cookie)
        // console.log("=======================",req.session.expires)
        /* return models.mySessionStore.set(sessionId,sessionObj,(err,resp)=>{
            if(err){
                console.log("###@@@ err INFO :",err)
            }
            console.log("RRRRR:",resp)
            return _.assign({},response,{sessionId:sessionId, expires : seesionExpiry})
        }) */

       /*  req.session.save((err,resp)=>{
            if(err){
                console.log("###@@@ err INFO :",err)
            }
            console.log("Created Session")
        }) */
       /*  models.mySessionStore.save(req.session).then(resp=>{
            console.log("Created Session:",resp)
        }).catch(err=>{
            console.log("ERR Created Session:",err)
        }) */
        // return _.assign({},response,{sessionId:sessionId, expires : seesionExpiry})
        return sessionObj
        
    }catch(error){
        console.log("Error of session creation:",error)
        let currentExpiryTime = new Date(response.AccessToken_ExpiryTime) - new Date(Date.now())

        let sessionId  = req.session.id, sessionExpiry  = new Date(Date.now() + parseInt(currentExpiryTime))
        let sessionObj = {
            sessionId : sessionId,
            userName : response.userName,
            mappedPrivileges : response.MappedPrivileges,
            // authenticationType : response.authenticationType,
            expires : sessionExpiry,
            // tokenRefreshedAt : new Date(Date.now()),
            // tokenTimeOutInterval : currentExpiryTime
            // data : currentExpiryTime
        }
        return sessionObj
    }


}




/* function assignAutoIncrementNumber(callback){
    fs.exists('auto-increment.json', function(exists) {
        if (exists) {
            let rawdata = fs.readFileSync('auto-increment.json');
            let data = JSON.parse(rawdata);
            console.log("INCREMENT NUMBER",data);
            data.incrementNumber = data.incrementNumber + 1

            fs.writeFileSync('auto-increment.json', JSON.stringify(data),(err)=>{
                if(err){
                    console.log(err)
                }else{
                    console.log("Created successfully")
                }
            });
            let id = data.incrementNumber
            callback(null,id);
        }else{
            let obj = {
                incrementNumber : 1
            }
            let json = JSON.stringify(obj);
            fs.writeFile('auto-increment.json', json,(err)=>{
            if(err){
                console.log(err)
            }else
                console.log("Created successfully")
            });
            let id = obj.incrementNumber
            callback(null,id);
        }
    });
} */

module.exports = {
    schemaOfPluginConfigInfo : schemaOfPluginConfigInfo,
    schemaOfNodeCreation : schemaOfNodeCreation,
    createRegisterationApi : createRegisterationApi,
    createPrivilegesRegisterationApi : createPrivilegesRegisterationApi,
    createValidateApplicationApi : createValidateApplicationApi,
    getSecurityPluginAuthTypeApi : getSecurityPluginAuthTypeApi,
    createApiToGetPluginConfigDetails : createApiToGetPluginConfigDetails,
    createPrivilegeRegistrationApiBody : createPrivilegeRegistrationApiBody,
    createApiSchemaForSecurityPlugin : createApiSchemaForSecurityPlugin,
    createLDAPauthenticationApiReqBody : createLDAPauthenticationApiReqBody,
    createImprivataAuthenticationApiReqBody : createLDAPauthenticationApiReqBody,
    createStandaloneUserAuthenticationApiReqBody : createStandaloneUserAuthenticationApiReqBody,
    createDefaultUserReqBody : createDefaultUserReqBody,
    createReqBodyOfValidateApplication : createReqBodyOfValidateApplication,
    createReqBodyOfGetNewToken : createReqBodyOfGetNewToken,
    createReqBodyOfRegistrationWithNotificationApp : createReqBodyOfRegistrationWithNotificationApp,
    createReqBodyToSendNotification : createReqBodyToSendNotification,
    licenseAppCreateApplicationApiReqBody : licenseAppCreateApplicationApiReqBody,
    licenseAppApplicationFeaturesApiReqBody : licenseAppApplicationFeaturesApiReqBody,
    createDumpEcPluginsInfoReqBody : createDumpEcPluginsInfoReqBody,
    createGetPortalAccesstokenReqBody : createGetPortalAccesstokenReqBody,
    createAuthenticationApi : createAuthenticationApi,
    createApiToGetRolesAndPrivilegesForUser : createApiToGetRolesAndPrivilegesForUser,
    createDefaultUserApiSchema : createDefaultUserApiSchema,
    createApiSchemaToGetNewToken : createApiSchemaToGetNewToken,
    createReqBodyToGetRolesAndPrivilegesForUser : createReqBodyToGetRolesAndPrivilegesForUser,
    licenseAppCreateApplicationApiSchema : licenseAppCreateApplicationApiSchema,
    licenseAppCreateApplicationFeaturesApiSchema : licenseAppCreateApplicationFeaturesApiSchema,
    checkAppLicenseStatusApiSchema : checkAppLicenseStatusApiSchema,
    licenseAppDumpEcPluginsLicenseInfoApiSchema : licenseAppDumpEcPluginsLicenseInfoApiSchema,
    registerWithNotificationAppApi : registerWithNotificationAppApi,
    sendNotificationApi : sendNotificationApi,
    createUserSession : createUserSession,
    createAppConfigInfoSchema : createAppConfigInfoSchema,
    getDBInfo : getDBInfo,

    sendResponse : sendResponse,
    createResponse : createResponse,
    // assignAutoIncrementNumber : assignAutoIncrementNumber,
    createHmacHash : createHmacHash,
    getDetectedPluginConfigFiles : getDetectedPluginConfigFiles,
    createRegisterApplicationBody : createRegisterApplicationBody,
    getPortalKeyFile :getPortalKeyFile

}