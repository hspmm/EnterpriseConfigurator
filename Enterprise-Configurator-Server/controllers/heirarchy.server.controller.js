const models = require('../models');
// var moment = require('moment');
// var glob = require('glob');
const _ = require('lodash');
var AppConfig = require('../config/app-config')
var STATUS = require('../utils/status-codes-messages.utils')
var commonUtils = require('../utils/common.utils')
var env = process.env.NODE_ENV || 'development';
var config = require('../config/db.config')[env];
var Promise = require('bluebird');
var PluginRoutes = require('./plugins.server.controller');
var GetEcAppRegistartionInfo = require('./isas.server.controller').getEcAppIdAndAppSecret
const Sequelize = require('sequelize');
var logger = require('../utils/winston.utils').EnterpriseLogs

/******************** GET ALL FLAT HIERARCHY TREE NODES ********************/
async function getHierarchy(req, res, next) {
    try{
        models.Nodes.findAll({
            raw: true,
            where: {
                IsActive: 1
            }
        }).then(async (heirarchy)=> {
            let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, heirarchy) 
            commonUtils.sendResponse(req, res, createdResp, next)
        }).catch(async err => {
            let createdResp = await commonUtils.createResponse(STATUS.ERROR.GET_HIERARCHY,'', err)
            commonUtils.sendResponse(req, res, createdResp, next)
        });
    }catch (error){
        console.log("ERRORRR:",error)
        let createdResp = await commonUtils.createResponse(STATUS.ERROR.GET_HIERARCHY,'', STATUS.ERROR.DB_FETCH[1])
        commonUtils.sendResponse(req, res, createdResp, next)
    }
}

/******************** CREATE HIERARCHY TREE NODE ********************/
async function saveToHierarchy(req, res, next){
    try{
        let hierarchyNode = req.body
        let nodeCreationSchema = await commonUtils.schemaOfNodeCreation(hierarchyNode, req)
        // console.log("NODE OBJ:",nodeCreationSchema)
        let respOfnodeCreation = await nodeCreation(nodeCreationSchema);
        if(respOfnodeCreation.success === true){
            let createdResp = await commonUtils.createResponse(STATUS.SUCCESS,respOfnodeCreation.response)
            commonUtils.sendResponse(req, res, createdResp, next)
        }else{
            let createdResp = await commonUtils.createResponse(STATUS.ERROR.CREATE_HIERARCHY,'',respOfnodeCreation.response)
            commonUtils.sendResponse(req, res, createdResp, next) 
        }
    }catch(error){
        let createdResp = await commonUtils.createResponse(STATUS.ERROR.CREATE_HIERARCHY,'',error)
        commonUtils.sendResponse(req, res, createdResp, next)
    }
}

async function nodeCreation(hierarchyNode){
    try{
        return models.Nodes.create(hierarchyNode).then(resp =>{            
            return { success:true, response: resp}
        }).catch(err =>{
            console.log(err)
            return {success:false, response: err}
        })
    }catch(error){
        return {success:false, response: error}
    }
}

async function bulkNodeCreation(bulkHierarchyNodes){
    try{
        return models.Nodes.bulkCreate(bulkHierarchyNodes).then(resp =>{ 
            // console.log("resp:",resp)           
            return { success:true, response: resp}
        }).catch(err =>{
            console.log(err)
            return {success:false, response: err}
        })
    }catch(error){
        return {success:false, response: error}
    }
}


async function createHierarchyNodesInBulk(req,res,next){
    // console.log("Req.body:",req.body)
    try{
        let facilityId = req.body.facilityId
        let hierarchyNodes = req.body.hierarchyNodes
        let bulkHierarchyNodes = []
        _.forEach(hierarchyNodes,async (node)=>{
            let nodeCreationSchema = await commonUtils.schemaOfNodeCreation(node, req)
            // console.log("NODE OBJ:",nodeCreationSchema)
            bulkHierarchyNodes.push(nodeCreationSchema)
            if(hierarchyNodes.length == bulkHierarchyNodes.length){
                // console.log("bulkHierarchyNodes:",bulkHierarchyNodes)
                let respOfbulkNodeCreation = await bulkNodeCreation(bulkHierarchyNodes);
                if(respOfbulkNodeCreation.success === true){
                    let waitForFacilityDisable = await disableFacility(facilityId)
                    if(waitForFacilityDisable.success == true){
                        let createdResp = await commonUtils.createResponse(STATUS.SUCCESS,respOfbulkNodeCreation.response)
                        commonUtils.sendResponse(req, res, createdResp, next)
                    }else{
                        let createdResp = await commonUtils.createResponse(STATUS.SUCCESS,respOfbulkNodeCreation.response)
                        commonUtils.sendResponse(req, res, createdResp, next)
                    }
                    
                }else{
                    let createdResp = await commonUtils.createResponse(STATUS.ERROR.CREATE_HIERARCHY,'',respOfbulkNodeCreation.response)
                    commonUtils.sendResponse(req, res, createdResp, next) 
                }
            }
        })

    }catch(error){
        console.log("ERROR:",error)
        let createdResp = await commonUtils.createResponse(STATUS.ERROR.CREATE_HIERARCHY,'',error)
        commonUtils.sendResponse(req, res, createdResp, next)
    }
}

async function disableFacility(facilityId){
    try{
       return models.Facilities.update({
            IsActive : false
        },{
            where:{
                Uid : facilityId
            }
        }).then(res=>{
            return {success:true, response:res}
        }).catch(error=>{
            return {success:false, response:error}
        })
    }catch(err){
        return {success:false, response:err}
    }
}




/******************** UPDATE HIERARCHY TREE NODE ********************/
async function updateHierarchyNodeToDB(req, res, next){
    // console.log("Hierarchy : ",req.body)
    let updateNodeInfo = req.body
    /* let NodeUid = updateNodeInfo.uid
    let NodeType = updateNodeInfo.nodeType
    let NodeName = updateNodeInfo.nodeName
    let NodeNotes = JSON.stringify(updateNodeInfo.nodeInfo)
    let TypeOf = updateNodeInfo.typeOf */
    updateNodeInfo.nodeInfo = JSON.stringify(updateNodeInfo.nodeInfo)
    let node = await commonUtils.schemaOfNodeCreation(updateNodeInfo, req);
    // console.log("node:",node)
        try{
            models.Nodes.update({
                NodeName: node.NodeName,
                NodeShortName : node.NodeShortName,
                NodeType : node.NodeType,
                TypeOf : node.TypeOf,
                NodeInfo: node.NodeInfo
            }, {
                where: {
                    Uid: node.Uid ? node.Uid : updateNodeInfo.uid
                }
            }).then(async success => {
                let createdResp = await commonUtils.createResponse(STATUS.SUCCESS,success)
                commonUtils.sendResponse(req, res, createdResp, next)
            }).catch(async err => {
                let createdResp = await commonUtils.createResponse(STATUS.ERROR.UPDATE_HIERARCHY_NODE,'',err)
                commonUtils.sendResponse(req, res, createdResp, next)
            })
        }catch{
            let createdResp = await commonUtils.createResponse(STATUS.ERROR.UPDATE_HIERARCHY_NODE,'',STATUS.ERROR.DB_FETCH[1])
            commonUtils.sendResponse(req, res, createdResp, next)
        }
}


/******************** DELETE HIERARCHY TREE NODE BY UID ********************/
async function deleteHierarchyNode(req, res, next) {
    let nodeUid = req.params.uid
    // console.log("Params:", nodeUid)
    let getNode = await getNodeByUid(nodeUid)
    if(getNode.success === true){
        let Node = getNode.response
        let allNodes = await GetAllSelectedChildSite(Node.NodeID)
        // let currentNode = await getCurrentNodeById(Node.NodeID)
        allNodes.push(Node)
        //console.log("allNodes:", allNodes)
        let removedNode = await removeNodes(allNodes, 0)
        // console.log("removedNode:", removedNode)
        // console.log("removedNode length:", removedNode.length)
        // console.log("removedNode last returnedindex:", removedNode[removedNode.length-1].returnedIndex)
        // console.log("allNodes length:", allNodes.length)
        if(removedNode.length == allNodes.length){
            let createdResp = await commonUtils.createResponse(STATUS.SUCCESS)
            commonUtils.sendResponse(req, res, createdResp, next)
        }else{
            let createdResp = await commonUtils.createResponse(STATUS.ERROR.REMOVE_HIERARCHY_ELEMENT_DATA_BY_NODEID)
            commonUtils.sendResponse(req, res, createdResp, next)
        }
    }else{
        let createdResp = await commonUtils.createResponse(STATUS.ERROR.REMOVE_HIERARCHY_ELEMENT_DATA_BY_NODEID, '', getNode.response)
        commonUtils.sendResponse(req, res, createdResp, next)
    }

}

async function getNodeByUid(nodeUid) {
    // console.log("CHEKC ROOT NODE:",nodeUid) 
    try{
        return models.Nodes.findOne({
            raw : true,
            where : {
                Uid : nodeUid
            }
        }).then(node =>{
            if(node){
                return {success:true, response:node}
            }else{
                return {success:false, response:'Node not fount'}
            }
            
        }).catch(err=>{
            return {success:false, response: 'id not found'}
        })
    }catch(error){
        console.log("CHEKC ROOT NODE ERROR:",error) 
        return {success:false, response: error}
    }
}

async function GetAllSelectedChildSite(NodeID){
    let finalChildData = [];
    // let childNodes = this.checklistSelection.selected.filter((dataNode)=> dataNode.ParentId===node.NodeId);
    let childNodes = await getAllNodesbyparentId(NodeID)
    childNodes.data.forEach((child)=>{
      finalChildData.push(child);
    });
    for (let i = 0; i < childNodes.data.length; i++) {
      let filteredNodes = await GetAllSelectedChildSite(childNodes.data[i].NodeID);
      filteredNodes.forEach((child)=>{
        finalChildData.push(child);
      });
    }   
    return finalChildData;
}

async function removeNodes(removableNodes, index){
    let finalData = [];
    let deletedNode = await softDeleteOfNodes(removableNodes, index)
    finalData.push(deletedNode)
    let increamentingIndex = deletedNode.returnedIndex
    if(increamentingIndex < removableNodes.length-1){
        increamentingIndex = increamentingIndex + 1
        let subNode = await removeNodes(removableNodes, increamentingIndex)
        subNode.forEach((child)=>{
            finalData.push(child);
        });
    }
    return finalData
}

async function softDeleteOfNodes(removableNodes, index){
    let node = removableNodes[index]
    try{
        return models.Nodes.update({
            IsActive : false
        },{
            where : {
                Uid : node.Uid
            }
        }).then(resultant =>{
            return {success : true, returnedIndex : index, data : resultant}
        }).catch(error =>{
            return {success : false, returnedIndex : index, data : error}
        })
    }catch(err){
        return {success : false, returnedIndex : index, data : err}
    }
}

async function getAllNodesbyparentId(NodeID){
    try{
        return await models.Nodes.findAll({
            raw: true,
            where :{
                ParentID : NodeID
            }
        }).then(resultantNodes =>{
            return {success : true, data : resultantNodes}
        }).catch(error =>{
            return {success : false, data : error}
        })
    }catch(err){
        return {success : false, data : err}
    }
}



