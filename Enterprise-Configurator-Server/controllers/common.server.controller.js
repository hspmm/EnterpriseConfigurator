const models = require('../models');
var PluginsCtrl = require('./plugins.server.controller');
var IsasCtrl = require('./isas.server.controller');
var commonUtils = require('../utils/common.utils');
var logger = require('../utils/winston.utils').EnterpriseLogs;
const _ = require('lodash');



/***************** UPDATE SESSION EXPIRY TIME ******************/
async function updateSessionExpiry(sessionData){
  // console.log("sessionData in update Session:",sessionData)
  sessionId = sessionData.sid
  try{
      let sesionExpiry  = new Date(Date.now() + parseInt(sessionData.tokenTimeOutInterval)) 
      return models.Sessions.update({
          expires : sesionExpiry
      },{
          where : {
              sid : sessionId
          }
      }).then(async resp=>{ 
        let newSessionData = await getUserSessionById(sessionId);
        if(newSessionData.success){
          return {success:true, resopnse : newSessionData.response}
        }else{
          return {success:false, resopnse : newSessionData.response}
        }          
      }).catch(error=>{
          return {success:false, resopnse : {errCode : 'SESS_EXP',message: "Failed to Update session info"}}
      }) 
  }catch(error){
      return {success:false, resopnse : {errCode : 'SESS_EXP',message: "Failed to Update session info"}}
  }
}


/***************** GET USER SESSION INFO BY ID ***********************/
async function getUserSessionById(sessionId) {
  try {
    return models.Sessions.findOne({
      raw:true,
      where: {
        sid : sessionId
      }
    }).then(sessionData=>{
      // console.log("sessionData:",sessionData)
      if (sessionData) {
        return {success: true, response: sessionData}
      } else {
        return {success: false, response: {errCode : 'SESS_EXP',message: "Session Expired"}}
      }
    }).catch(err=>{
      return {success: false, response: {errCode : 'SESS_EXP',message: "Failed to fetch session info"}}
    })
  } catch (error) {
    return {success: false, response: {errCode : 'SESS_EXP',message: "Failed to fetch session info"}}
  }
}



/***************** GET EXPIRED USER SESSION LOG WITH SESSION ID ********************/
async function getExpiredUserSessionLog(sessionId) {
  try {
    return models.Session_Logs.findOne({
      raw: true,
      where: {
        sid: sessionId
      }
    }).then(userlog => {
      // console.log("Expired user Data:", userlog)
      return { success: true, response: userlog}
    }).catch(err => {
      // console.log("error of geting expiry:", err)
      return { success: false, response: err}
    })
  } catch (error) {
    return { success: false, response: error}
  }
}


/***************** CHECK USER PRIVILEGES ******************/
async function checkUserPrivilegeAccess(sessionId, privilege){
  console.log("privilege:",privilege)
  let userSessionInfo = await getUserSessionById(sessionId);
  if(userSessionInfo.success === true){
    userSessionInfo = userSessionInfo.response
    if(userSessionInfo.privileges){
      let userPrivileges = JSON.parse(userSessionInfo.privileges)
      let appPrivilegesKeys = privilege
      let foundPrivilege = _.filter(userPrivileges,(privilege)=> {return _.toLower(privilege.Privilege.Key)  == _.toLower(appPrivilegesKeys)})
      if(foundPrivilege.length > 0){
        return {success: true, response: true}
      }else{
        return {success: false, response: userSessionInfo.userName+" has no permission to do this action"}
      }
    }else{
      return {success: false, response: userSessionInfo.userName+" has no permission to do this action"}
    }
  }else{
    return {success:false, response:userSessionInfo.response}
  } 
}


