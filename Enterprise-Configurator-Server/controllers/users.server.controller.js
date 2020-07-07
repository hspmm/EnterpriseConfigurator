

var STATUS = require('../utils/status-codes-messages.utils');
var commonUtils = require('../utils/common.utils');
const AppConfig = require('../config/app-config');
var env = process.env.NODE_ENV || 'development';
var config = require('../config/db.config')[env];
// const exec = require('child_process').exec;
// var pm2 = require('pm2');
// var devConfig = require('../config/db.config')['development'];
// var pluginsRoute = require('./plugins.server.controller');
var ISASctrl = require('./isas.server.controller');
var CommonCtrl = require('./common.server.controller');
const _ = require('lodash');
const models = require('../models');



/***************************************
************AUTHENTICATION *************
****************************************/
async function login(req,res,next){    
    if(AppConfig.isISASEnabled === true ){
        let userName = req.body.userDetails.userName, password = req.body.userDetails.password
        //  authenticationType = req.body.authType
        let appName = AppConfig.name, appVersion = AppConfig.version;
        let appAdminName = AppConfig.adminName ? AppConfig.adminName : null
        let appAdminEmail = AppConfig.adminEmail ? AppConfig.adminEmail : null
        let appPrivileges = AppConfig.privileges ? AppConfig.privileges : []
    
        let respOfIsRegisteredApp = await ISASctrl.isRegisteredAppWithSecurityPlugin(appName, appVersion, appAdminName, appAdminEmail, appPrivileges)
        if(respOfIsRegisteredApp && (respOfIsRegisteredApp.success === true) && (respOfIsRegisteredApp.response.RegistrationResponse.ErrorCode == 0)){
            let appRegistrationResp = respOfIsRegisteredApp.response.RegistrationResponse
            let securityPlugin = await ISASctrl.getSecurityPluginConfigInfo()
            let getAuthenticationType = await getAuthenticationTypeFormSecurityPlugin(securityPlugin,appRegistrationResp)
           if(getAuthenticationType.success === true){
            let requestBody = await getAuthReqBodyBasedOnAuthType(getAuthenticationType.response, userName, password)
            let authenticationApi = await commonUtils.createAuthenticationApi(securityPlugin)
            let hashedBase64 = await commonUtils.createHmacHash(appRegistrationResp.Application_Id, appRegistrationResp.Application_Secret)
            let apiSchema = await commonUtils.createApiSchemaForSecurityPlugin(authenticationApi,'POST',requestBody,hashedBase64)
            apiSchema.requestHeaders['x-forwarded-for'] = req.connection.remoteAddress
            ISASctrl.fetchSecurityPluginApi(apiSchema).then(async successRes =>{
                if(successRes.AuthenticationResponse.ErrorCode == 0){
                    let rolesAndPrivileges = await getRolesAndPrivilegesForUser(securityPlugin, appRegistrationResp.Application_Id, appRegistrationResp.Application_Secret, successRes.AuthenticationResponse)
                    if(rolesAndPrivileges.success === true){
                        let finalResponse = await _.assign({}, successRes.AuthenticationResponse, rolesAndPrivileges.response.IntrospectResponse);
                        let sessionObj = await commonUtils.createUserSession(req, finalResponse)
                        await createSessionLog(sessionObj)
                        CommonCtrl.SendNotification(AppConfig.appNotificationAlerts.authenticationAlerts.key, 'high', 'normal', sessionObj.userName+' is authenticated with EC', '')
                        let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, sessionObj) 
                        commonUtils.sendResponse(req, res, createdResp, next)
                    }else{
                        CommonCtrl.SendNotification(AppConfig.appNotificationAlerts.authenticationAlerts.key, 'high', 'normal', 'Someone trying to login with '+userName, 'Failed to fetch the user privileges')
                        let createdResp = await commonUtils.createResponse(STATUS.ERROR.AUTEHNTICATION_FAILED_INTERNAL_ERROR) 
                        commonUtils.sendResponse(req, res, createdResp, next) 
                    }
                }else{
                    // console.log("AUTHENTICATION TYPE:",getAuthenticationType.response)
                    // console.log("AUTHENTICATION ERROR:",successRes)
                    CommonCtrl.SendNotification(AppConfig.appNotificationAlerts.authenticationAlerts.key, 'high', 'normal', successRes.AuthenticationResponse.ErrorText, 'Someone trying to login with '+userName)
                    let createdResp = await commonUtils.createResponse(STATUS.ERROR.AUTEHNTICATION_FAILED, '',successRes.AuthenticationResponse) 
                    commonUtils.sendResponse(req, res, createdResp, next) 
                }
            }).catch(async error =>{
                if(error.AuthenticationResponse && error.AuthenticationResponse.ErrorCode != 0){
                    CommonCtrl.SendNotification(AppConfig.appNotificationAlerts.authenticationAlerts.key, 'high', 'normal', error.AuthenticationResponse.ErrorText, 'Someone trying to login with '+userName,)
                    let createdResp = await commonUtils.createResponse(STATUS.ERROR.AUTEHNTICATION_FAILED,'',error.AuthenticationResponse) 
                    commonUtils.sendResponse(req, res, createdResp, next)
                }else{
                    CommonCtrl.SendNotification(AppConfig.appNotificationAlerts.authenticationAlerts.key, 'high', 'normal', 'Failed to login', 'Someone trying to login with '+userName,)
                    let createdResp = await commonUtils.createResponse(STATUS.ERROR.AUTEHNTICATION_FAILED_INTERNAL_ERROR) 
                    commonUtils.sendResponse(req, res, createdResp, next)
                }
            })
           }else{
            CommonCtrl.SendNotification(AppConfig.appNotificationAlerts.authenticationAlerts.key, 'high', 'normal', 'Failed to login', 'Someone trying to login with '+userName)
            let createdResp = await commonUtils.createResponse(STATUS.ERROR.AUTEHNTICATION_FAILED_INTERNAL_ERROR) 
            commonUtils.sendResponse(req, res, createdResp, next)
           }
        }else{
            CommonCtrl.SendNotification(AppConfig.appNotificationAlerts.authenticationAlerts.key, 'high', 'normal', 'Failed to login', 'Someone trying to login with '+userName)
            let createdResp = await commonUtils.createResponse(STATUS.ERROR.AUTEHNTICATION_FAILED_INTERNAL_ERROR) 
            commonUtils.sendResponse(req, res, createdResp, next)
        }
    }else{
        CommonCtrl.SendNotification(AppConfig.appNotificationAlerts.authenticationAlerts.key, 'high', 'normal', 'Failed to login, All the services are disabled', 'Someone trying to login with '+userName)
        let createdResp = await commonUtils.createResponse(STATUS.ERROR.AUTEHNTICATION_FAILED_INTERNAL_ERROR) 
        commonUtils.sendResponse(req, res, createdResp, next)
    }
}