/******************* ADD ELEMENT TO HIERARCHY TREE NODE **************************/
async function addElementToHierarchyNode(req,res,next){
    // console.log("Coming to add element:",req.body)
    let pluginName = req.headers.name
    let nodeName = req.body.name
    let parentIds = req.body.id
    let isPluginRegistered = await PluginRoutes.getPluginFromDbByName(pluginName)
    // console.log("isPluginRegistered:",isPluginRegistered)
    if(isPluginRegistered.success === true){
        let getNode = await getNodeByUid(parentIds[0])// **********TO DO FOR MULTIPLE PARENT ID's *********       
        if(getNode.success === true){
            let AllParentNodeIds =[]
            AllParentNodeIds.push(getNode.response)
            let thirdParameterData = await getThirdParameterValuesForAddAndUpdateElement(req);
            // console.log("thirdParameterData:",thirdParameterData)
            let savedInfoOfPlugin = await saveToPluginsInfo(thirdParameterData);
            // console.log("savedInfoOfPlugin:",savedInfoOfPlugin)
            if(savedInfoOfPlugin.success === true && savedInfoOfPlugin.response != null){
                let savingNodesArr = await createNodeFormat(nodeName, AllParentNodeIds, isPluginRegistered.response, savedInfoOfPlugin.response, req)
                // console.log("savingNodesArr:",savingNodesArr)
                if(savingNodesArr && savingNodesArr.length > 0){
                    let allReturnedSavedNodes = await saveToNodes(savingNodesArr, 0);
                    // console.log("allReturnedSavedNodes:",allReturnedSavedNodes)
                    let respOfAllSavedNodesRawData = []
                    _.forEach(allReturnedSavedNodes, (node)=> {
                        if(node.success == true){
                            respOfAllSavedNodesRawData.push(node.response)
                        }
                    })
                    let responseInfo= {
                        Id : savedInfoOfPlugin.response.Id,
                        requestedData : req.body,
                        responseData : respOfAllSavedNodesRawData
                    }
                     let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, { message:"Successfully saved", parentUrl: config.url+':4200',responseInfo})
                     commonUtils.sendResponse(req, res, createdResp, next)
                }else{
                    let createdResp = await commonUtils.createResponse(STATUS.ERROR.ADD_ELEMENT_TO_HIERARCHY,'')
                    commonUtils.sendResponse(req, res, createdResp, next)
                }
            }else{
                let createdResp = await commonUtils.createResponse(STATUS.ERROR.ADD_ELEMENT_TO_HIERARCHY,'',savedInfoOfPlugin.response)
                commonUtils.sendResponse(req, res, createdResp, next)
            }
        }else{
            let createdResp = await commonUtils.createResponse(STATUS.ERROR.ADD_ELEMENT_TO_HIERARCHY,'',getNode.response)
            commonUtils.sendResponse(req, res, createdResp, next)
        }        
    }else{
        let createdResp = await commonUtils.createResponse(STATUS.ERROR.PLUGIN_INFO_NOT_FOUND_IN_ADDELEMENT,'',isPluginRegistered.response)
        commonUtils.sendResponse(req, res, createdResp, next)
    }
}

async function saveToPluginsInfo(thirdParameterData){
    let thirdParameter = {
        FormInfo : thirdParameterData ? JSON.stringify(thirdParameterData) : null 
    }
    try{
        return await models.PluginsFormInfo.create(thirdParameter).then(result =>{
            if(result){
                return {success : true, response : result}
            }else{
                return {success : true, response : null}
            }
        })
    }catch(err){
        return {success : false, response : err}
    }
}

async function getThirdParameterValuesForAddAndUpdateElement(req){
    let thirdParameter = _.omit(req.body, ['name', 'id'])
    let thirdParameterData;
    if(thirdParameter){
        _.forEach(thirdParameter, (value, key)=> {
            // console.log("thirdParameter Key",key);
            thirdParameterData = value
        });
    }else{
        thirdParameterData = null
    }
    return thirdParameterData
}


async function createNodeFormat(nodeName,parentIds,requestedPluginInfo, savedInfoPlugin, req){
    let savingNodes = []
    _.forEach(parentIds, async (parentId)=>{
        let nodeData = {
            nodeName: nodeName,
            parentId: parentId.NodeID,
            pluginId : requestedPluginInfo.Uid ? requestedPluginInfo.Uid : requestedPluginInfo.Id,
            typeOf : requestedPluginInfo.UniqueName ? requestedPluginInfo.UniqueName : requestedPluginInfo.Name,
            nodeType : "application",
            pluginInfoId: savedInfoPlugin ? savedInfoPlugin.Id ? savedInfoPlugin.Id : null : null,
            isActive: true
        }
        let nodeCreationSchema = await commonUtils.schemaOfNodeCreation(nodeData, req)
        savingNodes.push(nodeCreationSchema)
    })
    return savingNodes
}

async function saveToNodes(savingNodesArr, index){
    let finalData = [];
    let savedNode = await savingOfNodes(savingNodesArr, index)
    finalData.push(savedNode)
    let increamentingIndex = savedNode.returnedIndex
    if(increamentingIndex < savingNodesArr.length-1){
        increamentingIndex = increamentingIndex + 1
        let allSavedNodes = await saveToNodes(savingNodesArr, increamentingIndex)
        allSavedNodes.forEach((node)=>{
            finalData.push(node);
        });
    }
    return await finalData
}

async function savingOfNodes(savingNodesArr, index){
    let node = savingNodesArr[index]
    try{
        return models.Nodes.create(node).then(resultant =>{
            return {success : true, returnedIndex : index, response : resultant}
        }).catch(error =>{
            return {success : false, returnedIndex : index, response : error}
        })
    }catch(err){
        return {success : false, returnedIndex : index, response : err}
    }
}


/*************** GET HIERARCHY TREE NODE ELEMENT BY UID *************************/
async function getHierarchyNodeElement(req, res, next) {
    try{
        // console.log("PARAMS:", req.params.uid)
        let nodeUid = req.params.uid
        models.Nodes.findOne({
            raw : true,
            where: {
                Uid: nodeUid
            }
        }).then(async (result) => {
            // console.log("result",result)
            if((result !== null) && (result.PluginInfoId !== null) && (result.PluginInfoId !== undefined) && (result.PluginInfoId !== '') ){
                // console.log("IN IF")
                let pluginInfo = await getPluginFormInfo(result.PluginInfoId)
                if(pluginInfo.success == true && pluginInfo.response != null){
                    // console.log("pluginInfo.response:", pluginInfo.response)
                    let responseData = {}
                    responseData.info = JSON.parse(pluginInfo.response.FormInfo)
                    responseData.id = pluginInfo.response.Id
                    let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, responseData)
                    commonUtils.sendResponse(req, res, createdResp, next)
                }else{
                    let createdResp = await commonUtils.createResponse(STATUS.ERROR.HIERARCHY_ELEMENT_DATA_BY_NODEID,'',pluginInfo.response)
                    commonUtils.sendResponse(req, res, createdResp, next)
                }
            }else{
                // console.log("IN Else")
                let createdResp = await commonUtils.createResponse(STATUS.ERROR.HIERARCHY_ELEMENT_DATA_BY_NODEID,'Uid is not associated with plugin to fetch the element data')
                commonUtils.sendResponse(req, res, createdResp, next) 
            }

        }).catch(async err => {
            console.log("error while getting from the db",err)
            let createdResp = await commonUtils.createResponse(STATUS.ERROR.HIERARCHY_ELEMENT_DATA_BY_NODEID,err)
            commonUtils.sendResponse(req, res, createdResp, next)
            // next({ status: STATUS.ERROR.CODE.ERR_HIERARCHY_ELEMENT_DATA_BY_NODEID, message: err });
        });

    }catch{
        let createdResp = await commonUtils.createResponse(STATUS.ERROR.HIERARCHY_ELEMENT_DATA_BY_NODEID,'',STATUS.ERROR.DB_FETCH[1])
        commonUtils.sendResponse(req, res, createdResp, next)
    }    
}

async function getPluginFormInfo(PluginInfoId){
    try{
        return models.PluginsFormInfo.findOne({
            raw : true,
            where : {
                Id : PluginInfoId
            }
        }).then(result =>{
            return {success : true , response : result}
        }).catch(error =>{
            return {success : false , response : null}
        })
    }catch(err){
        return {success : false , response : result}
    }
}



/****************** UPDATE HIERARCHY TREE NODE ELEMENT  ************************/
async function updateHierarchyElementById(req,res,next){
    // console.log('REQUEST PARAMS :',req.body)
    let pluginName = req.headers.name
    let nodeName = req.body.name
    let parentIds = req.body.id

    let isPluginRegistered = await PluginRoutes.getPluginFromDbByName(pluginName);
    // console.log("isPluginRegistered:",isPluginRegistered)
    if(isPluginRegistered.success === true && isPluginRegistered.response != null){
        let thirdParameterData = getThirdParameterValuesForAddAndUpdateElement(req)
        // console.log("UPDATE OF ELEMENT:",thirdParameterData)
        let allCurrentNodes = getCurrentNodePluginInfoId(parentIds)
        allCurrentNodes.then(async allUpdatableNodes =>{
            // console.log("allUpdatableNodes :",allUpdatableNodes)
            if(allUpdatableNodes.length > 0){
                let updatedNodes = await updateNodeName(allUpdatableNodes, nodeName,0)
                    // console.log("UpdatedNodes :",updatedNodes)
                    let updatedPluginInfo = await updatePluginInfoWithPluginId(updatedNodes[0].PluginInfoId, thirdParameterData)
                    if(updatedPluginInfo.success == true){
                        let responseInfo= {
                            Id : updatedNodes[0].PluginInfoId,
                            requestedData : req.body,
                            responseData : updatedNodes
                        }
                        let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, { message:"Successfully Updated", parentUrl: config.url+':4200', responseInfo})
                        commonUtils.sendResponse(req, res, createdResp, next)
                    }else{
                        let createdResp = await commonUtils.createResponse(STATUS.ERROR.UPDATE_HIERARCHY_ELEMENT_DATA_BY_NODEID,{message: "Error while updating"},STATUS.ERROR.DB_FETCH[1])
                        commonUtils.sendResponse(req, res, createdResp, next)
                    }
            }else{
                let createdResp = await commonUtils.createResponse(STATUS.ERROR.UPDATE_HIERARCHY_ELEMENT_DATA_BY_NODEID,{message: "Error while updating"},STATUS.ERROR.DB_FETCH[1])
                commonUtils.sendResponse(req, res, createdResp, next)
            }

            // let allNodesWithPluginInfoId = getNodesWithPluginInfoId(nodesPluginInfoId)
        }).catch(async error =>{
            console.log("Eroror of updating Element:",error)
            let createdResp = await commonUtils.createResponse(STATUS.ERROR.UPDATE_HIERARCHY_ELEMENT_DATA_BY_NODEID,{message: "Error while updating"},error)
            commonUtils.sendResponse(req, res, createdResp, next)
        })

    }else{
        let createdResp = await commonUtils.createResponse(STATUS.ERROR.NODEID_NOT_FOUND_UPDATE_HIERARCHY_ELEMENT_DATA_BY_NODEID,{message: "Error while updating"},isPluginRegistered.response)
        commonUtils.sendResponse(req, res, createdResp, next)
    } 
}


async function getCurrentNodePluginInfoId(currentIds){
    let allNodesWithPluginInfoId = []
    return new Promise((resolve,reject)=>{
        let count = 0
        _.forEach(currentIds, (nodeId)=>{
            try{
                models.Nodes.findAll({
                    raw: true,
                    where : {
                        Uid : nodeId
                    }
                }).then(result =>{
                    count = count + 1
                    allNodesWithPluginInfoId.push(result)
                    if(count == currentIds.length){
                        resolve(result)
                    }
                }).catch(error =>{
                    count = count + 1
                    console.log("error while geting plugin Info with NodeId", error)
                    if(count == currentIds.length){
                        reject(allNodesWithPluginInfoId)
                    }
                })
            }catch(err){
                console.log("error while geting plugin Info with NodeId$$%%", err)
                count = count + 1
                if(count == currentIds.length){
                    reject(allNodesWithPluginInfoId)
                }
            }
        })

    })
}

async function updateNodeName(savingNodesArr,nodeName, index){
    let finalData = [];
    let savedNode = await updateNodeToDB(savingNodesArr, nodeName, index)
    // console.log("Saved Node:",savedNode)
    savedNode ? savedNode.success == true ? finalData.push(savedNode.reponse) : '' : ''
    
    let increamentingIndex = savedNode.returnedIndex
    if(increamentingIndex < savingNodesArr.length-1){
        increamentingIndex = increamentingIndex + 1
        let allSavedNodes = await updateNodeName(savingNodesArr,nodeName, increamentingIndex)
        allSavedNodes.forEach((node)=>{
            finalData.push(node);
        });
    }
    return finalData
}