/**************** UPDATE ISAS ACCESSTOKEN ********************/
async function updateIsasAccessToken(sessionId, userSessionInfo){
  let securityPlugin = await IsasCtrl.getSecurityPluginFromDb()
  if(securityPlugin.success){
    let reqBodyOfGetNewToken = await commonUtils.createReqBodyOfGetNewToken(userSessionInfo.refreshToken)
    let apiToGetNewToken = await commonUtils.createApiSchemaToGetNewToken(securityPlugin.response)
    if(apiToGetNewToken.success){
      let ecAppIdAndAppSecret = await IsasCtrl.getEcAppIdAndAppSecret()
      if(ecAppIdAndAppSecret && ecAppIdAndAppSecret.success === true){
        let hmacSecretId = await commonUtils.createHmacHash(ecAppIdAndAppSecret.response.ApplicationId, ecAppIdAndAppSecret.response.ApplicationSecret)
        let getNewTokenApiSchema = await commonUtils.createApiSchemaForSecurityPlugin(apiToGetNewToken.response,'POST',reqBodyOfGetNewToken,hmacSecretId,null);
        let getNewTokenReq = await commonApiFetch(getNewTokenApiSchema)
        if(getNewTokenReq.success){
          let tokenResp = getNewTokenReq.response.TokenResponse
          if(tokenResp.ErrorCode == 0){
            let userTokenUpdate = await updateNewTokenInUserSession(sessionId, tokenResp.AccessToken, tokenResp.RefreshToken, tokenResp.AccessToken_ExpiryTime)
            // console.log("userTokenUpdate:",userTokenUpdate)
            return {success:userTokenUpdate.success, response:userTokenUpdate.response}
          }else{
            return { success: false, response: tokenResp.ErrorText}
          }
        }else{
          return { success: false, response: getNewTokenReq.response}
        }
      }else{
        return { success: false, response: ecAppIdAndAppSecret.response}
      }
    }else{
      return { success: false, response: apiToGetNewToken.response}
    }
  }else{
    return {success:false, response:'Failed to update the security accesstoken'}
  }
}


/************** COMMON API CALL TO FETCH FROM OTHER PLUGINS ***************/
async function commonApiFetch(apiReq){
  return IsasCtrl.fetchSecurityPluginApi(apiReq).then(apiResp =>{
    // console.log("## GET NEW TOKEN SUCCESSFULL :",apiResp)
    return { success: true, response: apiResp}
  }).catch(error=>{
    // console.log("## FAILED TO GET NEW TOKEN  :",error)
    return { success: false, response: error}
  })
}


/************** UPDATE NEW ACCESSTOKEN IN USER SESSION *****************/
async function updateNewTokenInUserSession(sessionId, newAccessToken, newRefreshToken, newAccessTokenExpiryTime){
  try{
    let newCurrentExpiryTime = new Date(newAccessTokenExpiryTime) - new Date(Date.now())
    let newSesionExpiry  = new Date(Date.now() + parseInt(newCurrentExpiryTime)) 
    return models.Sessions.update({
      accessToken : newAccessToken,
      refreshToken : newRefreshToken,
      expires : newSesionExpiry,
      tokenTimeOutInterval : newCurrentExpiryTime,
      tokenRefreshedAt : new Date(Date.now())
    },{
      where : {
        sid : sessionId
      }
    }).then(async resp=>{
      let getUserInfo = await getUserSessionById(sessionId);
      if(getUserInfo.success){
        return {success:true, response: getUserInfo.response}
      }else{
        return {success:false, response:getUserInfo.response }
      }
    }).catch(err=>{
      return {success:false, response:err}
      // return {success:false, response:'Failed to update the new token in user session'}
    })
  }catch(error){
    return {success:false, response:error}
    // return {success:false, response:'Failed to update the new token in user session'}
  }
}

/************ SEND NOTIFICATION TO NOTIFICATION APP *************/
async function sendNotificationToNotificationApp(msgProfileKey, msgProfilePriority, msgCategory, msgText, msgAdditionalInfo){
    let listOfAcceptedPluginsFromDB = await PluginsCtrl.getListOfPluginsInDB()
    if(listOfAcceptedPluginsFromDB.success === true){
        let notificationManagerPlugin = await IsasCtrl.CheckNotificationManagerPluginAvailability(listOfAcceptedPluginsFromDB.response)
        if(notificationManagerPlugin){
            let apiToSendNotification = await commonUtils.sendNotificationApi(notificationManagerPlugin)
            if(apiToSendNotification.success === true){
                let reqBodyToSendNotification = await commonUtils.createReqBodyToSendNotification(msgProfileKey, msgProfilePriority, msgCategory, msgText, msgAdditionalInfo)
                let ecAppIdAndAppSecret = await IsasCtrl.getEcAppIdAndAppSecret()
                if(ecAppIdAndAppSecret && ecAppIdAndAppSecret.success === true){
                    let hmacSecretId = await commonUtils.createHmacHash(ecAppIdAndAppSecret.response.ApplicationId, ecAppIdAndAppSecret.response.ApplicationSecret)
                    let notificationApiSchema = await commonUtils.createApiSchemaForSecurityPlugin(apiToSendNotification.response,'POST',reqBodyToSendNotification,null,hmacSecretId);
                     return IsasCtrl.fetchSecurityPluginApi(notificationApiSchema).then(sendNotificationResp =>{
                        console.log("## SEND NOTIFICATION TO NOTIFICATION MANAGER SUCCESSFULL :",sendNotificationResp)
                        return { success: true, response: sendNotificationResp}
                      }).catch(error=>{
                        console.log("## FAILED TO NOTIFICATION :",error)
                        logger.error("[SEND NOTIFICATION] \t FAILED TO SEND NOTIFICATION :"+JSON.stringify(error))
                        return { success: false, response: error}
                      })
                }else{
                    logger.error("[SEND NOTIFICATION] \t FAILED TO SEND NOTIFICATION :"+JSON.stringify(ecAppIdAndAppSecret.response))
                    return { success: false, response: ecAppIdAndAppSecret.response}
                }
            }else{
                logger.error("[SEND NOTIFICATION] \t FAILED TO SEND NOTIFICATION :"+JSON.stringify(apiToSendNotification.response))
                return { success: false, response: apiToSendNotification.response}
            }
        }else{
            logger.error("[SEND NOTIFICATION] \t FAILED TO SEND NOTIFICATION : "+'Notification plugin not found while sending notification')
            return { success: false, response: 'Notification plugin not found while sending notification'}
        }
    }else{
        logger.error("[SEND NOTIFICATION] \t FAILED TO SEND NOTIFICATION :"+JSON.stringify(listOfAcceptedPluginsFromDB.response))
        return { success: false, response: "Error while sending notification :"+JSON.stringify(listOfAcceptedPluginsFromDB.response)}
    }
}