async function getAuthenticationTypeFormSecurityPlugin(securityPlugin,appRegistrationResp){
    let getAuthTypeApi = await commonUtils.getSecurityPluginAuthTypeApi(securityPlugin)
    let hashedBase64 = await commonUtils.createHmacHash(appRegistrationResp.Application_Id, appRegistrationResp.Application_Secret)
    let apiSchema = await commonUtils.createApiSchemaForSecurityPlugin(getAuthTypeApi,'GET',null,hashedBase64,null)
    return ISASctrl.fetchSecurityPluginApi(apiSchema).then(async successRes =>{
        if(successRes && successRes.SecurityModelDetailsResponse.ErrorCode == 0){
            return {success:true, response:successRes}
        }else{
            return {success:false, response:successRes}
        }
    }).catch(error=>{
        return {success:false, response:error}
    })
}


async function getAuthReqBodyBasedOnAuthType(getAuthTypeResp, userName, password){
    let authenticationType = getAuthTypeResp.SecurityModelDetailsResponse.SecurityModel
    let requestBody
    if((authenticationType).toLowerCase() == (config.IsasStandaloneUserAuthentication).toLowerCase()){
        requestBody = await commonUtils.createStandaloneUserAuthenticationApiReqBody(userName, password, authenticationType)
    }else if((authenticationType).toLowerCase() === (config.IsasLdapAuthentication).toLowerCase()){
        requestBody = await commonUtils.createLDAPauthenticationApiReqBody(userName, password, authenticationType)
    }else if((authenticationType).toLowerCase() === (config.IsasImprivataAuthentication).toLowerCase()){
        requestBody = await commonUtils.createImprivataAuthenticationApiReqBody(userName, password, authenticationType)
    }
    return requestBody
}


/********** CREATE SESSION LOGS *****************/
async function createSessionLog (sessionObj){
    try{
        let sessionObj1 = {
            sid : sessionObj.sessionId,
            userName : sessionObj.userName,
            expires : sessionObj.expires,
        }
        return models.Session_Logs.create(sessionObj1).then(sessResp =>{
            return true
        }).catch(error =>{
            console.log("error Storing Session Log",error)
            return false
        })
    }catch(err){
        console.log("error Storing Session Log",err)
        return false
    }

}