async function updateNodeToDB(allUpdatableNodes, nodeName, index){
    let node = allUpdatableNodes[index]
    //    console.log("allUpdatableNodes:",allUpdatableNodes)
    //    console.log("Update Node:",node)
    //    console.log("Update nodeName:",nodeName)
            try{
                return await models.Nodes.update({
                    NodeName : nodeName
                }, {
                    where : {
                        NodeID : node.NodeID
                    }
                }).then(result =>{
                    node.NodeName = nodeName
                    return {success:true, returnedIndex: index, reponse :node}
                }).catch(error =>{
                    console.log("error while geting plugin Info with NodeId", error)
                    return {success:false, returnedIndex: index, reponse :error}
                })
            }catch(err){
                console.log("Error of fetch:",err)
                return {success:false, returnedIndex: index, reponse :"Error of fetch"}
            }
}

async function updatePluginInfoWithPluginId(pluginInfoId, thirdParameterData){
    try{
        return await models.PluginsFormInfo.update({
            FormInfo : thirdParameterData ? JSON.stringify(thirdParameterData) : null
        },{
            where : {
                Id : pluginInfoId
            }
        }).then(res =>{
            return {success : true, data : res}
        }).catch(error =>{
            return {success : false, data : error}
        })
    }catch(err){
        return {success : false, data : err}
    }
}


/****************** DELETE HIERARCHY TREE NODE ELEMENT  ************************/
async function deleteHierarchyElement(req, res,next){
    let nodeUids = req.body.id
    let AllDeletableNodes = await getAllNodesByNodeUids(nodeUids, 0)
    // console.log("AllDeletableNodes:",AllDeletableNodes)
    let deletAllNodes = await softDeleteAllNodes(AllDeletableNodes, 0)
    console.log("deletAllNodes:",deletAllNodes)
    deletAllNodes.forEach(async nodeDelete =>{
        if(nodeDelete.success === false){
            let createdResp = await commonUtils.createResponse(STATUS.ERROR.REMOVE_HIERARCHY_ELEMENT_DATA_BY_NODEID,'','Deletion not happend properly')
            commonUtils.sendResponse(req, res, createdResp, next)
            break;
        }else{
            let createdResp = await commonUtils.createResponse(STATUS.SUCCESS)
            commonUtils.sendResponse(req, res, createdResp, next)
            break;
        }
    })
}

async function getAllNodesByNodeUids(nodeUids, index){
    // console.log("@@@@@@@@@######### INDEX:", index)
    let allNodes = [];
    let deletableNode = await getNodeByUid(nodeUids[index])
    deletableNode ? deletableNode.success === true ? allNodes.push(deletableNode.response) : '' : ''
    // let increamentingIndex = savedNode.returnedIndex
    if(index < nodeUids.length-1){
        index = index + 1
        let allDeleteNodes = await getAllNodesByNodeUids(nodeUids, index)
        allDeleteNodes.forEach((node)=>{
            allNodes.push(node);
        });
    }
    return allNodes
}
// let allNodes = await GetAllSelectedChildSite(Node.NodeID)
async function softDeleteAllNodes(AllDeletableNodes, index){
    let resOfDeleteNodes= []
    let allNodes = await GetAllSelectedChildSite(AllDeletableNodes[index].NodeID)
    allNodes.push(AllDeletableNodes[index])
    // console.log("###### allNodes :", allNodes)
    let removedNodes = await removeNodes(allNodes, 0)
    _.forEach(removedNodes, respOfRemoveNode =>{
        resOfDeleteNodes.push(respOfRemoveNode)
    })

    //console.log("removedNode :",removedNodes)
    if(index < AllDeletableNodes.length-1){
        index = index + 1
        //console.log("###### FOUND INDEX :", allNodes.indexOf(AllDeletableNodes[index]))
        if(allNodes.indexOf(AllDeletableNodes[index]) == -1){
            let deletedNodes = await softDeleteAllNodes(AllDeletableNodes, index)
            deletedNodes.forEach((node)=>{
                resOfDeleteNodes.push(node);
            });
        }

    }
    return resOfDeleteNodes
}




/************************* GET HIERARCHY LEVELS *****************************/
async function getHierarchyLevel(req, res, next) {
    let levels = await getGroupLevels()
    if(levels.success === true){
        let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, levels.response)
        commonUtils.sendResponse(req, res, createdResp, next)
    }else{
        let createdResp = await commonUtils.createResponse(STATUS.ERROR.GET_HIERARCHY_LEVEL,'',levels.response)
        commonUtils.sendResponse(req, res, createdResp, next)
    }
}


async function getGroupLevels(){
    try{
        // models.New_Hierarchy_levels.findAll({}).then(function (success) {
        return models.Very_New_Hierarchy_levels.findAll({
            raw:true
        }).then(function (success) {
            let response
            if(success && success.length > 0){
                success[0].LevelData = JSON.parse(success[0].LevelData)
                success.maxHierarchyLevels = AppConfig.maxHierarchyLevels
                response = {
                    maxHierarchyLevels: AppConfig.maxHierarchyLevels,
                    hierarchyLevels : success[0]
                }
            }else{
                response = {
                    maxHierarchyLevels: AppConfig.maxHierarchyLevels,
                    hierarchyLevels : []
                }
            }
            return {success:true, response:response}
        }).catch(err => {
            // console.log(err)
            return {success:false, response:err}
        });

    }catch(err){
        // console.log("ERROR:",err)
        return {success:false, response:err}
    }
}



/************************* CREATE HIERARCHY LEVELS **************************/
async function createHierarchyLevel(req, res, next) {
    let levels = JSON.stringify(req.body);
    let json = {
        LevelData: levels
    }
    try{

        models.Very_New_Hierarchy_levels.create(json).then(async (success) =>{
            success.LevelData = JSON.parse(success.LevelData)
            let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, success)
            commonUtils.sendResponse(req, res, createdResp, next)
            // next(success);
        }).catch(async err => {
            console.log(err)
            let createdResp = await commonUtils.createResponse(STATUS.ERROR.CREATE_HIERARCHY_LEVEL,'',err)
            commonUtils.sendResponse(req, res, createdResp, next)
            // next({ status: STATUS.ERROR.CODE.ERR_CREATE_HIERARCHY_LEVEL,  message: err });
        });

    }catch{
        let createdResp = await commonUtils.createResponse(STATUS.ERROR.CREATE_HIERARCHY_LEVEL,'',STATUS.ERROR.DB_FETCH[1])
        commonUtils.sendResponse(req, res, createdResp, next)
    }
}



/************************* UPDATE HIERARCHY LEVELS **************************/
async function updateHierarchyLevel(req, res, next) {
    let levelsId = req.body.id, hierarchyLevels = req.body.levels;
    try{
        models.Very_New_Hierarchy_levels.update({
            LevelData: JSON.stringify(hierarchyLevels)
        }, {
            where: {
                Id: levelsId
            }
        }).then( async (success1)=> {
            // console.log("Successful update");
            models.Very_New_Hierarchy_levels.findAll({}).then(async (success)=> {
                let createdResp
                if(success && success.length > 0){
                    success[0].LevelData = JSON.parse(success[0].LevelData)
                    createdResp = await commonUtils.createResponse(STATUS.SUCCESS, success[0])
                }else{
                    createdResp = await commonUtils.createResponse(STATUS.SUCCESS, success)
                }

                commonUtils.sendResponse(req, res, createdResp, next)
            }).catch(async error =>{
                let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, levels)
                commonUtils.sendResponse(req, res, createdResp, next)
            })
        }).catch(async (error)=>{
            let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, error)
            commonUtils.sendResponse(req, res, createdResp, next)
        });
    }catch(error){
        let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, error)
        commonUtils.sendResponse(req, res, createdResp, next)
    }
}



/************************ GET HIERARCHY TREE *************************/
async function getHierarchyTree(req,res,next){
    let getTreeData = await getHierarchyTreeData()
    if(getTreeData.success === true){
        let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, getTreeData.response)
        commonUtils.sendResponse(req, res, createdResp, next)
    }else{
        let createdResp = await commonUtils.createResponse(STATUS.ERROR.GET_HIERARCHY_TREE,'',getTreeData.response)
        commonUtils.sendResponse(req, res, createdResp, next)
    }
}

async function getHierarchyTreeData(){
    try{
        return models.Nodes.findAll({
            raw : true,
            where: {
                IsActive: true
            }
        }).then(async function (hierarchy) {
            
            let PluginDetails = await PluginRoutes.getListOfPluginsInDB()
            PluginDetails = PluginDetails.success === true ? PluginDetails.response : []
            let hierarchyLevels = await getGroupLevels()
            hierarchyLevels = hierarchyLevels.success === true ? hierarchyLevels.response.hierarchyLevels.LevelData : []
            let AllHierarchy = await getTreeNode(hierarchy,PluginDetails,hierarchyLevels,0)
            // console.log("ALL HIERARCHIES:",AllHierarchy)
            let hierarchyTree = await buildHierarchyTree(AllHierarchy)
            // console.log("AFTER BUILD :,",hierarchyTree)
            let singleInstancePlugins = []
            for(let i=0; i<PluginDetails.length; i++){
                let plugin = PluginDetails[i];
                // console.log(plugin)
                if(plugin && (plugin.Instances == 1) && (plugin.ServicesEnabled === true) && (plugin.IsActive === true) && (plugin.UniqueName != AppConfig.securityApp)){
                    let singleInstancePlugin = {
                        name : plugin.Name,
                        Uid : plugin.Uid,
                        rootNodeId : (hierarchyTree && (hierarchyTree.length>0) && hierarchyTree[0].NodeID) ? hierarchyTree[0].NodeID : 1
                    }
                    singleInstancePlugins.push(singleInstancePlugin)
                }
            }
            let ecAppInfo  = await GetEcAppRegistartionInfo()
            if(ecAppInfo.success === true){
                let singleInstancePlugin = {
                    name : ecAppInfo.response.ApplicationName,
                    Uid : ecAppInfo.response.ApplicationGuid,
                    rootNodeId : (hierarchyTree && (hierarchyTree.length>0) && hierarchyTree[0].NodeID) ? hierarchyTree[0].NodeID : 1
                }
                singleInstancePlugins.push(singleInstancePlugin)
            }
            let hierarchyTreeResponse = {
                hierarchyTree : hierarchyTree,
                singleInstancePlugins : singleInstancePlugins
            }
            return {success:true, response:hierarchyTreeResponse}
        }).catch(err => {
            return {success:false, response:err}
        });
    }catch{
        return {success:false, response:err}
    }
}

async function buildHierarchyTree(hierarchy){
    if(_.isArray(hierarchy)){
        let map = {};
        // console.log("HIERARCHY TREE:",hierarchy.length)
        _.forEach(hierarchy,(obj)=>{
        /* let ss = await getTreeNode(hierarchy,PluginDetails,hierarchyLevels,0)
        console.log("###########LLL:",ss)
        return ss['-'].children; */
            let nodeObj = obj       
            nodeObj.children = []
            map[nodeObj.NodeID] = nodeObj;
            let parent = nodeObj.ParentID || '-';
            if(!map[parent]){
                map[parent] = {
                    children: []
                };
            }
            map[parent].children.push(nodeObj);
            map[parent].children.sort((obj1,obj2)=>{
                if (obj1.NodeType > obj2.NodeType) {
                  return 1;
                }
          
                if (obj1.NodeType < obj2.NodeType) {
                  return -1;
                }
      
                return 0
              })
        })
        return map['-'].children; 
    }
}

async function getTreeNode(hierarchy,PluginDetails,hierarchyLevels,index){
    let allHierarchy = []
    let nodeObj = hierarchy[index]
    // console.log("RETURNED NODE:",nodeObj) 
    nodeObj = await assignIconsToHierarchyLevels(nodeObj,PluginDetails,hierarchyLevels)  
    allHierarchy.push(nodeObj)
    if(index < hierarchy.length-1){
        index = index + 1
        let nodes =  await getTreeNode(hierarchy,PluginDetails,hierarchyLevels,index)
        // console.log("NODE:",nodes)
        _.forEach(nodes,node=>{
            allHierarchy.push(node)
        })

    }
    return allHierarchy
}

