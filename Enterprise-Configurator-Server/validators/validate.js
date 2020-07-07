const models = require('../models');
const _ = require('lodash');
var moment = require('moment');
var {updateSessionExpiry, getUserSessionById, updateIsasAccessToken, checkUserPrivilegeAccess} = require('../controllers/common.server.controller');

var AppConfig = require('../config/app-config')
module.exports = {
    user:{
        checkAccesstoken : function(req,res,next){
            if(!req.headers.accesstoken){
                return res.status(401).send({
                    message: "Accestoken expired"
                })
            }
            next();
        }
    },
    
    checkIsServicesEnabled: function(req,res,next){
        // console.log("isServicesEnabled:",AppConfig.isServicesEnabled)
        if(!AppConfig.isServicesEnabled){
            return res.status(500).send({
                message: "Currently services are disabled"
            })
        }
        next();
        
    },

    checkReqHeaders: function(req,res,next){
        // console.log("REQ::",req.path.match(/^\/plugin\//) !=null)
        if((req.path == '/user/login') || (req.path.match(/^\/plugin\//) != null)){
            next()            
        }else if(req.headers && req.headers.accesstoken){
            next()
        }else{
            return res.status(401).send({
                message: "Accesstoken not found in headers"
            })
        }    
    },


    checkPluginServicesPrivileges: async function(req,res,next){
        let sessionId = req.headers.accesstoken
        let appPrivilegesKeys = JSON.parse(process.env.APP_PRIVILEGES_KEYS)
        let userAccess = await checkUserPrivilegeAccess(sessionId, appPrivilegesKeys.managePluginServices)
        if(userAccess.success){
            next()
        }else{
            return res.status(440).send(userAccess.response)
        }
    },

    checkAddHierarchyPrivileges: async function(req,res,next){
        let sessionId = req.headers.accesstoken
        let appPrivilegesKeys = JSON.parse(process.env.APP_PRIVILEGES_KEYS)
        let userAccess = await checkUserPrivilegeAccess(sessionId, appPrivilegesKeys.addHierarchyTree)
        if(userAccess.success){
            next()
        }else{
            return res.status(440).send(userAccess.response)
        }
    },
    

    checkUpdateHierarchyPrivileges: async function(req,res,next){
        let sessionId = req.headers.accesstoken
        let appPrivilegesKeys = JSON.parse(process.env.APP_PRIVILEGES_KEYS)
        let userAccess = await checkUserPrivilegeAccess(sessionId, appPrivilegesKeys.editHierarchyTree)
        if(userAccess.success){
            next()
        }else{
            return res.status(440).send(userAccess.response)
        }
    },


    checkDeleteHierarchyPrivileges: async function(req,res,next){
        let sessionId = req.headers.accesstoken
        let appPrivilegesKeys = JSON.parse(process.env.APP_PRIVILEGES_KEYS)
        let userAccess = await checkUserPrivilegeAccess(sessionId, appPrivilegesKeys.deleteHierarchyTree)
        if(userAccess.success){
            next()
        }else{
            return res.status(440).send(userAccess.response)
        }
    },

    checkHierarchyLevelsPrivileges: async function(req,res,next){
        let sessionId = req.headers.accesstoken
        let appPrivilegesKeys = JSON.parse(process.env.APP_PRIVILEGES_KEYS)
        let userAccess = await checkUserPrivilegeAccess(sessionId, appPrivilegesKeys.manageHierarchyLevels)
        if(userAccess.success){
            next()
        }else{
            return res.status(440).send(userAccess.response)
        }
    },

    checkFacilityPrivileges: async function(req,res,next){
        let sessionId = req.headers.accesstoken
        let appPrivilegesKeys = JSON.parse(process.env.APP_PRIVILEGES_KEYS)
        let userAccess = await checkUserPrivilegeAccess(sessionId, appPrivilegesKeys.manageFacilities)
        if(userAccess.success){
            next()
        }else{
            return res.status(440).send(userAccess.response)
        }
    },


    checkSessionExpiry : async function(req,res,next){
        // console.log("req.path:",req.url)
        if((req.path == '/user/login') || (req.path == '/user/logout') || (req.path == '/user/valid') || (req.path.match(/^\/plugin\//) != null)){
            next()            
        }else{
            if(!req.headers.accesstoken){
                return res.status(401).send({
                    message: "Accesstoken not found in headers"
                })
            }else{          
                let userSession = await getUserSessionById(req.headers.accesstoken);
                if(userSession.success === true){
                    // console.log("userSession.response:",userSession)
                    let tokenRefreshedAt = new Date(userSession.response.tokenRefreshedAt).getTime();
                    let IsasTokenExpiryTime = new Date(tokenRefreshedAt + parseInt(userSession.response.tokenTimeOutInterval));
                    let startTime = moment()
                    let end = moment(IsasTokenExpiryTime)
                    // console.log("userSession.response.tokenRefreshedAt:",userSession.response.tokenRefreshedAt)
                    // console.log("IsasTokenExpiryTime:",IsasTokenExpiryTime)
                    // console.log("startTime:",startTime)
                    // console.log("end:",end)
                    // console.log("DIFF TIEM:",end.diff(startTime,'seconds'))
                    if(end.diff(startTime,'seconds') < 70){
                    // if(true){
                        let updateTokenResp = await updateIsasAccessToken(req.headers.accesstoken, userSession.response);
                        if(updateTokenResp.success){
                            next()
                        }else{
                            // return res.status(500).send({errCode : 'SESS_EXP',message: "Failed to update token"})
                            let updateSession = await updateSessionExpiry(userSession.response);
                            if(updateSession.success === true){                            
                                next()
                            }else{
                                return res.status(440).send(updateSession.resopnse)
                            }
                        }
                    }else{
                        let updateSession = await updateSessionExpiry(userSession.response);
                        if(updateSession.success === true){                            
                            next()
                        }else{
                            return res.status(440).send(updateSession.resopnse)
                        }
                    } 
                }else{
                    return res.status(440).send(userSession.response)
                }
            }              
        }      
    }

    
}