/******************* GET ROLES AND PRIVILEGES OF USER ********************/
async function getRolesAndPrivilegesForUser(securityPlugin, ApplicationId, ApplicationSecret, userTokenInfo){
    let userAccessToken = userTokenInfo.AccessToken
    let siteId = "1"
    let getRolesAndPrivilegesOfUserApi = await commonUtils.createApiToGetRolesAndPrivilegesForUser(securityPlugin)
    let reqBodyToGetRolesAndPrivilegesForUser = await commonUtils.createReqBodyToGetRolesAndPrivilegesForUser(userAccessToken, siteId)
    let hashedBase64 = await commonUtils.createHmacHash(ApplicationId, ApplicationSecret)
    let apiSchema = await commonUtils.createApiSchemaForSecurityPlugin(getRolesAndPrivilegesOfUserApi,'POST',reqBodyToGetRolesAndPrivilegesForUser,hashedBase64)
    return ISASctrl.fetchSecurityPluginApi(apiSchema).then(succesResp =>{
        return {success: true, response:succesResp}
    }).catch(error =>{
        return {success: false, response:error}
    })
}



/********************* USER LOGOUT ************************/
async function logout(req, res, next){
    if(req.headers.accesstoken){
        let accessToken = req.headers.accesstoken
        try{
            models.mySessionStore.destroy(accessToken,async (err,sessionData)=>{
                if(sessionData || (accessToken && sessionData == null)){
                    if((accessToken && sessionData == null)){
                        let expiredUserLog = await CommonCtrl.getExpiredUserSessionLog(req.headers.accesstoken)
                        if(expiredUserLog.success === true){
                            CommonCtrl.SendNotification(AppConfig.appNotificationAlerts.authenticationAlerts.key, 'high', 'normal', expiredUserLog.response.userName+ ' session expired', '')
                        }
                    }else{
                        CommonCtrl.SendNotification(AppConfig.appNotificationAlerts.authenticationAlerts.key, 'high', 'normal', sessionData.userName+ ' logged-out successfully', '')
                    }                    
                    let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, "Successfully logout") 
                    commonUtils.sendResponse(req, res, createdResp, next)
                }else{
                    console.log("Checking session error:",err)
                    let createdResp = await commonUtils.createResponse(STATUS.ERROR.AUTEHNTICATION_FAILED_INTERNAL_ERROR, '',"Token not valid") 
                    commonUtils.sendResponse(req, res, createdResp, next)
                }
            })
        }catch(error){
            console.log("Checking session error:",error)
            let createdResp = await commonUtils.createResponse(STATUS.ERROR.AUTEHNTICATION_FAILED_INTERNAL_ERROR, '',"Token not valid") 
            commonUtils.sendResponse(req, res, createdResp, next)
        }
    }else{
        let createdResp = await commonUtils.createResponse(STATUS.ERROR.AUTEHNTICATION_FAILED_INTERNAL_ERROR, '',"Token not found in headers") 
        commonUtils.sendResponse(req, res, createdResp, next)
    }
}





// /********************* AVAILABLE AUTHENTICATION TYPES ************************/
// async function getAuthTypes(req, res, next){
//     let authTypes = await commonUtils.getAvailableAuthTypes()
//     // console.log("AUTH TYPES:",authTypes)
//     let createdResp = commonUtils.createResponse(STATUS.SUCCESS, authTypes) 
//     commonUtils.sendResponse(req, res, createdResp, next)
// }




/********************* GET EC CONFIG DETAILS ************************/
async function getAppConfigInfo(req,res, next){
    try{
        let appConfigInfo = await commonUtils.createAppConfigInfoSchema(AppConfig)
        let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, appConfigInfo) 
        commonUtils.sendResponse(req, res, createdResp, next)
    }catch(error){
        let createdResp = await commonUtils.createResponse(STATUS.ERROR.APP_CONFIG_INFO,'',error) 
        commonUtils.sendResponse(req, res, createdResp, next)
    }
}



/******************* DB CONNECTION INFO ********************/
/* async function dbConnectionInfo(req,res,next){
    let dbInfo = await commonUtils.getDBInfo()

    let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, dbInfo) 
    commonUtils.sendResponse(req, res, createdResp, next)
} */



/******************* DEV DB CONNECTION INFO ********************/
/* async function dbDevConnectionInfo(req,res,next){
    let dbInfo = {
        db: devConfig.options.dialect,
        username: devConfig.username,        
        password: devConfig.password,
        database: devConfig.database,
        host: devConfig.options.host,
        server: devConfig.server,
        instance : devConfig.options.dialectOptions.options.instanceName
        
    }

    let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, dbInfo) 
    commonUtils.sendResponse(req, res, createdResp, next)
} */