/* async function getTreeNode(hierarchy,PluginDetails,hierarchyLevels,index){
    let map = {}
    let nodeObj = hierarchy[index]
    console.log("RETURNED NODE:",nodeObj) 
    nodeObj = await assignIconsToHierarchyLevels(nodeObj,PluginDetails,hierarchyLevels)   
            
    nodeObj.children = []
    map[nodeObj.NodeID] = nodeObj;
    let parent = nodeObj.ParentID || '-';
    if(!map[parent]){
        map[parent] = {
            children: []
        };
    }
    map[parent].children.push(nodeObj);
    if(index < hierarchy.length-1){
        index = index + 1
        let node =  await getTreeNode(hierarchy,PluginDetails,hierarchyLevels,index)
        console.log("NODE:",node)
        for(let key in node){
            let value = node[key]
            value.children = []
            map[value.NodeID] = value;
            let parent = value.ParentID || '-';
            if(!map[parent]){
                map[parent] = {
                    children: []
                };
            }
            map[parent].children.push(value);
        }

    }
    return map
} */

async function assignIconsToHierarchyLevels(obj,PluginDetails,hierarchyLevels){
    if(obj && obj.ParentID === null){
        obj.IconUrl= process.env.HIERARCHY_TREE_ROOT_ICON ? process.env.HIERARCHY_TREE_ROOT_ICON : ''
        obj.TypeName = obj.TypeOf
        return obj
    }else if(obj && obj.PluginID !== null){
      if(PluginDetails && PluginDetails.length > 0){
        let pluginData = PluginDetails.find(pluginData => pluginData.Uid === obj.PluginID)
        obj.IconUrl = pluginData && pluginData.IconUrl ? pluginData.IconUrl : ''
      }else{
        obj.IconUrl = ''
      }
      obj.TypeName = obj.TypeOf
      return obj
    }else if(obj){     
      if(hierarchyLevels && hierarchyLevels.length > 0){
        let level = hierarchyLevels.find(level => level.LevelType == parseInt(obj.TypeOf))
        let image = level ? level.Image ? level.Image : '' : '';
        obj.IconUrl = image ? image : '';
        obj.TypeName = level.Name
        return obj
      }else {
        obj.IconUrl = ''
        obj.TypeName = level.Name
        return obj
      }
      
    }else{
      obj.IconUrl = ''
      obj.TypeName = obj.TypeOf
      return obj
    }
}




async function updateparentId(req,res,next){
    let body = req.body
    // console.log("------> Update parent Node ID :",req.body)
    try{
        models.Nodes.update({
            Uid : body.uid
        },{
            where :{
                ParentID : body.parentNodeId
            }
        }).then(node=>{

        })
    }catch(error){

    }
}


/***************************************************************
 ***** CHECK AVAILABILITY OF CUSTOMER ID AS ROOT NODE IN DB ****
****************************************************************/
async function checkAvailabilityOfEcRootNodeWithPortalCustomerID(portalKeyFile){
    console.log("## CHEKING CUSTOMER ID AVAILABILITY IN PORTAL KEY FILE:",portalKeyFile)
    let rootNodeUid = portalKeyFile.CustomerID ? portalKeyFile.CustomerID : ''
    console.log("## CHEKING CUSTOMER AVAILABILITY IN THE HIERARCHY TREE")
    logger.info("CHEKING CUSTOMER AVAILABILITY IN THE HIERARCHY TREE")
    let rootNode = await getNodeByUid(rootNodeUid)
    if(rootNode.success === true){
        logger.info("CUSTOAMER ID AS ROOT NODE ALREADY AVAILABLE IN THE HIERARCHY TREE")
        return models.Nodes.update({
            NodeName : portalKeyFile.NodeName,
            NodeShortName : portalKeyFile.NodeName
        },{
            where : {
                Uid : rootNodeUid
            }
        }).then(resp=>{
            logger.info("CUSTOAMER ID AS ROOT NODE UPDATED IN THE HIERARCHY TREE")
            return {success:true, response:rootNode.response}
        }).catch(err=>{
            logger.error("FAILED TO UPDATE CUSTOAMER ID AS ROOT NODE IN THE HIERARCHY TREE :",JSON.stringify(err))
            return {success:true, response:'Root node found and failed to update the name'}
        })
        
    }else{
        logger.info("CUSTOAMER ID AS ROOT NODE NOT FOUND IN THE HIERARCHY TREE, CREATING AS NEW")
        let obj =  {
            "uid" : portalKeyFile.CustomerID,
            "nodeName" : portalKeyFile.NodeName,
            "nodeShortName" : portalKeyFile.NodeName,
            "nodeType" : "enterprise-hierarchy",
            "typeOf" : "enterprise-configurator",
            "pluginId" : null,
            "parentId" : null,
            "nodeInfo" : null,
            "isActive" : true
        }
        let req = {
            session : {
              user : "EC-DEFAULT" 
            }
        }
        let nodeObj = await commonUtils.schemaOfNodeCreation(obj,req)
        let createRootNode = await nodeCreation(nodeObj);
        if(createRootNode.success === true){
            logger.info("CUSTOAMER ID AS ROOT NODE CREATED IN THE HIERARCHY TREE")
            return {success:true, response:createRootNode.response}
        }else{
            logger.error("FAILED TO CREATE CUSTOAMER ID AS ROOT NODE IN THE HIERARCHY TREE:"+createRootNode.response)
            return {success: false, response : createRootNode.response}
        }
    }
}




/**********************************************************************************************************
 * ****************** END OF MODIFIED CODE ****************************************************************
 **********************************************************************************************************/



/* async function insertAddtnlPropertyToDB(nodeId,addtnlPropertyMasterId,value){
    let addtnlPropertiesObj = {
        NodeUid : nodeId,
        Value : value,
        AddtnlPropertyMasterId : addtnlPropertyMasterId,
        IsActive : true
    }
    // console.log("addtnlPropertiesObj:",addtnlPropertiesObj)
    try{
        return await models.AdditionalProperties.create(addtnlPropertiesObj).then(async function (success) {
            return { success: true , data: success}
          
        }).catch(async err => {
            console.log("ERROR WHILE ADDTNL PROP:",err)
            return { success: false, data: err }
        });
    }catch(error){
        console.log("ERROR WHILE ADDTNL PROP1122:",error)
    }

} */


/* exports.createHierarchy = function (req, res, next) {
    console.log("COMING TO SAVE:",req.body)
    let node = req.body
    try{

            models.Nodes.create(node).then(async function (success) {
                console.log("AFTER CREATE:",success.Id)
                console.log("@@@@@@AFTER CREATE:",node)
                if(node && node.addtnlProperties){
                    let nodeUid = success.Id
                    // let addtnlFieldValue
                    let addtnlpropertiesCount = 0
                    let addtnlPropetyInsertionFailed = false
                    let addtnlPropetyInsertionFailedMsg = ''
                    _.forEach(node.addtnlProperties,async (value,key)=>{
                        
                        //addtnlFieldValue = value
                        let keyname = key.split(':')
                        let addtnlPropertyMasterId = keyname[1]
                        console.log("LOOP@@@:",value)
                        console.log("addtnlPropertyMasterId@@@:",addtnlPropertyMasterId)
                        let insertAddtnlProperty = await insertAddtnlPropertyToDB(nodeUid,addtnlPropertyMasterId,value)
                        console.log("insertAddtnlProperty@@@:",insertAddtnlProperty)
                        if(insertAddtnlProperty.success != false){
                            addtnlpropertiesCount = addtnlpropertiesCount + 1

                        }else{
                            addtnlpropertiesCount = addtnlpropertiesCount + 1
                            addtnlPropetyInsertionFailed = true
                            addtnlPropetyInsertionFailedMsg = insertAddtnlProperty.data
                            models.Nodes.destroy({
                                where: {
                                    Id : nodeUid
                                }
                            })
                        }

                        if(_.size(node.addtnlProperties) == addtnlpropertiesCount){
                            if(addtnlPropetyInsertionFailed === true){
                                let createdResp = commonUtils.createResponse(STATUS.ERROR.CREATE_HIERARCHY,'',addtnlPropetyInsertionFailedMsg)
                                commonUtils.sendResponse(req, res, createdResp, next)
                            }else{
                                let createdResp = commonUtils.createResponse(STATUS.SUCCESS,success)
                                commonUtils.sendResponse(req, res, createdResp, next)
                            }

                        }
                    })
               

                }else{
                    let createdResp = commonUtils.createResponse(STATUS.SUCCESS,success)
                    commonUtils.sendResponse(req, res, createdResp, next)
                }


            }).catch(async err => {
                let createdResp = commonUtils.createResponse(STATUS.ERROR.CREATE_HIERARCHY,'',err)
                commonUtils.sendResponse(req, res, createdResp, next)
            });
        // commonUtils.assignAutoIncrementNumber((err,Id)=>{
            // if(Id){
              
                //req.body.Id =process.env.AUTO_INCREMENT_PREPENDER+ Id
                //console.log("BODY:",req.body)
                // models.Nodes.create(req.body).then(async function (success) {
                //     //console.log("AFTER CREATE:",success)
                //     let createdResp = commonUtils.createResponse(STATUS.SUCCESS,success)
                //     commonUtils.sendResponse(req, res, createdResp, next)
                // }).catch(async err => {
                //     let createdResp = commonUtils.createResponse(STATUS.ERROR.CREATE_HIERARCHY,'',err)
                //     commonUtils.sendResponse(req, res, createdResp, next)
                // });
            // }else{
            //     console.log(err)
            // }
        // })


    }catch{
        let createdResp = commonUtils.createResponse(STATUS.ERROR.CREATE_HIERARCHY,'',STATUS.ERROR.DB_FETCH[1])
        commonUtils.sendResponse(req, res, createdResp, next)
    }
} */

/* exports.addElementToHierarchy = async function (req, res, next) {
    console.log("ADD ELEMENT API:", req)
    if (req.body != {} && req.body.hasOwnProperty('name') && req.body.hasOwnProperty('parentId')) {
        let nodeData = {
            NodeName: req.body.name,
            NodeShortName: req.body.name,
            ParentID: req.body.parentId,
            Data: JSON.stringify(req.body.data),
            CreatedDate: moment().format("YYYY-MM-DD HH:mm:ss:SS"),
            LastModifiedDate: moment().format("YYYY-MM-DD HH:mm:ss:SS"),
            CreatedBy: 'midhun',
            ModifiedBy: 'midhun',
            IsActive: 1
        }
        console.log("req.body:", req.body);
        console.log("HEADERS:", req.headers);
        if (req.headers.origin != 'http://localhost:4200') {
            let request = req.headers.origin.split(':')
            let requestedPort = request[2]
            glob(process.env.PLUGINS_PATH, async function (err, files) {
                if (err) {
                    next({ status: 404, message: "Error while detecting the plugins and their information" });
                    res.end();
                } else {
                    let pluginMatchNotFoundCount = 0
                    for (let i = 0; i < files.length; i++) {
                        let plugingData = await require('../' + files[i]);
                        if (plugingData && plugingData.serverPort == requestedPort) {
                            await models.Plugins.findOne({
                                where: {
                                    PluginName: plugingData.name
                                }
                            }).then(async foundPlugin => {
                                nodeData.PluginID = foundPlugin.PluginID
                                nodeData.NodeType = foundPlugin.PluginName
                                await models.Nodes.create(nodeData).then(success => { 
                                    next({ message: "Successfully saved" });
                                    res.end();
                                }).catch(err => {
                                    next({ status: 500, message: "Internal error while saving the information" });
                                    res.end();
                                })
                            }).catch(err => {
                                console.log("ERROR:", err)
                                next({ status: 500, message: "Error while fetching the plugin information, Please try later" }); 
                                res.end();
                            })
                        } else {
                            pluginMatchNotFoundCount = pluginMatchNotFoundCount + 1
                            if (pluginMatchNotFoundCount == files.length) {
                                next({ status: 404, message: "Requested Plugin information not found" });
                                res.end();
                            }
                        }
                    }
                }
            })
        } else if (req.body.hasOwnProperty('port')) {
            let requestedPort = req.body.port
            console.log("REQUESTED PORT:", requestedPort)
            glob(process.env.PLUGINS_PATH, async function (err, files) {
                if (err) {
                    next({ status: 404, message: "Error while detecting the plugins and their information" });
                    res.end();
                } else {
                    let pluginMatchNotFoundCount = 0
                    for (let i = 0; i < files.length; i++) {
                        let plugingData = await require('../' + files[i]);
                        console.log("PLugin port :", plugingData.serverPort)
                        if (plugingData && plugingData.serverPort == requestedPort) {
                            await models.Plugins.findOne({
                                where: {
                                    PluginName: plugingData.name
                                }
                            }).then(async foundPlugin => {
                                nodeData.PluginID = foundPlugin.PluginID
                                nodeData.NodeType = foundPlugin.PluginName
                                await models.Nodes.create(nodeData).then(success => { 
                                    next({ message: "Successfully saved" });
                                    res.end();
                                }).catch(err => {
                                    next({ status: 500, message: "Internal error while saving the information" });
                                    res.end();
                                })
                            }).catch(err => {
                                console.log("ERROR:", err)
                                next({ status: 500, message: "Error while fetching the plugin information, Please try later" }); 
                                res.end();
                            })
                        } else {
                            pluginMatchNotFoundCount = pluginMatchNotFoundCount + 1
                            if (pluginMatchNotFoundCount == files.length) {
                                next({ status: 404, message: "Requested Plugin information not found" });
                                res.end();
                            }
                        }
                    }
                }
            })
        }
    }
} */