/************* REGISTER EC WITH NOTIFICATION MANAGER ***************/
async function RegisterEcWithNotificationManager(msgProfileKey, msgProfileDisplyTxt, msgPriority){
    let listOfAcceptedPluginsFromDB = await PluginsCtrl.getListOfPluginsInDB()
    if(listOfAcceptedPluginsFromDB.success === true){
      let notificationManagerPlugin = await IsasCtrl.CheckNotificationManagerPluginAvailability(listOfAcceptedPluginsFromDB.response)
      if(notificationManagerPlugin){
        let apiForNotificatioAppRegistration = await commonUtils.registerWithNotificationAppApi(notificationManagerPlugin)
        if(apiForNotificatioAppRegistration.success === true){
          let reqBodyOfNotificationRegistration = await commonUtils.createReqBodyOfRegistrationWithNotificationApp(msgProfileKey, msgProfileDisplyTxt, msgPriority)
          let ecAppIdAndAppSecret = await IsasCtrl.getEcAppIdAndAppSecret()
          if(ecAppIdAndAppSecret && ecAppIdAndAppSecret.success === true){
            let hmacSecretId = await commonUtils.createHmacHash(ecAppIdAndAppSecret.response.ApplicationId, ecAppIdAndAppSecret.response.ApplicationSecret)
            let notificationAppApiSchema = await commonUtils.createApiSchemaForSecurityPlugin(apiForNotificatioAppRegistration.response,'POST',reqBodyOfNotificationRegistration,null,hmacSecretId);
            return IsasCtrl.fetchSecurityPluginApi(notificationAppApiSchema).then(notificationRegstrnResp =>{
                if(notificationRegstrnResp && (notificationRegstrnResp.status).toLowerCase() === 'success'){
                    return {success: true, response:notificationRegstrnResp}
                }else{
                    return {success: false, response:notificationRegstrnResp}
                }              
            }).catch(error=>{
                if(error && (error.status).toLowerCase() === 'failure' && error.db_error_code && error.db_error_code == 2627 ){
                    return {success: true, response: msgProfileKey+" msg profile key is already registered with notification manager"}
                }else{
                    return {success: false, response:error}
                } 
            })
          }else{
            return {success: false, response: ecAppIdAndAppSecret.response}
        }
        }else{
          return {success: false, response: apiForNotificatioAppRegistration.response}
        }
      }else{
        return { success: false, response: 'Notification plugin not found while registring with Notification Manager'}
      }
    }else{      
      return {success: false, response: listOfAcceptedPluginsFromDB.response}
    }  
  }


module.exports = {
  updateSessionExpiry : updateSessionExpiry,
  getUserSessionById : getUserSessionById,
  getExpiredUserSessionLog : getExpiredUserSessionLog,
  checkUserPrivilegeAccess : checkUserPrivilegeAccess,
  updateIsasAccessToken : updateIsasAccessToken,
  SendNotification : sendNotificationToNotificationApp,
  RegisterWithNotification : RegisterEcWithNotificationManager
}