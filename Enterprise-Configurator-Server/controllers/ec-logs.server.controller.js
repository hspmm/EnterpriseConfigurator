const fs = require('fs');
var appRoot = require('app-root-path');
var STATUS = require('../utils/status-codes-messages.utils')
var commonUtils = require('../utils/common.utils');


/****************************************
 *********** EXPORT ERROR LOGS *************
*****************************************/
async function exportErrorLogs(req,res,next){
    let errorlogfile = await getErrorLog()
    if(errorlogfile.success === true){
        let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, errorlogfile.response) 
        commonUtils.sendResponse(req, res, createdResp, next)
    }else{
        let createdResp = await commonUtils.createResponse(STATUS.ERROR.EXPORT_ERROR_LOG_FILE,'',STATUS.ERROR.DB_FETCH[1])
        commonUtils.sendResponse(req, res, createdResp, next)
    }    
}


/****************************************
 *********** GET ERROR LOGS *************
*****************************************/
async function getErrorLog(){
    try{
        let errorLogFile = fs.readFileSync(`${appRoot}/logs/error.log`,'utf8');
        return {success:true, response:errorLogFile}
    }catch(error){
        return {success:false, response:error}
    }
}


/*****************************************
 ********** EXPORT EC SERVER LOGS ***********
******************************************/
async function exportEcServerLogs(req,res,next){
    let serverlogfile = await getServerLogs()
    if(serverlogfile.success === true){
        let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, serverlogfile.response) 
        commonUtils.sendResponse(req, res, createdResp, next)
    }else{
        let createdResp = await commonUtils.createResponse(STATUS.ERROR.EXPORT_ERROR_LOG_FILE,'',STATUS.ERROR.DB_FETCH[1])
        commonUtils.sendResponse(req, res, createdResp, next)
    }    
}


/*****************************************
 ********** GET EC SERVER LOGS ***********
******************************************/
async function getServerLogs(){
    try{
        let ecServerLogFile = fs.readFileSync(`${appRoot}/logs/ec-server.log`,'utf8');
        return {success:true, response:ecServerLogFile}
    }catch(error){
        return {success:false, response:error}
    }
}


/******************************************
 *********** EXPORT GLOBAL LOGS **************
*******************************************/
async function exportGlobalLogs(req,res,next){
    let globallogfile = await getglobalLogs()
    if(globallogfile.success === true){
        let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, globallogfile.response) 
        commonUtils.sendResponse(req, res, createdResp, next)
    }else{
        let createdResp = await commonUtils.createResponse(STATUS.ERROR.EXPORT_ERROR_LOG_FILE,'',STATUS.ERROR.DB_FETCH[1])
        commonUtils.sendResponse(req, res, createdResp, next)
    }    
}


/******************************************
 *********** GET GLOBAL LOGS **************
*******************************************/
async function getglobalLogs(){
    try{
        let globalLogFile = fs.readFileSync(`${appRoot}/logs/global.log`,'utf8');
        return {success:true, response:globalLogFile}
    }catch(error){
        return {success:false, response:error}
    }
}

module.exports = {
    exportErrorLogs : exportErrorLogs,
    exportEcServerLogs : exportEcServerLogs,
    exportGlobalLogs : exportGlobalLogs
}