/* exports.addElementToHierarchyEXAMPLE = function (req, res, next) {
    console.log("ADD ELEMENT HIERARCHY :",req.body)
    let thirdParameter = _.omit(req.body, ['name', 'parentId'])
    let thirdParameterData;
    for(let key in thirdParameter){
        
        thirdParameterData = req.body[key]
    }
    
    console.log("FOMR DATA:",thirdParameterData)
    let nodeData = {
        NodeName: req.body.name,
        NodeShortName: req.body.name,
        ParentID: req.body.parentId,
        Data: JSON.stringify(thirdParameterData),
        CreatedDate: moment().format("YYYY-MM-DD HH:mm:ss:SS"),
        LastModifiedDate: moment().format("YYYY-MM-DD HH:mm:ss:SS"),
        CreatedBy: 'midhun',
        ModifiedBy: 'midhun',
        IsActive: 1
    }

    glob(process.env.PLUGINS_PATH, async function (err, files) {
        if (err) {
            let createdResp = commonUtils.createResponse(STATUS.ERROR.DETECTING_PLUGINS,'',err)
            commonUtils.sendResponse(req, res, createdResp, next)
            // next({ status: 404, message: "Error while detecting the plugins and their information" });
        } else {
            let pluginMatchNotFoundCount = 0
            for (let i = 0; i < files.length; i++) {
                let plugingData = await require('../' + files[i]);
                if (plugingData && plugingData.name == req.headers.name) {
                    try{
                        await models.Plugins.findOne({
                            where: {
                                PluginName: plugingData.name
                            }
                        }).then(async foundPlugin => {
                            if(foundPlugin){
                                nodeData.PluginID = foundPlugin.PluginID
                                nodeData.NodeType = "application"
                                nodeData.TypeOf = foundPlugin.PluginName
                                try{
                                    await models.Nodes.create(nodeData).then(success => { 
                                        // res.status(200).send({ message: "Successfully saved", parentUrl: process.env.APP_URL })
                                        let createdResp = commonUtils.createResponse(STATUS.SUCCESS, { message:"Successfully saved", parentUrl: config.url+':4200'})
                                        commonUtils.sendResponse(req, res, createdResp, next)
                                        // next({ message: "Successfully saved", parentUrl: process.env.APP_URL });
                                    }).catch(err => {
                                        let createdResp = commonUtils.createResponse(STATUS.ERROR.ADD_ELEMENT_TO_HIERARCHY,'',err)
                                        commonUtils.sendResponse(req, res, createdResp, next)
                                        // next({ status: 500, message: err });
                                    })

                                }catch{
                                    let createdResp = commonUtils.createResponse(STATUS.ERROR.ADD_ELEMENT_TO_HIERARCHY,'',STATUS.ERROR.DB_FETCH[1])
                                    commonUtils.sendResponse(req, res, createdResp, next)
                                }
                            }else{
                                let createdResp = commonUtils.createResponse(STATUS.ERROR.PLUGIN_NOT_REGISTERED_TO_ADDELEMENT,'',err)
                                commonUtils.sendResponse(req, res, createdResp, next)
                            }

                        }).catch(err => {
                            console.log("ERROR:", err)
                            let createdResp = commonUtils.createResponse(STATUS.ERROR.PLUGIN_INFO_NOT_FOUND_IN_ADDELEMENT,'',err)
                            commonUtils.sendResponse(req, res, createdResp, next)
                            // next({ status: 500, message: "Error while fetching the registered plugin information" }); 
                        })

                    }catch{
                        let createdResp = commonUtils.createResponse(STATUS.ERROR.PLUGIN_INFO_NOT_FOUND_IN_ADDELEMENT,'',STATUS.ERROR.DB_FETCH[1])
                        commonUtils.sendResponse(req, res, createdResp, next)
                    }
                    
                } else {
                    pluginMatchNotFoundCount = pluginMatchNotFoundCount + 1
                    if (pluginMatchNotFoundCount == files.length) {
                        let createdResp = commonUtils.createResponse(STATUS.ERROR.PLUGIN_INFO_NOT_MATCHED_IN_ADDELEMENT,'',err)
                        commonUtils.sendResponse(req, res, createdResp, next)
                        // next({ status: 404, message: "Requested Plugin information not found to add an element" });
                    }
                }
            }
        }
    })

} */


/* async function saveToPluginsInfo(thirdParameterData){
    let thirdParameter = {
        FormInfo : thirdParameterData ? JSON.stringify(thirdParameterData) : null 
    }
    try{
        return await models.PluginsFormInfo.create(thirdParameter).then(result =>{
            if(result){
                return {success : true, response : result}
            }else{
                return {success : true, response : null}
            }
        })
    }catch(err){
        return {success : false, response : err}
    }
}


exports.addElementToHierarchyNode = async function(req,res,next){
    console.log("Coming to add element:",req.body)
    let pluginName = req.headers.name
    let nodeName = req.body.name
    let parentIds = req.body.id

    let isPluginRegistered = await PluginRoutes.getPluginFromDbByName(pluginName)
    console.log("isPluginRegistered:",isPluginRegistered)
    if(isPluginRegistered.success === true){
        let thirdParameterData = getThirdParameterValuesForAddAndUpdateElement(req)
        console.log("thirdParameterData:",thirdParameterData)
        let savedInfoOfPlugin = await saveToPluginsInfo(thirdParameterData)
            console.log("savedInfoOfPlugin:",savedInfoOfPlugin)
            if(savedInfoOfPlugin.success === true && savedInfoOfPlugin.response != null){
                let nodeCreationSchema = await commonUtils.schemaOfNodeCreation()
                let savingNodesArr = await createNodeFormat(nodeName,parentIds,isPluginRegistered.response, savedInfoOfPlugin.response)
                let allReturnedSavedNodes = await saveToNodes(savingNodesArr, 0)
                console.log("ALL SAVED NODES:",allReturnedSavedNodes)
                if(allReturnedSavedNodes.length == savingNodesArr.length){
                    let respOfAllSavedNodesRawData = []
                    _.forEach(allReturnedSavedNodes, (node)=> {
                        if(node.success == true){
                            respOfAllSavedNodesRawData.push(node.data)
                        }
                    })
                    let responseInfo= {
                        Id : savedInfoOfPlugin.data.Id,
                        requestedData : req.body,
                        responseData : respOfAllSavedNodesRawData
                    }
                     let createdResp = commonUtils.createResponse(STATUS.SUCCESS, { message:"Successfully saved", parentUrl: config.url+':4200',responseInfo})
                     commonUtils.sendResponse(req, res, createdResp, next)
                }
            }else{
                
                let createdResp = commonUtils.createResponse(STATUS.ERROR.ADD_ELEMENT_TO_HIERARCHY,'',savedInfoOfPlugin.response)
                commonUtils.sendResponse(req, res, createdResp, next)
            }
        
    }else{
        let createdResp = commonUtils.createResponse(STATUS.ERROR.PLUGIN_INFO_NOT_FOUND_IN_ADDELEMENT,'',isPluginRegistered.response)
        commonUtils.sendResponse(req, res, createdResp, next)
    }
}

async function getThirdParameterValuesForAddAndUpdateElement(req){
    let thirdParameter = _.omit(req.body, ['name', 'id'])
    let thirdParameterData;
    if(thirdParameter){
        _.forEach(thirdParameter, (value, key)=> {
            console.log("thirdParameter Key",key);
            thirdParameterData = value
        });
    }else{
        thirdParameterData = null
    }
    return thirdParameterData
}


async function createNodeFormat(nodeName,parentIds,requestedPluginInfo, savedInfoPlugin){
    let savingNodes = []
    _.forEach(parentIds, (parentId)=>{
        let nodeData = {
            NodeName: nodeName,
            NodeShortName: nodeName,
            ParentID: parentId,
            PluginID : requestedPluginInfo.Uid ? requestedPluginInfo.Uid : requestedPluginInfo.Id,
            TypeOf : requestedPluginInfo.UniqueName ? requestedPluginInfo.UniqueName : requestedPluginInfo.Name,
            NodeType : "application",
            PluginInfoId: savedInfoPlugin ? savedInfoPlugin.Id ? savedInfoPlugin.Id : null : null,
            CreatedDate: moment().format("YYYY-MM-DD HH:mm:ss:SS"),
            LastModifiedDate: moment().format("YYYY-MM-DD HH:mm:ss:SS"),
            CreatedBy: 'user1',
            ModifiedBy: 'user1',
            IsActive: 1
        }
        savingNodes.push(nodeData)
    })
    return savingNodes
} */


/* async function saveToNodes(savingNodesArr, index){
    let finalData = [];
    let savedNode = await savingOfNodes(savingNodesArr, index)
    finalData.push(savedNode)
    let increamentingIndex = savedNode.returnedIndex
    if(increamentingIndex < savingNodesArr.length-1){
        increamentingIndex = increamentingIndex + 1
        let allSavedNodes = await saveToNodes(savingNodesArr, increamentingIndex)
        allSavedNodes.forEach((node)=>{
            finalData.push(node);
        });
    }
    return finalData
}

async function savingOfNodes(savingNodesArr, index){
    let node = savingNodesArr[index]
    try{
        return models.Nodes.create(node).then(resultant =>{
            return {success : true, returnedIndex : index, data : resultant}
        }).catch(error =>{
            return {success : false, returnedIndex : index, data : error}
        })
    }catch(err){
        return {success : false, returnedIndex : index, data : err}
    }
} */

/* async function saveElementToHierarachy(pluginInfoId,nodeName,parentIds,thirdParameterData,index,req,res,next){

    let parentId = parentIds[index]
    console.log("INDEX:",index)
    console.log("parentIds:",parentIds.length-1)
    let nodeData = {
        NodeName: nodeName,
        NodeShortName: nodeName,
        ParentID: parentId,
        PluginInfoId: pluginInfoId ? pluginInfoId : null,
        CreatedDate: moment().format("YYYY-MM-DD HH:mm:ss:SS"),
        LastModifiedDate: moment().format("YYYY-MM-DD HH:mm:ss:SS"),
        CreatedBy: 'midhun',
        ModifiedBy: 'midhun',
        IsActive: 1
    }

    nodeData.PluginID = foundPlugin.PluginID
    nodeData.NodeType = "application"
    nodeData.TypeOf = foundPlugin.PluginName
    try{
        // commonUtils.assignAutoIncrementNumber(async (err,Id)=>{
            //nodeData.Id = process.env.AUTO_INCREMENT_PREPENDER+Id
            await models.Nodes.create(nodeData).then(success => { 
                if(parentIds.length-1 > index){
                    index = index + 1
                    saveElementToHierarachy(pluginInfoId,nodeName,parentIds,thirdParameterData,index,req,res,next)
                }else{
                    // res.status(200).send({ message: "Successfully saved", parentUrl: process.env.APP_URL })
                   // console.log("SUCCES AFTER ADDED THE PLUGIN:",success)
                   let responseInfo= {
                       requestedData : req.body,
                       responseData : success
                   }
                    let createdResp = commonUtils.createResponse(STATUS.SUCCESS, { message:"Successfully saved", parentUrl: config.url+':4200',responseInfo})
                    commonUtils.sendResponse(req, res, createdResp, next)
                    // next({ message: "Successfully saved", parentUrl: process.env.APP_URL });
                }
    
            }).catch(err => {
                if(parentIds.length-1 > index){
                    index = index + 1
                    saveElementToHierarachy(pluginInfoId,nodeName,parentIds,thirdParameterData,0,req,res,next)
                }else{
                    let createdResp = commonUtils.createResponse(STATUS.ERROR.ADD_ELEMENT_TO_HIERARCHY,'',err)
                    commonUtils.sendResponse(req, res, createdResp, next)
                    // next({ status: 500, message: err });
                }
            })
        // })


    }catch{
        if(parentIds.length-1 > index){
            index = index + 1
            saveElementToHierarachy(pluginInfoId,nodeName,parentIds,thirdParameterData,0,req,res,next)
        }else{
            let createdResp = commonUtils.createResponse(STATUS.ERROR.ADD_ELEMENT_TO_HIERARCHY,'',STATUS.ERROR.DB_FETCH[1])
            commonUtils.sendResponse(req, res, createdResp, next)
        }
    }


} */


