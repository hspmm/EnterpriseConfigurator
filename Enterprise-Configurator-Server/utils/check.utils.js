const _ = require('lodash')
var AppConfig = require('../config/app-config');

module.exports = {
    
    authentication : {
        checkRequiredFields : function(req,res,next){
            if(_.isEmpty(req.body)){
                return res.status(404).send({
                    message: "Body not found in request"
                })  
            }else if( !(_.isObject(req.body)) ){
                return res.status(500).send({
                    message: "Accepts only Object type in body"
                }) 
            }else if( !(_.has(req.body.userDetails,'userName')) ||  (req.body.userDetails.userName === "" || req.body.userDetails.userName === undefined) ){
                return res.status(500).send({
                    message: "'userName' is missing in the request or 'userName' has empty value"
                }) 
            }else if( !(_.has(req.body.userDetails,'password')) ||  (req.body.userDetails.password === "" || req.body.userDetails.password === undefined) ){
                return res.status(500).send({
                    message: "'password' is missing in the request or 'password' has empty value"
                }) 
            }
            /* else if( !(_.has(req.body,'authType')) ||  (req.body.userDetails.password === "" || req.body.userDetails.password === undefined) ){
                return res.status(500).send({
                    message: "'authType' is missing in the request or 'authType' has empty value"
                }) 
            } */
            next()
        },

        /* checkUserValidHeaders : function(req,res,next){
            if(_.isEmpty(req.body))
        } */
    },



    plugin : {
        checkPluginNameInHeaders : function(req,res,next){
            // console.log("HEADERS:",req.headers)
            if(!(req.headers.name)){
                // return next({status: 500, message: "'name' is missing in headers (Plugin Name)"})
                return res.status(500).send({
                    message: "'name' is missing in headers (Plugin Unique Name)"
                })
            }
            next()
        },

        checkPluginUidInParams : function(req,res,next){
            if(!req.params.uid){
                return next({status: 500, message: "'plugin id' not found in request"})
            }
            next()
        },

        checkPluginServicesEnableDisableBody : async function(req,res,next){
            // console.log(((req.body.uniqueName).toLowerCase()))
            // console.log((AppConfig.securityApp).toLowerCase())
            // console.log(typeof ((req.body.uniqueName).toLowerCase() ))
            // console.log(typeof ((req.body.uniqueName).toLowerCase() ))
            if(_.isEmpty(req.body)){
                return res.status(500).send({
                    message: "Body not found in request"
                })  
            }else if( _.size(req.body) != 3 ){
                return res.status(500).send({
                    message: "Accepted parameters('uid', 'serviceEnabled', 'uniqueName') not found in request"
                })  
            }else if( !(_.has(req.body,'uid')) || !(_.has(req.body,'serviceEnabled')) || !(_.has(req.body,'uniqueName')) ){
                return res.status(500).send({
                    message: "Required parameters('uid', 'serviceEnabled', 'uniqueName') not found in request"
                }) 
            }else if( _.has(req.body,'uid') || _.has(req.body,'serviceEnabled') || _.has(req.body,'uniqueName') ){
                if( (req.body.uid === undefined) || (req.body.uid === null) || (req.body.uid === "") || ((typeof req.body.uid).toLowerCase() !== 'string')){
                    return res.status(500).send({
                        message: "value of uid found empty or value should be in string"
                    })
                }
                if( (req.body.serviceEnabled === undefined) || (req.body.serviceEnabled === null) || ((typeof req.body.serviceEnabled).toLowerCase() !== 'boolean') ){
                    return res.status(500).send({
                        message: "value of serviceEnabled found empty or value should be in boolean"
                    })
                }
                if( (req.body.uniqueName === undefined) || (req.body.uniqueName === null) || (req.body.uniqueName === "") || ((typeof req.body.uniqueName).toLowerCase() !== 'string') || ((req.body.uniqueName).toLowerCase() === (AppConfig.securityApp).toLowerCase())){
                    return res.status(500).send({
                        message: "value of uniqueName found empty or value should be in string or the uniqueName which you are trying to update their services is not allowed to update"
                    })
                }
            }
            
            next()
        }
    },


    hierarchy : {
        checkBodyOfDeleteHierarchyNode : function(req,res,next){
            // console.log("req.params:",req.params.uid)
            // console.log("req.params:",_.has(req.params.uid))
            if( !(req.params.uid) ){
                return res.status(500).send({
                    message: "'uid' is missing in the request"
                })
            }
            next()
        },

        checkBodyOfHierarchyNodeCreation : function(req,res,next){
            // console.log("BODY:",req.body)
            if(_.isEmpty(req.body)){
                return res.status(500).send({
                    message: "Body not found in request"
                })  
            }else if( !(_.isEmpty(req.body)) ){
                let missingField = []
                _.forEach(req.body, function(value, key) {
                  
                    if( (_.camelCase(key) === 'nodeName') || (_.camelCase(key) === 'nodeShortName') || (_.camelCase(key) === 'nodeType') ||
                     (_.camelCase(key) === 'typeOf') || (_.camelCase(key) === 'pluginId') || (_.camelCase(key) === 'parentId')
                     || (_.camelCase(key) === 'nodeInfo') || (_.camelCase(key) === 'isActive') ){
                        missingField.push(_.camelCase(key))
                    }
                });
                // console.log("MISSING KEY :",missingField)

                if(missingField.length === 8){
                    if(req.body.typeOf.length > 20 && req.body.typeOf != 'enterprise-configurator'){
                        return res.status(500).send({
                            message: "Doesn't allow to add wrong info in 'typeOf'"
                        })
                    }else if((req.body.typeOf.length <= 2) && ((typeof req.body.typeOf).toLowerCase() != 'number')){
                        return res.status(500).send({
                            message: "'typeOf' should be in integer format"
                        })
                    }
                    next()
                }else if(missingField.length < 8){
                    return res.status(500).send({
                        message: "Required fields are missing in the request"
                    })
                }
            }
            
        },

        checkHierarchyNodeUpdate : function(req,res,next){
            if(_.isEmpty(req.body)){
                return res.status(500).send({
                    message: "Body not found in request"
                })  
            }else if( _.size(req.body) > 6){
                return res.status(500).send({
                    message: "Accepted parameters('uid', 'nodeType', 'typeOf', 'nodeName', 'nodeInfo') not found in request"
                })  
            }else if( !(_.has(req.body,'uid')) || !(_.has(req.body,'nodeType')) || !(_.has(req.body,'nodeName')) || !(_.has(req.body,'nodeInfo')) || !(_.has(req.body,'typeOf')) ){
                return res.status(500).send({
                    message: "Required parameters('uid', 'nodeType', 'typeOf', 'nodeName', 'nodeInfo') not found in request"
                }) 
            }else if( (req.body.uid === undefined) || (req.body.uid === null) || (req.body.uid === "") ){
                return res.status(500).send({
                    message: "value of 'uid' found empty"
                })
            }else
                if( (req.body.nodeType === undefined) || (req.body.nodeType === null) || (req.body.nodeType === "") ){
                    return res.status(500).send({
                        message: "value of 'nodeType' found empty"
                    })
                }else
                if( (req.body.nodeName === undefined) || (req.body.nodeName === null) || (req.body.nodeName === "")){
                    return res.status(500).send({
                        message: "value of 'nodeName' found empty"
                    })
                }else
                if( (req.body.nodeInfo === undefined) || (req.body.nodeInfo === null) || (req.body.nodeInfo === "") || (_.toLower(req.body.nodeInfo) === 'null')){
                    return res.status(500).send({
                        message: "value of 'nodeInfo' in the request found empty or in a wrong datatype format"
                    })
                }else
                if( (req.body.typeOf === undefined) || (req.body.typeOf === null) || (req.body.typeOf === "")){
                    return res.status(500).send({
                        message: "value of 'typeOf' in the request found empty"
                    })
                }else if(req.body.typeOf.length > 23){
                    return res.status(500).send({
                        message: "Doesn't allow to add wrong info in 'typeOf'"
                    })
                }
                /* else if((req.body.typeOf.length <= 2) && ((typeof req.body.typeOf).toLowerCase() != 'number')){
                    return res.status(500).send({
                        message: "'typeOf' should be in integer format"
                    })
                } */
               

            next()
        },

        checkBodyOfAddElement : function(req,res,next){
            // console.log(_.size(req.body))
            if(_.isEmpty(req.body)){
                return res.status(500).send({
                    message: "Body not found in request"
                })  
            }else if ( _.size(req.body) > 3 ) {
                return res.status(500).send({
                    message: "Request accepts only 3 parameters in the body"
                })
            }else if( !(_.has(req.body,'name')) ||  (req.body.name === "" || req.body.name === undefined)){
                return res.status(500).send({
                    message: "'name' is missing in the request or 'name' has empty value"
                }) 
            }else if( !(_.has(req.body,'id')) ) {
                return res.status(500).send({
                    message: "'id' is missing in the request"
                })
            }else if( !(_.isArray(req.body.id)) ){
                return res.status(500).send({
                    message: "'id' should have to be in Array or 'id' is having an empty array"
                })
            }else if (req.body.id.length < 1){
                return res.status(500).send({
                    message: "'id' is having an empty array"
                })
            }else if( !(_.has(req.body,'name')) && !(_.has(req.body,'id')) ){
                return res.status(500).send({
                    message: "'name' & 'Id' is missing in the request"
                })
            }
            next()
        },

        checkIdInParamsOfGetElement : function(req,res,next){
            if(!req.params.uid){
                return next({status: 500, message: "'uid' not found in request"})
            }
            next()
        },

        checkBodyOfRemoveElement : async function(req, res, next){
            if( _.isEmpty(req.body)){
                return res.status(500).send({
                    message: "Body not found in request"
                })  
            }else if( !(_.has(req.body, 'id')) ){
                return res.status(500).send({
                    message: "id not found in request"
                })  
            }else if( !(_.isArray(req.body.id)) || _.isEmpty(req.body.id) ){
                return res.status(500).send({
                    message: "'id' should have to be in Array or 'id' is having an empty array"
                })
            }
            next()
        },

        checkCreateHierarchyLevels : async function(req,res,next){
            if( _.isEmpty(req.body)){
                return res.status(500).send({
                    message: "Body not found in request"
                })  
            }else if(!(_.isArray(req.body))){
                return res.status(500).send({
                    message: "Body should have to be in array"
                })  
            }else{
                let body = req.body, acceptedBody = [], count = 0
               for(let i=0;i<body.length;i++){
                   let acceptedKeys = []
                   for(let key in body[i]){
                       if(_.toLower(key) == 'name' || _.toLower(key) == 'leveltype' || _.toLower(key) == 'image' || _.toLower(key) == 'facilitytype'){
                        acceptedKeys.push(_.toLower(key))
                       }
                   }
                   if(acceptedKeys.length >= 4){
                    acceptedBody.push(i)
                   }
                   count = count + 1
                   if(count == body.length){
                       if(acceptedBody.length == body.length){
                           next()
                       }else{
                        return res.status(500).send({
                            message: "Required fields are missing ('name','LevelType','image',facilityType)"
                        })
                       }
                   }
               }
            }
        },
        checkUpdateHierarchyLevels : async function(req,res,next){
            if( _.isEmpty(req.body)){
                return res.status(500).send({
                    message: "Body not found in request"
                })  
            }else{
                let acceptedFirstKeys = []
                _.forEach(req.body,(value,key)=>{
                    if(_.toLower(key) == 'id' || _.toLower(key) == 'levels'){
                        acceptedFirstKeys.push(_.toLower(key))
                    }
                })
                if(acceptedFirstKeys.length >= 2){
                    let acceptedBody = [], count = 0
                    let body = req.body.levels ? req.body.levels : req.body.Levels ? req.body.Levels : []
                    for(let i=0;i<body.length;i++){
                        let acceptedKeys = []
                        for(let key in body[i]){
                            if(_.toLower(key) == 'name' || _.toLower(key) == 'leveltype' || _.toLower(key) == 'image' || _.toLower(key) == 'facilitytype'){
                             acceptedKeys.push(_.toLower(key))
                            }
                        }
                        if(acceptedKeys.length >= 4){
                         acceptedBody.push(i)
                        }
                        count = count + 1
                        if(count == body.length){
                            if(acceptedBody.length == body.length){
                                next()
                            }else{
                             return res.status(500).send({
                                 message: "Required fields are missing ('name','LevelType','image',facilityType)"
                             })
                            }
                        }
                    }
                }else{
                    return res.status(500).send({
                        message: "Required fields are missing ('id','levels')"
                    })
                }
            }
        }


    },

    facility : {
        checkFacilityImportBody: async function(req,res,next){
            if(_.isEmpty(req.body)){
                return res.status(500).send({
                    message: "Body not found in request"
                }) 
            }else if(!(_.isArray(req.body))){
                return res.status(500).send({
                    message: "Body should be in array of json with required fields of facility"
                }) 
            }
            next()
        },
        checkRequiredFieldsInBody : function(req,res,next){
            // console.log("BODY:",req.body)
            if(_.isEmpty(req.body)){
                return res.status(500).send({
                    message: "Body not found in request"
                })  
            }else if( !(_.isEmpty(req.body)) ){
                let missingField = []
                _.forEach(req.body, function(value, key) {
                  
                    if( (_.lowerCase(key) == 'id') || (_.lowerCase(key) == 'type') || (_.lowerCase(key) == 'facilities') ){
                        missingField.push(_.camelCase(key))
                    }
                });

                if(missingField.length == 3){
                    next()
                }else if(missingField.length < 4){
                    return res.status(500).send({
                        message: "Required fields('id' or 'type' or 'facilities') are missing in the request"
                    })
                }
            }
            
        }
    }
}