/******************* EC SERVER DETAILS ********************/
/* async function serverDetails(req,res, next){
    let serverURL = config.url+':'+process.env.PORT
    let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, serverURL) 
    commonUtils.sendResponse(req, res, createdResp, next)
} */


/******************* CHECK USER VALIDATION DETAILS ********************/
async function checkValidUser(req, res, next) {
    // console.log("Coming to controller:",req.headers.accesstoken)
    let sessionId = req.headers.accesstoken
    let userSessionInfo = await CommonCtrl.getUserSessionById(sessionId);
    // console.log("userSessionInfo:",userSessionInfo)
    if (userSessionInfo.success) {
        let sessionInfo = userSessionInfo.response
        let updateSession = await CommonCtrl.updateSessionExpiry(userSessionInfo.response);
        let userSessionObj = {
            sessionId: sessionInfo.sid,
            userName: sessionInfo.userName,
            accessToken: sessionInfo.accessToken,
            refreshToken: sessionInfo.refreshToken
        }
        // console.log("userSessionObj:",userSessionObj)
        let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, userSessionObj)
        commonUtils.sendResponse(req, res, createdResp, next)
    } else if (sessionId.length > 40) {
        let applicationValidateWithIsas = await validateApplicationWithIsasToken(sessionId)
        if (applicationValidateWithIsas.success === true) {
            let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, {
                valid: true
            })
            commonUtils.sendResponse(req, res, createdResp, next)
        } else {
            let createdResp = await commonUtils.createResponse(STATUS.ERROR.AUTEHNTICATION_FAILED_INTERNAL_ERROR, '', applicationValidateWithIsas.response)
            commonUtils.sendResponse(req, res, createdResp, next)
        }
    } else {
        let createdResp = await commonUtils.createResponse(STATUS.ERROR.AUTEHNTICATION_FAILED_INTERNAL_ERROR, '', "Token not valid")
        commonUtils.sendResponse(req, res, createdResp, next)
    }
}


/******************* VALIDATE APPLICATION WITH ISAS HMAC TOKEN ********************/
async function validateApplicationWithIsasToken(accessToken){
    let securityPlugin = await ISASctrl.getSecurityPluginConfigInfo()
    let reqBodyOfValidateApplication = await commonUtils.createReqBodyOfValidateApplication(accessToken);
    let validateApplicationApi = await commonUtils.createValidateApplicationApi(securityPlugin);
    // console.log("+++++> COMING TO VALIDATE API:",validateApplicationApi)
    let ecAppIdAndAppSecret = await ISASctrl.getEcAppIdAndAppSecret();
    if(ecAppIdAndAppSecret && ecAppIdAndAppSecret.success === true){
      let hashedBase64 = await commonUtils.createHmacHash(ecAppIdAndAppSecret.response.ApplicationId, ecAppIdAndAppSecret.response.ApplicationSecret)
    //   console.log("+++++> COMING TO VALIDATE API hashedBase64:",hashedBase64)
      let apiSchema = await commonUtils.createApiSchemaForSecurityPlugin(validateApplicationApi,'POST',reqBodyOfValidateApplication,hashedBase64,null)
    //   console.log("+++++> COMING TO VALIDATE API apiSchema:",apiSchema)
      return ISASctrl.fetchSecurityPluginApi(apiSchema).then(async successRes =>{
        // console.log("+++++> COMING TO VALIDATE API successRes:",successRes)
        if(successRes && successRes.TokenValidityResponse && successRes.TokenValidityResponse.ErrorCode == 0 && successRes.TokenValidityResponse.IsValidApplication === true){
            return {success:true, response : successRes.TokenValidityResponse.IsValidApplication}
        }else{
            return {success:false, response : "Token not valid"} 
        }
      }).catch(error =>{
        console.log("+++++> COMING TO VALIDATE API ERRORRESPIO:",error)
        if(error && error.TokenValidityResponse && error.TokenValidityResponse.ErrorCode != 0){
            return {success:false, response : error.TokenValidityResponse.IsValidApplication}
        }else{
            return {success:false, response : "Token validation failed, because of some internal server error"}
        }
        
      })
    }else{
        return {success:false, response : "Token validation failed, because of some internal server error"}
    } 
}






module.exports = {
    login : login,
    logout : logout,
    validateApplicationWithIsasToken : validateApplicationWithIsasToken,
    // getAuthTypes : getAuthTypes,
    getAppConfigInfo : getAppConfigInfo,
    // dbConnectionInfo : dbConnectionInfo,
    // dbDevConnectionInfo : dbDevConnectionInfo,
    // serverDetails : serverDetails,
    checkValidUser : checkValidUser
}