/* exports.addElement = async function (req, res) {
    console.log("ADD ELEMENT:", req.body)
    if (req.body != {} && req.body.formData && req.body.formData.Name) {
        let nodeData = {
            ParentID: req.body.nodeData.ParentID,
            NodeType: 'Enterprise',
            CreatedDate: moment().format("YYYY-MM-DD HH:mm:ss:SS"),
            LastModifiedDate: moment().format("YYYY-MM-DD HH:mm:ss:SS"),
            CreatedBy: req.body.nodeData.userName,
            ModifiedBy: req.body.nodeData.userName,
            IsActive: 1
        }
        let formData = req.body.formData;
        nodeData.Data = JSON.stringify(formData)
        console.log("req.body:", req.body)
        console.log("HEADERS:", req.headers)
        console.log("nodeData:", nodeData)
        if (req.headers.origin) {
            let request = req.headers.origin.split(':')
            let requestedPort = request[2]
            glob(process.env.PLUGINS_PATH, async function (err, files) {
                if (err) {
                    res.status(500).send({
                        message: err
                    })
                } else {
                    for (let i = 0; i < files.length; i++) {
                        let plugingData = await require('../' + files[i]);
                        if (plugingData.serverPort == requestedPort) {
                            console.log("PORT :", plugingData.serverPort)
                            await models.Plugins.findOne({
                                where: {
                                    PluginName: plugingData.name
                                }
                            }).then(async foundPlugin => {
                                console.log("foundPlugin :", foundPlugin.PluginID)
                                nodeData.PluginID = foundPlugin.PluginID
                                nodeData.NodeType = foundPlugin.PluginName
                                nodeData.NodeName = formData.Name
                                nodeData.NodeShortName = formData.Name
                                await models.Nodes.create(nodeData).then(success => {
                                    res.status(200).send({
                                        message: "Success"
                                    })
                                }).catch(err => {
                                    res.error(500).send({
                                        message: err
                                    })
                                })
                            }).catch(error => {
                                res.error(500).send({
                                    message: error
                                })
                            })
                        }
                    }
                }
            })
        } else {
            res.status(500).error({
                message: "Requested call is not from the trusted app"
            })
        }
    } else {
        res.sendStatus(500).error({
            message: "Name field is missing in the form data"
        })
    }

} */

/* async function getPluginFormInfo(PluginInfoId){
    try{
        return await models.PluginsFormInfo.findOne({
            raw : true,
            where : {
                Id : PluginInfoId
            }
        }).then(result =>{
            return {success : true , data : result}
        }).catch(error =>{
            return {success : false , data : null}
        })
    }catch(err){
        return {success : false , data : result}
    }
}

exports.getHierarchyElementDataByNodeId = async function (req, res, next) {
    try{
        console.log("PARAMS:", req.params.uid)
        models.Nodes.findOne({
            raw : true,
            where: {
                Uid: req.params.uid
            }
        }).then(async (result) => {
            let isSuccess = await getPluginFormInfo(result.PluginInfoId)
            if(isSuccess.success == true && isSuccess.data != null){
                let responseData = JSON.parse(isSuccess.data.FormInfo)
                responseData.Id = isSuccess.data.Id
                let createdResp = commonUtils.createResponse(STATUS.SUCCESS, responseData)
                commonUtils.sendResponse(req, res, createdResp, next)
            }else{
                let createdResp = commonUtils.createResponse(STATUS.ERROR.HIERARCHY_ELEMENT_DATA_BY_NODEID,'',isSuccess.data)
                commonUtils.sendResponse(req, res, createdResp, next)
            }

            // next(JSON.parse(result.Data));
        }).catch(err => {
            console.log("error while getting from the db")
            let createdResp = commonUtils.createResponse(STATUS.ERROR.HIERARCHY_ELEMENT_DATA_BY_NODEID,'',err)
            commonUtils.sendResponse(req, res, createdResp, next)
            // next({ status: STATUS.ERROR.CODE.ERR_HIERARCHY_ELEMENT_DATA_BY_NODEID, message: err });
        });

    }catch{
        let createdResp = commonUtils.createResponse(STATUS.ERROR.HIERARCHY_ELEMENT_DATA_BY_NODEID,'',STATUS.ERROR.DB_FETCH[1])
        commonUtils.sendResponse(req, res, createdResp, next)
    }    
} */

/* async function getPluginInfoId(parentIds, pluginId, nodeName){
    return Promise((resolve,reject)=>{
        let nodeInfoIds = []
        let count = 0
        _.forEach(parentIds, (nodeId)=>{
            try{
                models.Nodes.findOne({
                    raw : true,
                    where : {
                        NodeID : nodeId
                    }
                }).then( node => {
                    count = count + 1
                    if(node && node.PluginID == pluginId){
                        nodeInfoIds.push(node.PluginInfoId) 
                        updateNodeName(node.NodeID, nodeName)
                    }
                    if(parentIds.length === count){
                        resolve(nodeInfoIds)
                    }
                }).catch(err =>{
                    count = count + 1
                    if(parentIds.length === count){
                        resolve(nodeInfoIds)
                    }
                })
            }catch{
                count = count + 1
                if(parentIds.length === count){
                    resolve(nodeInfoIds)
                }
            }
        }) 
    })
} */

/* async function updateNodeName(NodeID, nodeName){
    try{
        models.Nodes.update({
            NodeName : nodeName
        },{
            where : NodeID
        }).then(success =>{
            console.log("UPDATED ELEMENT NODE")
        })
    }catch{

    }
} */

/* async function updatePluginFormInfoData(resultantPluginInfoId,thirdParameterData){
    try{
        return await models.PluginsFormInfo.update({
            FormInfo : thirdParameterData ? JSON.stringify(thirdParameterData) : null
            },{
                where : {
                    FormId : resultantPluginInfoId
                }
            }).then(success =>{
                return {success : true}
            }).catch(err =>{
                return {success : false}
            })
    }catch{
        return {success : false}
    }
} */

/* async function getCurrentNodePluginInfoId(currentIds){
    let allNodesWithPluginInfoId = []
    return new Promise((resolve,reject)=>{
        let count = 0
        _.forEach(currentIds, (nodeId)=>{
            try{
                models.Nodes.findAll({
                    raw: true,
                    where : {
                        NodeID : nodeId
                    }
                }).then(result =>{
                    count = count + 1
                    allNodesWithPluginInfoId.push(result)
                    if(count == currentIds.length){
                        resolve(result)
                    }
                }).catch(error =>{
                    count = count + 1
                    console.log("error while geting plugin Info with NodeId", error)
                    if(count == currentIds.length){
                        reject(allNodesWithPluginInfoId)
                    }
                })
            }catch(err){
                console.log("error while geting plugin Info with NodeId$$%%", err)
                count = count + 1
                if(count == currentIds.length){
                    reject(allNodesWithPluginInfoId)
                }
            }
        })

    })
}

async function updateNodeName(savingNodesArr,nodeName, index){
    let finalData = [];
    let savedNode = await updateNodeToDB(savingNodesArr, nodeName, index)
    console.log("Saved Node:",savedNode)
    savedNode ? savedNode.success == true ? finalData.push(savedNode.data) : '' : ''
    
    let increamentingIndex = savedNode.returnedIndex
    if(increamentingIndex < savingNodesArr.length-1){
        increamentingIndex = increamentingIndex + 1
        let allSavedNodes = await updateNodeName(savingNodesArr,nodeName, increamentingIndex)
        allSavedNodes.forEach((node)=>{
            finalData.push(node);
        });
    }
    return finalData
}

async function updateNodeToDB(allUpdatableNodes, nodeName, index){
    let node = allUpdatableNodes[index]
       console.log("allUpdatableNodes:",allUpdatableNodes)
       console.log("Update Node:",node)
       console.log("Update nodeName:",nodeName)
            try{
                return await models.Nodes.update({
                    NodeName : nodeName
                }, {
                    where : {
                        NodeID : node.NodeID
                    }
                }).then(result =>{
                    node.NodeName = nodeName
                    return {success:true, returnedIndex: index, data :node}
                }).catch(error =>{
                    console.log("error while geting plugin Info with NodeId", error)
                    return {success:false, returnedIndex: index, data :error}
                })
            }catch(err){
                console.log("Error of fetch:",err)
                return {success:false, returnedIndex: index, data :"Error of fetch"}
            }
}

async function updatePluginInfoWithPluginId(pluginInfoId, thirdParameterData){
    try{
        return await models.PluginsFormInfo.update({
            FormInfo : thirdParameterData ? JSON.stringify(thirdParameterData) : null
        },{
            where : {
                Id : pluginInfoId
            }
        }).then(res =>{
            return {success : true, data : res}
        }).catch(error =>{
            return {success : false, data : error}
        })
    }catch(err){
        return {success : false, data : err}
    }
}

exports.updateHierarchyElementDataByNodeId = async function (req,res,next){
    console.log('REQUEST PARAMS :',req.body)
    let pluginName = req.headers.name
    let nodeName = req.body.name
    let parentIds = req.body.id

    let isPluginRegistered = await PluginRoutes.checkIsPluginRegistered({pluginName : pluginName})
    console.log("isPluginRegistered:",isPluginRegistered)
    if(isPluginRegistered.success === true && isPluginRegistered.data != null){
        let thirdParameterData = getThirdParameterValuesForAddAndUpdateElement(req)
        console.log("UPDATE OF ELEMENT:",thirdParameterData)
        let allCurrentNodes = getCurrentNodePluginInfoId(parentIds)
        allCurrentNodes.then(async allUpdatableNodes =>{
            console.log("allUpdatableNodes :",allUpdatableNodes)
            if(allUpdatableNodes.length > 0){
                let updatedNodes = await updateNodeName(allUpdatableNodes, nodeName,0)
                // updateNodeName(allUpdatableNodes, nodeName).then(async updatedNodes =>{
                    console.log("UpdatedNodes :",updatedNodes)
                    let updatedPluginInfo = await updatePluginInfoWithPluginId(updatedNodes[0].PluginInfoId, thirdParameterData)
                    if(updatedPluginInfo.success == true){
                        let responseInfo= {
                            Id : updatedNodes[0].PluginInfoId,
                            requestedData : req.body,
                            responseData : updatedNodes
                        }
                        let createdResp = commonUtils.createResponse(STATUS.SUCCESS, { message:"Successfully Updated", parentUrl: config.url+':4200', responseInfo})
                        commonUtils.sendResponse(req, res, createdResp, next)
                    }else{
                        let createdResp = commonUtils.createResponse(STATUS.ERROR.UPDATE_HIERARCHY_ELEMENT_DATA_BY_NODEID,{message: "Error while updating"},STATUS.ERROR.DB_FETCH[1])
                        commonUtils.sendResponse(req, res, createdResp, next)
                    }
            }else{
                let createdResp = commonUtils.createResponse(STATUS.ERROR.UPDATE_HIERARCHY_ELEMENT_DATA_BY_NODEID,{message: "Error while updating"},STATUS.ERROR.DB_FETCH[1])
                commonUtils.sendResponse(req, res, createdResp, next)
            }

            // let allNodesWithPluginInfoId = getNodesWithPluginInfoId(nodesPluginInfoId)
        }).catch(error =>{
            console.log("Eroror of updating Element:",error)
            let createdResp = commonUtils.createResponse(STATUS.ERROR.UPDATE_HIERARCHY_ELEMENT_DATA_BY_NODEID,{message: "Error while updating"},error)
            commonUtils.sendResponse(req, res, createdResp, next)
        })
        
        // let pluginInfoId = getPluginInfoId(parentIds, isPluginRegistered.data.PluginID, nodeName)
        // pluginInfoId.then(resultantPluginInfoIds =>{
        //     let updateResult = updatePluginFormInfoData(resultantPluginInfoId[0],thirdParameterData)
        //     if(updateResult.success === true){
        //         let responseInfo= {
        //             requestedData : req.body,
        //             responseData : success
        //         }
        //         let createdResp = commonUtils.createResponse(STATUS.SUCCESS, { message:"Successfully Updated", parentUrl: process.env.APP_URL+':4200', responseInfo})
        //         commonUtils.sendResponse(req, res, createdResp, next)
        //     }else{
        //         let createdResp = commonUtils.createResponse(STATUS.ERROR.UPDATE_HIERARCHY_ELEMENT_DATA_BY_NODEID,'',STATUS.ERROR.DB_FETCH[1])
        //         commonUtils.sendResponse(req, res, createdResp, next)
        //     }

        // }).catch(error =>{

        // })

    }else{
        let createdResp = commonUtils.createResponse(STATUS.ERROR.NODEID_NOT_FOUND_UPDATE_HIERARCHY_ELEMENT_DATA_BY_NODEID,{message: "Error while updating"},isPluginRegistered.data)
        commonUtils.sendResponse(req, res, createdResp, next)
    } 
} */




