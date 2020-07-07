var _ = require('lodash');
var STATUS = require('../utils/status-codes-messages.utils');
var commonUtils = require('../utils/common.utils')
var AllDetectedPluginsHashTable = require('./plugins.server.controller');
var ISASctrl = require('./isas.server.controller');
var redictionLogs = require('../utils/winston.utils').EnterpriseRedirectionLogs
var globalLogger = require('../utils/winston.utils').EnterpriseLogs


/************************************************************
 ****** REDIRECTION OF PLUGIN COMMUNICATION VIA EC API ******
 *************************************************************/
async function redirectionApi(req, res, next){
  let requestedUrl = req.url
  let requestedMethod = req.method
  let requestedBody = req.body
  let requestedHeaders = req.headers
  // console.log("Start of Request headers:",req.headers)
  // console.log("Start of Request IP:",req.connection.remoteAddress)
  let redirectionPluginInfo = await getRedirectionUrlPluginInfo(requestedUrl)
  // console.log("+++++++++++++>requestedBody:",requestedBody)
  // console.log("redirectionPluginInfo:",redirectionPluginInfo)
  if((redirectionPluginInfo && redirectionPluginInfo.servicesEnabled === true && redirectionPluginInfo.IsLicenced === true)){
    globalLogger.info("RequestedUrl :"+requestedUrl+"\t" + "RedirectionInfo :"+JSON.stringify(redirectionPluginInfo))
    redictionLogs.info("RequestedUrl :"+requestedUrl+"\t" + "RedirectionInfo :"+JSON.stringify(redirectionPluginInfo))
    let finalRedirectionApi = redirectionPluginInfo.redirectionUrl
    // console.log("finalRedirectionApi:",finalRedirectionApi)
    // console.log("requestedMethod:",requestedMethod)
    // console.log("requestedBody:",requestedBody)
    let redirectionApiSChema = await commonUtils.createApiSchemaForSecurityPlugin(finalRedirectionApi,requestedMethod,requestedBody,'',null)
    console.log("Before redirectionApiSChema:",redirectionApiSChema)
    redirectionApiSChema.requestHeaders = requestedHeaders
    redirectionApiSChema.requestHeaders['x-forwarded-for'] = req.connection.remoteAddress
    // console.log("redirectionApiSChema:",redirectionApiSChema)
    ISASctrl.fetchSecurityPluginApi(redirectionApiSChema).then(async response =>{
      // console.log("REDIRECTION API RESPONSE:",response)
      res.send(response)
      // let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, response)
      // commonUtils.sendResponse(req, res, createdResp, next)
    }).catch(async error =>{
      // console.log("REDIRECTION API ERROR:",error)
      let createdResp = await commonUtils.createResponse(STATUS.ERROR.PLUGIN_API_REHOST,'',error)
      commonUtils.sendResponse(req, res, createdResp, next)
    })
  }else{
    globalLogger.error("RequestedUrl :"+requestedUrl+"\t" + "RedirectionInfo : No matched url found")
    redictionLogs.error("RequestedUrl :"+requestedUrl+"\t" + "RedirectionInfo :  No matched url found")
    let createdResp = await commonUtils.createResponse(STATUS.ERROR.PLUGIN_API_REHOST,'','All the services are stoped for this request because of either the Licence has expired nor the services are disabled')
    commonUtils.sendResponse(req, res, createdResp, next)
  }
}


/*************************************************
 ******** GET REDIRECTION PLUGIN INFO URL ********
 *************************************************/
async function getRedirectionUrlPluginInfo(requestedUrl){
  let detectedPluginsHashTable = AllDetectedPluginsHashTable.detectedPluginsHashtable
  // console.log("AllDetectedPluginsHashTable:",AllDetectedPluginsHashTable)
  // console.log("Actual requestedUrl:",requestedUrl)
  let plugin, splitOfReqUrl = requestedUrl.split('/')
  // console.log("splitOfReqUrl:",splitOfReqUrl)
  let redirectionPluginInfo = detectedPluginsHashTable[splitOfReqUrl[1]]
  plugin = redirectionPluginInfo
  if(redirectionPluginInfo && redirectionPluginInfo.prependUrl && redirectionPluginInfo.prependUrl.includes(splitOfReqUrl[1])){
    // console.log("unique name INcluded in prepend URL")
    let redirectionSuffixUrl = requestedUrl
    // console.log("redirectionSuffixUrl:",redirectionSuffixUrl)
    plugin.redirectionUrl = redirectionPluginInfo.url + redirectionSuffixUrl
  }else if(redirectionPluginInfo && redirectionPluginInfo.prependUrl && !(redirectionPluginInfo.prependUrl.includes(splitOfReqUrl[1]))){
    // console.log("unique name not INcluded in prepend URL")
    let redirectionSuffixUrl = requestedUrl.replace('/'+splitOfReqUrl[1],'')
    // console.log("redirectionSuffixUrl:",redirectionSuffixUrl)
    plugin.redirectionUrl = redirectionPluginInfo.url + redirectionSuffixUrl
  }else{
    plugin = ''
  }
  return plugin
}

/* async function getRedirectionUrlPluginInfo(requestedUrl){
  let detectedPluginsHashTable = AllDetectedPluginsHashTable.detectedPluginsHashtable
  console.log("AllDetectedPluginsHashTable:",AllDetectedPluginsHashTable)
  console.log("Actual requestedUrl:",requestedUrl)
  let plugin, splitOfReqUrl = requestedUrl.split('/')
  console.log("splitOfReqUrl:",splitOfReqUrl)
  for(let key in detectedPluginsHashTable){    
    console.log("key:",key)
    if(splitOfReqUrl[1] == key){
      let splitOfReqUrl = detectedPluginsHashTable[key].prependUrl.replace('/','')
      let prependUrl = '\/'+splitOfReqUrl+'\(.*)/'
      console.log("prependUrl:",prependUrl)
      console.log("requestedUrl:",requestedUrl)
      let checkMatchedUrl = requestedUrl.match(prependUrl); 
      console.log("checkMatchedUrl:",checkMatchedUrl)   
      if((checkMatchedUrl != null) && (checkMatchedUrl.length > 0)){
        plugin = detectedPluginsHashTable[key]
        plugin.redirectionUrl = detectedPluginsHashTable[key].url + requestedUrl 
      }
    }

  }
  return plugin
} */




module.exports = {
  redirectionApi : redirectionApi
}