/* async function updateAdditionalProperties(nodeUid,addtnlProperties){
    return new Promise((resolve,reject)=>{
        let updatedPropertyStatus = true
        let updatedPropertyResponse = []
        _.forEach(addtnlProperties,async (property,key) =>{
            let propertyKey = key.split(':')
            let propertyId = propertyKey[1]
            let updatedProperty = await updateAdditionalPropertiesToDB(property, nodeUid, propertyId)
            updatedPropertyResponse.push(updatedProperty)
            if(updatedProperty.success == false){
                updatedPropertyStatus = false
            }
            if(_.size(addtnlProperties) == updatedPropertyResponse.length){
                // console.log("@@## COMPLETED UPDATE OF ADDTNL PROPERTY:",updatedPropertyResponse)
                resolve(updatedPropertyStatus) 
            }
    
        })
    })


} */

/* async function updateAdditionalPropertiesToDB(property, nodeUid, propertyId){
    try{
        return await models.AdditionalProperties.update({
            Value : property
        },{
            where : {
                NodeUid : {
                    [Sequelize.Op.eq] : nodeUid
                },
                Id : propertyId
            }
        }).then(success =>{
            // console.log("Success update:",success)
            return {success: true}
        }).catch(error =>{
            console.log("Error update:",error)
            return {success: false}
        })
    }catch(err){
        console.log("Error update:",err)
        return {success: false}
    }
} */




/* async function updateAdditionalProperties(addtnlProperties,nodeUid, index){
    let finalData = [];
    let savedNode = await updateAdditionalPropertiesToDB(savingNodesArr, nodeName, index)
    console.log("Saved Node:",savedNode)
    savedNode ? savedNode.success == true ? finalData.push(savedNode.data) : '' : ''
    
    let increamentingIndex = savedNode.returnedIndex
    if(increamentingIndex < savingNodesArr.length-1){
        increamentingIndex = increamentingIndex + 1
        let allSavedNodes = await updateAdditionalProperties(addtnlProperties,nodeUid, increamentingIndex)
        allSavedNodes.forEach((node)=>{
            finalData.push(node);
        });
    }
    return finalData
} */


/* exports.updateHierarchyNodeToDB =  async function(req, res, next){
    console.log("Hierarchy : ",req.body)
    let updateNodeInfo = req.body
    let NodeUid = updateNodeInfo.nodeUid
    let NodeType = updateNodeInfo.nodeType
    let NodeName = updateNodeInfo.nodeName
    let NodeNotes = JSON.stringify(updateNodeInfo.nodeInfo)
    let TypeOf = updateNodeInfo.typeOf
        try{
            models.Nodes.update({
                NodeName: NodeName,
                NodeType : NodeType,
                TypeOf : TypeOf,
                NodeInfo: NodeNotes
            }, {
                where: {
                    Uid: NodeUid
                }
            }).then(success => {
                let createdResp = commonUtils.createResponse(STATUS.SUCCESS,success)
                commonUtils.sendResponse(req, res, createdResp, next)
            }).catch(err => {
                let createdResp = commonUtils.createResponse(STATUS.ERROR.UPDATE_HIERARCHY_NODE,'',err)
                commonUtils.sendResponse(req, res, createdResp, next)
                // next({ status: STATUS.ERROR.CODE.ERR_UPDATE_HIERARCHY_NODE, message: err });
            })
        }catch{
            let createdResp = commonUtils.createResponse(STATUS.ERROR.UPDATE_HIERARCHY_NODE,'',STATUS.ERROR.DB_FETCH[1])
            commonUtils.sendResponse(req, res, createdResp, next)
        }
} */

/* exports.updateHierarchyNode = async function (req, res, next) {
    console.log("BODY INFO:", req.body)
    let updateNodeInfo = req.body
    let NodeUid = updateNodeInfo.nodeUid

    let addtnlProperties =  updateNodeInfo.additionalProperties ? updateNodeInfo.additionalProperties : ''
    if(addtnlProperties){
        let statusOfUpdateAddtnlProperties = await updateAdditionalProperties(NodeUid,addtnlProperties)
        console.log("STATUS OF UPDATE:",statusOfUpdateAddtnlProperties)
        if(statusOfUpdateAddtnlProperties == true){
            updateHierarchyNodeToDB(updateNodeInfo,req, res, next)
        }
    }


} */

/* exports.updateHierarchyNodeType = function (req, res, next) {
    console.log("BODY INFO:", req.body)
    let updateNodeInfo = req.body
    let NodeID = updateNodeInfo.nodeId
    let NodeType = updateNodeInfo.nodeType
    if (NodeName && NodeID) {
        try{
            models.Nodes.update({
                TypeOf: NodeType
            }, {
                where: {
                    NodeID: NodeID
                }
            }).then(success => {
                let createdResp = commonUtils.createResponse(STATUS.SUCCESS,success)
                commonUtils.sendResponse(req, res, createdResp, next)
            }).catch(err => {
                let createdResp = commonUtils.createResponse(STATUS.ERROR.UPDATE_HIERARCHY_NODE,'',err)
                commonUtils.sendResponse(req, res, createdResp, next)
                // next({ status: STATUS.ERROR.CODE.ERR_UPDATE_HIERARCHY_NODE, message: err });
            })
        }catch{
            let createdResp = commonUtils.createResponse(STATUS.ERROR.UPDATE_HIERARCHY_NODE,'',STATUS.ERROR.DB_FETCH[1])
            commonUtils.sendResponse(req, res, createdResp, next)
        }
    } else {
        let createdResp = commonUtils.createResponse(STATUS.ERROR.NODEID_NODENAME_NOT_FOUND_UPDATE_HIERARCHY_NODE,'',err)
        commonUtils.sendResponse(req, res, createdResp, next)
        // next({ status: STATUS.ERROR.CODE.ERR_UPDATE_HIERARCHY_NODE, message: STATUS.ERROR.MESSAGE.ERR_UPDATE_HIERARCHY_NODE });
    }

} */



/* exports.updateHierarchyLevel = function (req, res, next) {
    //console.log("UPDATE:",req.body)
    let levels = req.body
    try{
        Promise.map(levels, function (source) {
            console.log("Update:",source.Id)
            return models
                .Heirarchy_levels
                .update({
                    Name: source.Name,
                    Strict: source.Strict,
                    Image: source.Image,
                }, {
                    // We have to call update with the ID of each discoverySource so that
                    // we update the names of each discovery source correctly.
                    where: {
                        Id: source.Id
                    }
                })
        })
        .then( (success)=> {
            console.log("Successful update");
            let createdResp = commonUtils.createResponse(STATUS.SUCCESS, success)
            commonUtils.sendResponse(req, res, createdResp, next)
        }).catch((error)=>{
            let createdResp = commonUtils.createResponse(STATUS.ERROR.UPDATE_HIERARCHY_LEVEL,'',error)
            commonUtils.sendResponse(req, res, createdResp, next)
        });
    }catch{
        let createdResp = commonUtils.createResponse(STATUS.ERROR.UPDATE_HIERARCHY_LEVEL,'',STATUS.ERROR.DB_FETCH[1])
        commonUtils.sendResponse(req, res, createdResp, next)
    }
} */


/* exports.updateHierarchyLevel = async function (req, res, next) {
    ////////////// WORKING CODE ///////////////////////
    let levelsId = req.body.id, hierarchyLevels = req.body.levels;

    try{
        models.Very_New_Hierarchy_levels.update({
            LevelData: JSON.stringify(hierarchyLevels)
        }, {
            where: {
                Id: levelsId
            }
        }).then( (success1)=> {
            console.log("Successful update");
            models.Very_New_Hierarchy_levels.findAll({}).then(function (success) {
                let createdResp
                if(success && success.length > 0){
                    success[0].LevelData = JSON.parse(success[0].LevelData)
                    createdResp = commonUtils.createResponse(STATUS.SUCCESS, success[0])
                }else{
                    createdResp = commonUtils.createResponse(STATUS.SUCCESS, success)
                }

                commonUtils.sendResponse(req, res, createdResp, next)
            }).catch(error =>{
                let createdResp = commonUtils.createResponse(STATUS.SUCCESS, levels)
                commonUtils.sendResponse(req, res, createdResp, next)
            })
        }).catch((error)=>{
            let createdResp = commonUtils.createResponse(STATUS.SUCCESS, error)
            commonUtils.sendResponse(req, res, createdResp, next)
        });
    }catch(error){
        let createdResp = commonUtils.createResponse(STATUS.SUCCESS, error)
        commonUtils.sendResponse(req, res, createdResp, next)
    }
} */

/* exports.updateHierarchyLevel = async function (req, res, next) {
    //console.log("UPDATE:",req.body)
    let levels = req.body
    try{
        successfullyUpdatedLevels = []
        failedUpdatedAllLevels = []
        Promise.map(levels, async function (source) {
            console.log("Update:",source.Name)
            if(source && source.Id){
                // let responseOfHlevels = await  source && source.Id ? updateHierarchylevels(req, res, next,source) : insertNewLevelToHierarchyLevels()
                let responseOfHlevels = await updateExistingHierarchylevels(source)
                console.log("responseOfHlevels:",responseOfHlevels)
                responseOfHlevels && responseOfHlevels.success === true ? successfullyUpdatedLevels.push(responseOfHlevels) : failedUpdatedAllLevels.push(responseOfHlevels)
                
            }else{
                let responseOfInsertionHlevels = await insertNewLevelToHierarchyLevels(source)
                console.log("Insertion of new level:",responseOfInsertionHlevels)
                responseOfInsertionHlevels && responseOfInsertionHlevels.success === true ? successfullyUpdatedLevels.push(responseOfInsertionHlevels) : failedUpdatedAllLevels.push(responseOfInsertionHlevels)
            }
            console.log("successfullyUpdatedLevels.length :",successfullyUpdatedLevels.length)
            console.log("failedUpdatedAllLevels.length :", failedUpdatedAllLevels.length)
            console.log("levels.length :",levels.length)
            if(levels.length == (successfullyUpdatedLevels.length + failedUpdatedAllLevels.length)){
                if(failedUpdatedAllLevels.length > 0){
                    let createdResp = commonUtils.createResponse(STATUS.ERROR.UPDATE_HIERARCHY_LEVEL,'',failedUpdatedAllLevels[0].response)
                    commonUtils.sendResponse(req, res, createdResp, next)
                }else{
                    models.New_Hierarchy_levels.findAll({}).then(function (success) {
                        let createdResp = commonUtils.createResponse(STATUS.SUCCESS, success)
                        commonUtils.sendResponse(req, res, createdResp, next)
                    }).catch(error =>{
                        let createdResp = commonUtils.createResponse(STATUS.SUCCESS, levels)
                        commonUtils.sendResponse(req, res, createdResp, next)
                    })
                }

            }
        })


    }catch{
        let createdResp = commonUtils.createResponse(STATUS.ERROR.UPDATE_HIERARCHY_LEVEL,'',STATUS.ERROR.DB_FETCH[1])
        commonUtils.sendResponse(req, res, createdResp, next)
    }
}

async function updateExistingHierarchylevels(source){
    return models.New_Hierarchy_levels.update({
            Name: source.Name,
            LevelType: source.LevelType,
            Image: source.Image,
        }, {
            where: {
                Id: source.Id
            }
    }).then( (success1)=> {
        console.log("Successful update");
        return {success: true, response:true}
    }).catch((error)=>{
        return {success: false, response:error}
    });
}

async function insertNewLevelToHierarchyLevels(source){
    return models.New_Hierarchy_levels.create(source).then((sucess)=>{
        console.log("Successful Create");
        return { success: true, response: sucess}
    }).catch(error =>{
        console.log("ERROR:",error)
        return { success: false, response: error}
    })
} */

/* exports.createHierarchyLevel = function (req, res, next) {
    //////////// WORKING CODE //////////////////////////
    //console.log("SAVE:",req.body)
    // let hierarchyLevels = req.body
    // try{
    //     models.New_Hierarchy_levels.bulkCreate(hierarchyLevels).then(function (success) {
    //         success.hierarchyLevels = success
    //         let createdResp = commonUtils.createResponse(STATUS.SUCCESS, success)
    //         commonUtils.sendResponse(req, res, createdResp, next)
    //     }).catch(err => {
    //         console.log(err)
    //         let createdResp = commonUtils.createResponse(STATUS.ERROR.CREATE_HIERARCHY_LEVEL,'',err)
    //         commonUtils.sendResponse(req, res, createdResp, next)
    //     });
    // }catch(error){
    //     console.log("Hierarchy level create: error:",error)
    //     let createdResp = commonUtils.createResponse(STATUS.ERROR.CREATE_HIERARCHY_LEVEL,'',error)
    //     commonUtils.sendResponse(req, res, createdResp, next)
    // }
    let levels = JSON.stringify(req.body);
    let json = {
        LevelData: levels
    }
    try{

        models.Very_New_Hierarchy_levels.create(json).then(function (success) {
            success.LevelData = JSON.parse(success.LevelData)
            let createdResp = commonUtils.createResponse(STATUS.SUCCESS, success)
            commonUtils.sendResponse(req, res, createdResp, next)
            // next(success);
        }).catch(err => {
            console.log(err)
            let createdResp = commonUtils.createResponse(STATUS.ERROR.CREATE_HIERARCHY_LEVEL,'',err)
            commonUtils.sendResponse(req, res, createdResp, next)
            // next({ status: STATUS.ERROR.CODE.ERR_CREATE_HIERARCHY_LEVEL,  message: err });
        });

    }catch{
        let createdResp = commonUtils.createResponse(STATUS.ERROR.CREATE_HIERARCHY_LEVEL,'',STATUS.ERROR.DB_FETCH[1])
        commonUtils.sendResponse(req, res, createdResp, next)
    }
} */


/* exports.getHierarchyLevel = function (req, res, next) {
    /////////////////// WORKING CODE //////////////////////////
    try{
        // models.New_Hierarchy_levels.findAll({}).then(function (success) {
        models.Very_New_Hierarchy_levels.findAll({}).then(function (success) {
            //console.log("DATA:", success)
            let response
            if(success && success.length > 0){
                success[0].LevelData = JSON.parse(success[0].LevelData)
                success.maxHierarchyLevels = AppConfig.maxHierarchyLevels
                response = {
                    maxHierarchyLevels: AppConfig.maxHierarchyLevels,
                    hierarchyLevels : success[0]
                }
            }else{
                response = {
                    maxHierarchyLevels: AppConfig.maxHierarchyLevels,
                    hierarchyLevels : []
                }
            }
            //console.log("success",response)
            let createdResp = commonUtils.createResponse(STATUS.SUCCESS, response)
            commonUtils.sendResponse(req, res, createdResp, next)     
            // next(success);

        }).catch(err => {
            console.log(err)
            let createdResp = commonUtils.createResponse(STATUS.ERROR.GET_HIERARCHY_LEVEL,'',err)
            commonUtils.sendResponse(req, res, createdResp, next)
            // next({ status: STATUS.ERROR.CODE.ERR_GET_HIERARCHY_LEVEL, message: err });
        });

    }catch(err){
        console.log("ERROR:",err)
        let createdResp = commonUtils.createResponse(STATUS.ERROR.GET_HIERARCHY_LEVEL,'',err)
        commonUtils.sendResponse(req, res, createdResp, next)
    }
} */


/* async function getAddtnlPropertiesWithNodeUid(nodeUid){
    try{
        return await models.AdditionalProperties.findAll({
            where :{
                NodeUid : nodeUid
            }
        }).then(addtnlProperties =>{
            if(addtnlProperties){
                return {success: true, data: addtnlProperties}
            }else{
                return {success: false, data: 'Not found with the requested ID'}
            }
          
        }).catch(err =>{
            return {success: false, data: err}
        })
    }catch(error){
        return {success: false, data: error}
    }
}

async function getAddtnlPropertyEmptyFields(req,res,next){
    let allAddtnlProperties = await getAllAddtionalPropertiesFromMaster()
    if(allAddtnlProperties.success == true){
        let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, allAddtnlProperties.data) 
        commonUtils.sendResponse(req, res, createdResp, next)
    }else{
        let createdResp = await commonUtils.createResponse(STATUS.ERROR.GET_ADDITIONAL_PROPERTIES,'', allAddtnlProperties.data)
        commonUtils.sendResponse(req, res, createdResp, next)
    }
} */

/* async function getAdditionalProperties(req,res,next){
    let nodeUid = req.params.id
    if(nodeUid) {  
        let addtnlProperties = await getAddtnlPropertiesWithNodeUid(nodeUid)
        if(addtnlProperties.success == true){
            let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, addtnlProperties.data) 
            commonUtils.sendResponse(req, res, createdResp, next)
        }else{
            let createdResp = await commonUtils.createResponse(STATUS.ERROR.GET_ADDITIONAL_PROPERTIES,'', addtnlProperties.data)
            commonUtils.sendResponse(req, res, createdResp, next)
        }
    }else{
        getAddtnlPropertyEmptyFields(req,res,next)
    }
    // if(nodeUid) {        
    //     let additionalPropertiesId = req.params.id
    //     console.log("Addtnl property id :",additionalPropertiesId)
    //     try{
    //         models.Additional_Properties.findAll({
    //             where: {
    //                 NodeID : additionalPropertiesId
    //             }
    //         }).then((addtnlProperty) =>{
    //             //console.log("Addtnl property id Resp:",addtnlProperty)
    //             let createdResp = commonUtils.createResponse(STATUS.SUCCESS, addtnlProperty) 
    //             commonUtils.sendResponse(req, res, createdResp, next)
    //         }).catch(async err => {
    //             let createdResp = commonUtils.createResponse(STATUS.ERROR.GET_ADDITIONAL_PROPERTIES,'', err)
    //             commonUtils.sendResponse(req, res, createdResp, next)
    //         });
    //     }catch (error){
    //         console.log("ERRORRR:",error)
    //         let createdResp = commonUtils.createResponse(STATUS.ERROR.GET_ADDITIONAL_PROPERTIES,'', error)
    //         commonUtils.sendResponse(req, res, createdResp, next)
    //     }
    // }else{
    //     let createdResp = commonUtils.createResponse(STATUS.ERROR.GET_ADDITIONAL_PROPERTIES,{message : "'Id' not found in request"})
    //     commonUtils.sendResponse(req, res, createdResp, next)
      
    // }

}

async function getAllAddtionalPropertiesFromMaster(){
    try{
        return models.Additional_Properties_Master.findAll({}).then((addtnlProperty) =>{
            //console.log("Addtnl property id Resp:",addtnlProperty)
            return {success: true, data: addtnlProperty}
        }).catch(async err => {
            return {success: false, data: err}
        });
    }catch (error){
        console.log("ERRORRR:",error)
        return {success: false, data: error}
    }
}

async function updateAdditionalProperties(req,res,next){
    if(req.body) {  
        let additionalPropertiesBody = req.body
        try{
            models.Additional_Properties.update({
                Value : additionalPropertiesBody.value,
                where: {
                    NodeID : additionalPropertiesBody.nodeId
                }
            }).then(async (success) =>{
                //console.log("Addtnl property id Resp:",addtnlProperty)
                let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, success) 
                commonUtils.sendResponse(req, res, createdResp, next)
            }).catch(async err => {
                let createdResp = await commonUtils.createResponse(STATUS.ERROR.GET_ADDITIONAL_PROPERTIES,'', err)
                commonUtils.sendResponse(req, res, createdResp, next)
            });
        }catch(error){
            let createdResp = await commonUtils.createResponse(STATUS.ERROR.GET_ADDITIONAL_PROPERTIES,'', error)
            commonUtils.sendResponse(req, res, createdResp, next)
        }
    }
} */

/* exports.read = function(req,res){   
    db.executeSql('SELECT * FROM Node',async function(data,err){
        if(err){
            await res.status(500).send(err);
        }else{
            await res.send(data.recordset);
        }
    })
    // try{
    //     let result = await db.executeSql('SELECT * FROM dbo.Node');
    //     console.log("coming to get the heirarchy:",result)
    //     res.send(result.recordset)
    // } catch (err){
    //     res.status(500).send(err.message);
    // }
} */

/* exports.add = function(req,res){
    console.log(req.body);  
    if(req.body){
        let sqlCmd = `INSERT INTO Node (NodeName, NodeShortName, ParentID, NodeType, MedNetID, MedNetSubNetMask, MetaCreatedDate,
            LastModifiedDate, CreatedBy, ModifiedBy, IsActive) VALUES ('${req.body.NodeName}','${req.body.NodeShortName}',
            ${req.body.ParentID},'${req.body.NodeType}',${req.body.MedNetID},'${req.body.MedNetSubNetMask}',
            '${req.body.MetaCreatedDate}','${req.body.LastModifiedDate}','${req.body.CreatedBy}','${req.body.ModifiedBy}',
            ${req.body.IsActive})`

            console.log("SQL:",sqlCmd)
        db.executeSql(sqlCmd,async function(result,err){
            if(err){
               await res.status(500).send(err.originalError.info.message);
             }else{
                await res.send(result);
             }
        })
    }
} */


module.exports = {
    getHierarchy : getHierarchy,
    saveToHierarchy : saveToHierarchy,
    nodeCreation : nodeCreation,
    createHierarchyNodesInBulk : createHierarchyNodesInBulk,
    updateHierarchyNodeToDB : updateHierarchyNodeToDB,
    deleteHierarchyNode : deleteHierarchyNode,
    addElementToHierarchyNode : addElementToHierarchyNode,
    getHierarchyNodeElement : getHierarchyNodeElement,
    updateHierarchyElementById : updateHierarchyElementById,
    deleteHierarchyElement : deleteHierarchyElement,
    getHierarchyLevel : getHierarchyLevel,
    createHierarchyLevel : createHierarchyLevel,
    updateHierarchyLevel : updateHierarchyLevel,
    getHierarchyTree : getHierarchyTree,
    getHierarchyTreeData : getHierarchyTreeData,
    updateparentId : updateparentId,
    // getAdditionalProperties : getAdditionalProperties,
    // updateAdditionalProperties : updateAdditionalProperties,
    checkAvailabilityOfEcRootNodeWithPortalCustomerID : checkAvailabilityOfEcRootNodeWithPortalCustomerID
}
