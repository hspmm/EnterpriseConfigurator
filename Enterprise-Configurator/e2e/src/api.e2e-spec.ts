import { browser, element, by, ExpectedConditions, Key} from 'protractor';
import { __values } from 'tslib';
import { protractor } from 'protractor/built/ptor';
import {URL, Token} from './ec-url';
var Request = require("request");

describe('OQ.ECCORE.003  API Testing of enterprise configurator', () => {
  var originalTimeout;
  browser.ignoreSynchronization = true; // for non-angular websites
  beforeEach(() => {
      originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000000;
  });
  afterEach(function() {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

  it("TID-API-001-001 Api testing for user login",async(done)=>{
      await Request.post({
          "headers": { 
            "content-type": "application/json",
            "Accept":"application/json"
          },
          "url": URL.VM_URL+"/api/v1/user/login",
          
          "body": JSON.stringify({
              "userDetails":
              {
                  "userName":"Admin",
                  "password":"Icumed@1"
                 
              },
            "authType":"User"
          })
          }, (error, response, body) => {
            if(error) {
                return console.log("error in api",error);
            }
            console.log("\n\nResponse Code ****:"+response.statusCode)
            expect(response.statusCode).toBe(200)
            done();
        })
    })

    it("TID-API-001-002 API Testing for User login by invalid username and valid password ",async(done)=>{
      await Request.post({
          "headers": { 
            "content-type": "application/json",
            "Accept":"application/json"
          },
          "url": URL.VM_URL+"/api/v1/user/login",
          "body": JSON.stringify({
              "userDetails":
              {
                  "userName":"sarita",
                  "password":"Icumed@1"
                 
              },
            "authType":"User"
          })
          }, (error, response, body) => {
            if(error) {
                return console.log("error in api",error);
            }
            console.log("\n\nResponse Code ****:"+response.statusCode)
            expect(response.statusCode).toBe(401)
            done();
        })
    })

    it("TID-API-001-003 API Testing for User login by valid username and invalid password",async(done)=>{
      await Request.post({
          "headers": { 
            "content-type": "application/json",
            "Accept":"application/json"
          },
          "url": URL.VM_URL+"/api/v1/user/login",
          "body": JSON.stringify({
              "userDetails":
              {
                  "userName":"Admin",
                  "password":"sarita"
                 
              },
            "authType":"User"
          })
          }, (error, response, body) => {
            if(error) {
                return console.log("error in api",error);
            }
            console.log("\n\nResponse Code ****:"+response.statusCode)
            expect(response.statusCode).toBe(401)
            done();
        })
    })
    
  it("TID-API-001-004 API Testing for User login by empty username and valid password",function(done){
      Request.post({
          "headers": { 
              "content-type": "application/json",
              "Accept":"application/json",
              // "Accesstoken":Token.Accesstoken
            },
          "url": URL.VM_URL+"/api/v1/user/login",
          "body": JSON.stringify({
              "userDetails":
              {
                  "userName":" ",
                  "password":"Icumed@1"
                 
              },
                  "authType":"User"
           })
          }, (error, response) => {
            if(error) {
                return console.dir(error);
            }
            console.log("\n\nResponse Code ****:"+response.statusCode)
            expect(response.statusCode).toBe(401)
            //console.dir(response.body);
            done();
        })
    });

    it("TID-API-001-005 API Testing for User login by valid username and empty password",function(done){
      Request.post({
          "headers": { 
              "content-type": "application/json",
              "Accept":"application/json",
              // "Accesstoken":Token.Accesstoken
            },
          "url": URL.VM_URL+"/api/v1/user/login",
          "body": JSON.stringify({
              "userDetails":
              {
                  "userName":"esadmin12",
                  "password":""
                 
              },
                  "authType":"User"
           })
          }, (error, response) => {
            if(error) {
                return console.dir(error);
            }
            console.log("\n\nResponse Code ****:"+response.statusCode)
            expect(response.statusCode).toBe(500)
            //console.dir(response.body);
            done();
        })
    });

    it("TID-API-001-006 API Testing for User login by invalid username and invalid password",function(done){
      Request.post({
          "headers": { 
              "content-type": "application/json",
              "Accept":"application/json",
              // "Accesstoken":Token.Accesstoken
            },
          "url": URL.VM_URL+"/api/v1/user/login",
          "body": JSON.stringify({
              "userDetails":
              {
                  "userName":"sarita",
                  "password":"sarita"
                 
              },
                  "authType":"User"
           })
          }, (error, response) => {
            if(error) {
                return console.dir(error);
            }
            console.log("\n\nResponse Code ****:"+response.statusCode)
            expect(response.statusCode).toBe(401)
            //console.dir(response.body);
            done();
        })
    });

    it("TID-API-001-007 API Testing for User login by empty username and empty password",function(done){
      Request.post({
          "headers": { 
              "content-type": "application/json",
              "Accept":"application/json",
              // "Accesstoken":Token.Accesstoken
            },
          "url": URL.VM_URL+"/api/v1/user/login",
          "body": JSON.stringify({
              "userDetails":
              {
                  "userName":"",
                  "password":""
                 
              },
                  "authType":"User"
           })
          }, (error, response) => {
            if(error) {
                return console.dir(error);
            }
            console.log("\n\nResponse Code ****:"+response.statusCode)
            expect(response.statusCode).toBe(500)
            //console.dir(response.body);
            done();
        })
    });

  it("TID-API-002 Api testing for to check the access token is valid or not",function(done){
      Request.get({
          "headers": { 
            "content-type": "application/xml" ,
            "Accept":"application/json",
            "Accesstoken":Token.Accesstoken
            //"Accesstoken":"Z-pUYL0SpitW909JF8_NLSZwj_VauFsJ"
          },
          "url": URL.VM_URL+"/api/v1/user/valid"
          }, (error, response, body) => {
            if(error) {
                return console.log("error in api",error);
            }
            console.log("\n\nResponse Code ****:"+response.statusCode)
            expect(response.statusCode).toBe(200)
            done();
        })
  });

  it("TID-API-003 Api testing for get registered plugins",function(done){
      Request.get({
          "headers": { 
            "content-type": "application/xml" ,
            "Accept":"application/json",
            "Accesstoken":Token.Accesstoken
            //"Accesstoken":"Z-pUYL0SpitW909JF8_NLSZwj_VauFsJ"
          },
          "url": URL.VM_URL+"/api/v1/plugins/detect"
          }, (error, response, body) => {
            if(error) {
                return console.log("error in api",error);
            }
            console.log("\n\nResponse Code ****:"+response.statusCode)
            expect(response.statusCode).toBe(200)
            done();
        })
    })

    it("TID-API-004 Api testing for Restart all the plugin services",function(done){
      Request.get({
          "headers": { 
            "content-type": "application/xml" ,
            "Accept":"application/json",
            "Accesstoken":Token.Accesstoken
            //"Accesstoken":"Z-pUYL0SpitW909JF8_NLSZwj_VauFsJ"
          },
          "url": URL.VM_URL+"/api/v1/plugins/services/restart/all "
          }, (error, response, body) => {
            if(error) {
                return console.log("error in api",error);
            }
            console.log("\n\nResponse Code ****:"+response.statusCode)
            expect(response.statusCode).toBe(200)
            done();
        })
    })

    it("TID-API-005 Api testing for Restart individual plugin services",function(done){
      Request.get({
          "headers": { 
            "content-type": "application/xml",
            "Accept":"application/json",
            "Accesstoken":Token.Accesstoken
            //"Accesstoken":"Z-pUYL0SpitW909JF8_NLSZwj_VauFsJ"
          },
          "url": URL.VM_URL+"/api/v1/plugins/services/restart/90f96bb0-9532-11ea-aa4f-c36bc0ccf3fc"
          }, (error, response, body) => {
            if(error) {
                return console.log("error in api",error);
            }
            console.log("\n\nResponse Code ****:"+response.statusCode)
            expect(response.statusCode).toBe(200)
            done();
        })
    })

    it("TID-API-006 Api testing for update plugins services either enable/disable",function(done){
      Request.put({
          "headers": { 
            "content-type": "application/json",
            "Accept":"application/json",
            "Accesstoken":Token.Accesstoken
            //"Accesstoken":"Z-pUYL0SpitW909JF8_NLSZwj_VauFsJ"
          },
          "url": URL.VM_URL+"/api/v1/plugins/services/activate",
          "body": JSON.stringify({
                 "uid" : "90e1c500-9532-11ea-aa4f-c36bc0ccf3fc",
                  "serviceEnabled" : true,
                  "uniqueName" : "licensemanager"
             
           })
          }, (error, response, body) => {
            if(error) {
                return console.log("error in api",error);
            }
            console.log("\n\nResponse Code ****:"+response.statusCode)
            expect(response.statusCode).toBe(200)
            done();
        })
    })

    it("TID-API-007 API Testing for get specific registered plugins by correct uid",function(done){
      Request.get({
          "headers": { 
            "content-type": "application/xml",
            "Accept":"application/json",
            "Accesstoken":Token.Accesstoken
            //"Accesstoken":"Z-pUYL0SpitW909JF8_NLSZwj_VauFsJ"
          },
          "url": URL.VM_URL+"/api/v1/plugins/90e1c500-9532-11ea-aa4f-c36bc0ccf3fc"
          }, (error, response, body) => {
            if(error) {
                return console.log("error in api",error);
            }
            console.log("\n\nResponse Code ****:"+response.statusCode)
            expect(response.statusCode).toBe(200)
            done();
        })
    })

    
    it("TID-API-008 API Testing for get specific registered plugins by incorrect uid",function(done){
      Request.get({
          "headers": { 
            "content-type": "application/xml",
            "Accept":"application/json",
            "Accesstoken":Token.Accesstoken
            //"Accesstoken":"Z-pUYL0SpitW909JF8_NLSZwj_VauFsJ"
          },
          "url": URL.VM_URL+"/api/v1/plugins/4f153d10-8519-11ea-90ed-03bacd80124"
          }, (error, response, body) => {
            if(error) {
                return console.log("error in api",error);
            }
            console.log("\n\nResponse Code ****:"+response.statusCode)
            expect(response.statusCode).toBe(200)
            done();
        })
    })

    it("TID-API-009 Api testing for get flat nodes of hierarchy list",function(done){
        Request.get({
            "headers": { 
              "content-type": "application/xml",
              "Accept":"application/json",
              "Accesstoken":Token.Accesstoken
              //"Accesstoken":"Z-pUYL0SpitW909JF8_NLSZwj_VauFsJ"
            },
            "url": URL.VM_URL+"/api/v1/hierarchy"
            }, (error, response, body) => {
              if(error) {
                  return console.log("error in api",error);
              }
              console.log("\n\nResponse Code ****:"+response.statusCode)
              expect(response.statusCode).toBe(200)
              done();
          })
      })

      it("TID-API-010 Api testing for get add hierarchy nodes to hierarchy tree with facilityID when doing mapping the facilities to tree  with correct param",function(done){
        Request.post({
            "headers": { 
              "content-type": "application/json",
              "Accept":"application/json",
              "Accesstoken":Token.Accesstoken
              //"Accesstoken":"Z-pUYL0SpitW909JF8_NLSZwj_VauFsJ"
            },
            "url": URL.VM_URL+"/api/v1/hierarchy/node/add/bulk",
            "body": JSON.stringify({
                "facilityId" : "87e2ca20-7990-11ea-b5bb-330c2568a53e",
                "hierarchyNodes" :[
                 {
                            "nodeName" : "TEST SERVICE",
                            "nodeShortName" : "TEST SERVICE",
                            "nodeType" : "application",
                            "typeOf" : "sample",
                            "pluginId" : "092e24a0-5ed7-11ea-ae5c-6d2afbbba6be",
                            "parentId" : 1,
                            "nodeInfo" : null,
                            "isActive" : "true"
                     },
                     
                     {
                             "nodeName" : "TEST SERVICE",
                            "nodeShortName" : "TEST SERVICE",
                            "nodeType" : "application",
                            "typeOf" : "sample",
                            "pluginId" : "092e24a0-5ed7-11ea-ae5c-6d2afbbba6be",
                            "parentId" : 1,
                            "nodeInfo" : null,
                            "isActive" : "true"
                     }
                ]
             })
            }, (error, response, body) => {
              if(error) {
                  return console.log("error in api",error);
              }
              console.log("\n\nResponse Code ****:"+response.statusCode)
              expect(response.statusCode).toBe(200)
              done();
          })
      })

      it("TID-API-011 API Testing for add hierarchy nodes to hierarchy tree with facilityID when doing mapping the facilities to tree with incorrect param",function(done){
        Request.post({
            "headers": { 
              "content-type": "application/json",
              "Accept":"application/json",
              "Accesstoken":Token.Accesstoken
              //"Accesstoken":"Z-pUYL0SpitW909JF8_NLSZwj_VauFsJ"
            },
            "url": URL.VM_URL+"/api/v1/hierarchy/node/add/bulk",
            "body": JSON.stringify({
                "facilityId" : "87e2ca20-7990-11ea-b5bb-330c2568a53e",
                "hierarchyNodes" :[
                 {
                            "nodeNameqwe" : "TEST SERVICE",
                            "nodeShortName" : "TEST SERVICE",
                            "nodeType" : "application",
                            "typeOf" : "sample",
                            "pluginId" : "092e24a0-5ed7-11ea-ae5c-6d2afbbba6be",
                            "parentId" : 1,
                            "nodeInfo" : null,
                            "isActive" : "true"
                     },
                     
                     {
                             "nodeName" : "TEST SERVICE",
                            "nodeShortName" : "TEST SERVICE",
                            "nodeType" : "application",
                            "typeOf" : "sample",
                            "pluginId" : "092e24a0-5ed7-11ea-ae5c-6d2afbbba6be",
                            "parentId" : 1,
                            "nodeInfo" : null,
                            "isActive" : "true"
                     }
                ]
             })
            }, (error, response, body) => {
              if(error) {
                  return console.log("error in api",error);
              }
              console.log("\n\nResponse Code ****:"+response.statusCode)
              expect(response.statusCode).toBe(500)
              done();
          })
      })

      it("TID-API-012 API Testing for add hierarchy nodes to hierarchy tree with facilityID when doing mapping the facilities to tree with incorrect facilityId",function(done){
        Request.post({
            "headers": { 
              "content-type": "application/json",
              "Accept":"application/json",
              "Accesstoken":Token.Accesstoken
              //"Accesstoken":"Z-pUYL0SpitW909JF8_NLSZwj_VauFsJ"
            },
            "url": URL.VM_URL+"/api/v1/hierarchy/node/add/bulk",
            "body": JSON.stringify({
                "facilityId" : "812345",
                "hierarchyNodes" :[
                 {
                            "nodeNameqwe" : "TEST SERVICE",
                            "nodeShortName" : "TEST SERVICE",
                            "nodeType" : "application",
                            "typeOf" : "sample",
                            "pluginId" : "092e24a0-5ed7-11ea-ae5c-6d2afbbba6be",
                            "parentId" : 1,
                            "nodeInfo" : null,
                            "isActive" : "true"
                     },
                     
                     {
                             "nodeName" : "TEST SERVICE",
                            "nodeShortName" : "TEST SERVICE",
                            "nodeType" : "application",
                            "typeOf" : "sample",
                            "pluginId" : "092e24a0-5ed7-11ea-ae5c-6d2afbbba6be",
                            "parentId" : 1,
                            "nodeInfo" : null,
                            "isActive" : "true"
                     }
                ]
             })
            }, (error, response, body) => {
              if(error) {
                  return console.log("error in api",error);
              }
              console.log("\n\nResponse Code ****:"+response.statusCode)
              expect(response.statusCode).toBe(500)
              done();
          })
      })
     
   
    it("TID-API-013 Api testing for add the node to hierarchy list with correct json format",function(done){
      Request.post({
          "headers": { 
            "content-type": "application/json",
            "Accept":"application/json",
            "Accesstoken":Token.Accesstoken
            //"Accesstoken":"Z-pUYL0SpitW909JF8_NLSZwj_VauFsJ"
          },
          "url": URL.VM_URL+"/api/v1/hierarchy/node/add",
          "body": JSON.stringify({
              "nodeName" : "TEST SERVICE",
              "nodeShortName" : "TEST SERVICE",
              "nodeType" : "application",
              "typeOf" : "sample",
              "pluginId" : "092e24a0-5ed7-11ea-ae5c-6d2afbbba6be",
              "parentId" : 1,
              "nodeInfo" : null,
              "isActive" : "true"
          })
          }, (error, response, body) => {
            if(error) {
                return console.log("error in api",error);
            }
            console.log("\n\nResponse Code ****:"+response.statusCode)
            expect(response.statusCode).toBe(200)
            done();
        })
    })

    it("TID-API-014 Api testing for add the node to hierarchy list with incorrect json format",function(done){
      Request.post({
          "headers": { 
            "content-type": "application/json",
            "Accept":"application/json",
            "Accesstoken":Token.Accesstoken
            //"Accesstoken":"Z-pUYL0SpitW909JF8_NLSZwj_VauFsJ"
          },
          "url": URL.VM_URL+"/api/v1/hierarchy/node/add",
          "body": JSON.stringify({
              "nodeName1" : "TEST SERVICE",
              "nodeShortName" : "TEST SERVICE",
              "nodeType" : "application",
              "typeOf" : "sample",
              "pluginId" : "092e24a0-5ed7-11ea-ae5c-6d2afbbba6be",
              "parentId" : 1,
              "nodeInfo" : null,
              "isActive" : "true"
          })
          }, (error, response, body) => {
            if(error) {
                return console.log("error in api",error);
            }
            console.log("\n\nResponse Code ****:"+response.statusCode)
            expect(response.statusCode).toBe(500)
            done();
        })
    })

    it("TID-API-015 Api testing for update the node in hierarchy list with node ID",function(done){
      Request.put({
          "headers": { 
            "content-type": "application/json",
            "Accept":"application/json",
            "Accesstoken":Token.Accesstoken
            //"Accesstoken":"Z-pUYL0SpitW909JF8_NLSZwj_VauFsJ"
          },
          "url": URL.VM_URL+"/api/v1/hierarchy/node/update",
          "body": JSON.stringify({
              "uid" : "fd10c7c0-636a-11ea-8a4c-cfb3636c84de",
              "nodeName" : "Kaiser Permanente",
              "nodeType" : "enterprise-hierarchy",
              "typeOf" : 1,
              "nodeInfo" : {"Name":"Region 1","Notes":"","AllowIndependentMeds":false},
              "NodeShortName": "Kaiser Permanente"
          })
          }, (error, response, body) => {
            if(error) {
                return console.log("error in api",error);
            }
            console.log("\n\nResponse Code ****:"+response.statusCode)
            expect(response.statusCode).toBe(200)
            done();
        })
    })

  it("TID-API-016 Api testing for update the node in hierarchy list with incorrect node ID",function(done){
      Request.put({
          "headers": { 
            "content-type": "application/json",
            "Accept":"application/json",
            "Accesstoken":Token.Accesstoken
            //"Accesstoken":"Z-pUYL0SpitW909JF8_NLSZwj_VauFsJ"
          },
          "url": URL.VM_URL+"/api/v1/hierarchy/node/update",
          "body": JSON.stringify({
              "uidw" : "",
              "nodeName" : "Kaiser Permanente",
              "nodeType" : "enterprise-hierarchy",
              "typeOf" : 1,
              "nodeInfo" : {"Name":"Region 1","Notes":"","AllowIndependentMeds":false},
              "NodeShortName": "Kaiser Permanente"
          })
          }, (error, response, body) => {
            if(error) {
                return console.log("error in api",error);
            }
            console.log("\n\nResponse Code ****:"+response.statusCode)
            expect(response.statusCode).toBe(500)
            done();
        })
    })

  it("TID-API-017 Api testing for delete node from hierarchy list  with node ID",function(done){
      Request.delete({
        "headers": { 
            "content-type": "application/json" ,
            "Accept":"application/json",
            "Accesstoken":Token.Accesstoken
        },
        "url": URL.VM_URL+"/api/v1/hierarchy/node/delete/04b19220-95ca-11ea-b6c3-47184b231f6b"
        }, (error, response, body) => {
          if(error) {
              return console.log("error in api",error);
          }
          console.log("\n\nResponse Code ****:"+response.statusCode)
          expect(response.statusCode).toBe(200)
          done();
      })
    });
  
  it("TID-API-018 Api testing for delete node from hierarchy list with incorrect node ID",function(done){
      Request.delete({
        "headers": { 
            "content-type": "application/json" ,
            "Accept":"application/json",
            "Accesstoken":Token.Accesstoken
        },
        "url": URL.VM_URL+"/api/v1/hierarchy/node/delete/1c3bc4a0-845f-11ea-98d5"
        }, (error, response, body) => {
          if(error) {
              return console.log("error in api",error);
          }
          console.log("\n\nResponse Code ****:"+response.statusCode)
          expect(response.statusCode).toBe(500)
          done();
      })
    });

  it("TID-API-019 api Testing for while adding the plugin in to EC hierarchy tree, plugin should have to send this data to EC with plugin unique name",function(done){
      Request.post({
          
          "headers": { 
              "content-type": "application/json" ,
              "Accept":"application/json",
              "name":"ISAS",
              "AccessToken":Token.Accesstoken
            },
          "url": URL.VM_URL+"/api/v1/hierarchy/node/element/add",
          "body": JSON.stringify({
               "name": "testing node",
               "id":["04b19220-95ca-11ea-b6c3-47184b231f6b"]
          })
          }, (error, response) => {
            if(error) {
                return console.dir(error);
            }
            console.log("\n\nResponse Code ****:"+response.statusCode)
            expect(response.statusCode).toBe(200)
            //console.dir(response.body);
            done();
        })
   });

  it("TID-API-020 api Testing for while adding the plugin in to EC hierarchy tree, plugin should have to send this data to EC plugin name is not unique",function(done){
      Request.post({
          
          "headers": { 
              "content-type": "application/json" ,
              "Accept":"application/json",
              "name":"DWH",
              "AccessToken":Token.Accesstoken
            },
          "url": URL.VM_URL+"/api/v1/hierarchy/node/element/add",
          "body": JSON.stringify({
               "name": "facility1",
               "id":["bd7ffad0-8df0-11ea-954c-1be1ed867479"]
          })
          }, (error, response) => {
            if(error) {
                return console.dir(error);
            }
            console.log("\n\nResponse Code ****:"+response.statusCode)
            expect(response.statusCode).toBe(500)
            //console.dir(response.body);
            done();
        })
   });

  it("TID-API-021 api Testing for update the element data in the EC from the plugin side with existing node UID ",function(done){
      Request.put({
          "headers": { 
              "content-type": "application/json" ,
              "Accept":"application/json",
              "name":"ISAS",
              "Accesstoken":Token.Accesstoken
            },
          "url": URL.VM_URL+"/api/v1/hierarchy/node/element/update",
          "body": JSON.stringify({
              "name": "region1",
              "id":["f52917d0-95bd-11ea-a8fc-b91685b81b4b"]
           })
          }, (error, response) => {
            if(error) {
                return console.dir(error);
            }
            console.log("\n\nResponse Code ****:"+response.statusCode)
            expect(response.statusCode).toBe(200)
            //console.dir(response.body);
            done();
        })
  });

  it("TID-API-022 api Testing for update the element data in the EC from the plugin side when node UID is not exists ",function(done){
      Request.put({
          "headers": { 
              "content-type": "application/json" ,
              "Accept":"application/json",
              "name":"ISAS",
              "Accesstoken":Token.Accesstoken
            },
          "url": URL.VM_URL+"/api/v1/hierarchy/node/element/update",
          "body": JSON.stringify({
              "name": "testing node",
              "id":["04b19220-95ca"]
           })
          }, (error, response) => {
            if(error) {
                return console.dir(error);
            }
            console.log("\n\nResponse Code ****:"+response.statusCode)
            expect(response.statusCode).toBe(500)
            //console.dir(response.body);
            done();
        })
  });

  it("TID-API-023 Api testing for get the plugin node data from the hierarchy tree, when user clicks on the plugin node in tree, the plugin should have to call the api to EC with pass the node UID",function(done){
      Request.get({
          "headers": { 
              "content-type": "application/json",
              "Accept":"application/json",
              "name":"ISAS",
              "Accesstoken":Token.Accesstoken
          },
          "url": URL.VM_URL+"/api/v1/hierarchy/node/element/28911ef0-9e6b-11ea-a814-a3efe9f03277"
          }, (error, response, body) => {
            if(error) {
                return console.log("error in api",error);
            }
            console.log("\n\nResponse Code ****:"+response.statusCode)
            expect(response.statusCode).toBe(200)
            done();
        })
  });

  it("TID-API-024 Api testing for get the plugin node data from the hierarchy tree, when user clicks on the plugin node in tree, the plugin should have to call the api to EC with pass the incorrect node UID",function(done){
      Request.get({
          "headers": { 
              "content-type": "application/json" ,
              "Accept":"application/json",
              "name":"ISAS",
              "Accesstoken":Token.Accesstoken
          },
          "url": URL.VM_URL+"/api/v1/hierarchy/node/element/aae61b30-64fa-11ea-bea3-ed9c3"
          }, (error, response, body) => {
            if(error) {
                return console.log("error in api",error);
            }
            console.log("\n\nResponse Code ****:"+response.statusCode)
            expect(response.statusCode).toBe(500)
            done();
        })
  });

  it("TID-API-025 API Testing for Get all the hierarchy Levels from the EC, which we create in seeting page in EC UI ",function(done){
      Request.get({
          "headers": { 
              "content-type": "application/json" ,
              "Accept":"application/json",
              "Accesstoken":Token.Accesstoken
          },
          "url": URL.VM_URL+"/api/v1/hierarchy/hierarchyLevel"
          }, (error, response, body) => {
            if(error) {
                return console.log("error in api",error);
            }
            console.log("\n\nResponse Code ****:"+response.statusCode)
            expect(response.statusCode).toBe(200)
            done();
        })
  });

  it("TID-API-026 api Testing for Creation of hierarchy levels For EC with valid Parameters",function(done){
      Request.post({
          "headers": { 
              "content-type": "application/json" ,
              "Accept":"application/json",
              "Accesstoken": Token.Accesstoken
            },
          "url": URL.VM_URL+"/api/v1/hierarchy/hierarchyLevel",
          "body": JSON.stringify([{
                  "Name" : "Region",
              "LevelType" : "1",
              "Image" : "data:image/jpeg;base64,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",
              "facilityType" : "Boolean"
           }])
          }, (error, response) => {
            if(error) {
                return console.dir(error);
            }
            console.log("\n\nResponse Code ****:"+response.statusCode)
            expect(response.statusCode).toBe(200)
            //console.dir(response.body);
            done();
        })
  });

  it("TID-API-027 api Testing for Creation of hierarchy levels For EC with invalid Parameters",function(done){
      Request.post({
          "headers": { 
              "content-type": "application/json" ,
              "Accept":"application/json",
              "Accesstoken": Token.Accesstoken
            },
          "url": URL.VM_URL+"/api/v1/hierarchy/hierarchyLevel",
          "body": JSON.stringify([{
              "123Name" : "",
              "LevelType" : "1",
              "Image" : "data:image/jpeg;base64,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",
              "facilityType" : "Boolean"
           }])
          }, (error, response) => {
            if(error) {
                return console.dir(error);
            }
            console.log("\n\nResponse Code ****:"+response.statusCode)
            expect(response.statusCode).toBe(500)
            //console.dir(response.body);
            done();
        })
  });

  it("TID-API-028 api Testing for Creation of hierarchy levels For EC with incorrect json format",function(done){
      Request.post({
          "headers": { 
              "content-type": "application/json" ,
              "Accept":"application/json",
              "Accesstoken": Token.Accesstoken
            },
          "url": URL.VM_URL+"/api/v1/hierarchy/hierarchyLevel",
          "body": JSON.stringify({
              //"Name" : "Region",
              "LevelType" : "1",
              Image : "data:image/jpeg;base64,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",
              "facilityType" : "Boolean"
           })
          }, (error, response) => {
            if(error) {
                return console.dir(error);
            }
            console.log("\n\nResponse Code ****:"+response.statusCode)
            expect(response.statusCode).toBe(500)
            //console.dir(response.body);
            done();
        })
  });

  xit("TID-API-029 API Testing for update the hierarchy levels of EC with valid Parameters",function(done){
      Request.put({
          "headers": { 
              "content-type": "application/json" ,
              "Accept":"application/json",
              "Accesstoken": Token.Accesstoken
          },
          "url": URL.VM_URL+"/api/v1/hierarchy/hierarchyLevel",
          "body": JSON.stringify({
              "id" : "1",
              "levels" : [{
                  "Name" : "first level",
                  "LevelType" : "level-0",
                  "Image" : "data:image/jpg;base64,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",
                  "facilityType" : "Boolean"
              }]
          })
          }, (error, response) => {
          if(error) {
              return console.dir(error);
          }
          console.log("\n\nResponse Code ****:"+response.statusCode)
          expect(response.statusCode).toBe(200)
          //console.dir(response.body);
          done();
      })
  });

  it("TID-API-030 API Testing for update the hierarchy levels of EC with invalid Parameters",function(done){
    Request.put({
        "headers": { 
            "content-type": "application/json" ,
            "Accept":"application/json",
            "Accesstoken": Token.Accesstoken
        },
        "url": URL.VM_URL+"/api/v1/hierarchy/hierarchyLevel",
        "body": JSON.stringify({
            "id" : "1",
            "levels" : [{
                "Name" : "first level",
                "LevelType1" : "level-0",
                "Image" : "data:image/jpg;base64,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",
                "facilityType" : "Boolean"
            }]
        })
        }, (error, response) => {
        if(error) {
            return console.dir(error);
        }
        console.log("\n\nResponse Code ****:"+response.statusCode)
        expect(response.statusCode).toBe(500)
        //console.dir(response.body);
        done();
    })
  });

  it("TID-API-031 API Testing for update the hierarchy levels of EC with incorrect json format",function(done){
      Request.post({
          "headers": { 
              "content-type": "application/json" ,
              "Accept":"application/json",
              "Accesstoken": Token.Accesstoken
          },
          "url": URL.VM_URL+"/api/v1/hierarchy/hierarchyLevel",
          "body": JSON.stringify({
              "id" : "1",
              "levels" : [{
                  Name1: "first level",
                  "LevelType" : "level-0",
                  "Image" : "data:image/jpg;base64,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",
                  "facilityType" : "Boolean"
              }]
          })
          }, (error, response) => {
          if(error) {
              return console.dir(error);
          }
          console.log("\n\nResponse Code ****:"+response.statusCode)
          expect(response.statusCode).toBe(500)
          //console.dir(response.body);
          done();
      })
  });

  it("TID-API-032 API Testing for Get the hierarchy tree of EC",function(done){
      Request.get({
      "headers": { 
          "content-type": "application/json" ,
          "Accept":"application/json",
          "Accesstoken": Token.Accesstoken
      },
      "url": URL.VM_URL+"/api/v1/hierarchy/tree"
      }, (error, response, body) => {
          if(error) {
              return console.log("error in api",error);
          }
          console.log("\n\nResponse Code ****:"+response.statusCode)
          expect(response.statusCode).toBe(200)
          done();
      })
  });

  it("TID-API-033 API Testing for get all the error log of EC",function(done){
      Request.get({
      "headers": { 
          "content-type": "application/json" ,
          "Accept":"application/json",
          "Accesstoken": Token.Accesstoken
      },
      "url": URL.VM_URL+"/api/v1/logs/error"
      }, (error, response, body) => {
          if(error) {
              return console.log("error in api",error);
          }
          console.log("\n\nResponse Code ****:"+response.statusCode)
          expect(response.statusCode).toBe(200)
          done();
      })
  });

  it("TID-API-034 Api testing for Get all the EC server logs of EC which are done internally",function(done){
      Request.get({
      "headers": { 
          "content-type": "application/json" ,
          "Accept":"application/json",
          "Accesstoken": Token.Accesstoken
      },
      "url": URL.VM_URL+"/api/v1/logs/ecserver"
      }, (error, response, body) => {
          if(error) {
              return console.log("error in api",error);
          }
          console.log("\n\nResponse Code ****:"+response.statusCode)
          expect(response.statusCode).toBe(200)
          done();
      })
  });

  it("TID-API-035 Api testing for Get all the API logs of EC whenever external call hits the EC API",function(done){
      Request.get({
      "headers": { 
          "content-type": "application/json" ,
          "Accept":"application/json",
          "Accesstoken": Token.Accesstoken
      },
      "url": URL.VM_URL+"/api/v1/logs/global"
      }, (error, response, body) => {
          if(error) {
              return console.log("error in api",error);
          }
          console.log("\n\nResponse Code ****:"+response.statusCode)
          expect(response.statusCode).toBe(200)
          done();
      })
  });

  it("TID-API-036 Api testing for Get all the server information",function(done){
      Request.get({
      "headers": { 
          "content-type": "application/json" ,
          "Accept":"application/json",
          "Accesstoken": Token.Accesstoken
      },
      "url": URL.VM_URL+"/api/v1/server/app/info"
      }, (error, response, body) => {
          if(error) {
              return console.log("error in api",error);
          }
          console.log("\n\nResponse Code ****:"+response.statusCode)
          expect(response.statusCode).toBe(200)
          done();
      })
  });

  it("TID-API-037 Api testing for Get all the facility list",function(done){
      Request.get({
      "headers": { 
          "content-type": "application/json" ,
          "Accept":"application/json",
          "Accesstoken": Token.Accesstoken
      },
      "url": URL.VM_URL+"/api/v1/facilities/list"
      }, (error, response, body) => {
          if(error) {
              return console.log("error in api",error);
          }
          console.log("\n\nResponse Code ****:"+response.statusCode)
          expect(response.statusCode).toBe(200)
          done();
      })
  });

  it("TID-API-039 Api testing for Get import the facility list",function(done){
      Request.get({
      "headers": { 
          "content-type": "application/json" ,
          "Accept":"application/json",
          "Accesstoken": Token.Accesstoken
      },
      "url": URL.VM_URL+"/api/v1/facilities/list/import"
      }, (error, response, body) => {
          if(error) {
              return console.log("error in api",error);
          }
          console.log("\n\nResponse Code ****:"+response.statusCode)
          expect(response.statusCode).toBe(200)
          done();
      })
  });

  it("TID-API-040 api Testing for import the facility ",function(done){
      Request.post({
          "headers": { 
              "content-type": "application/json" ,
              "Accept":"application/json",
              "Accesstoken": Token.Accesstoken
          },
          "url": URL.VM_URL+"/api/v1/facilities/list/import",
          "body": JSON.stringify([{
            
                    "Name": "facility",
                     "AddressLine1": "testing AddressLine1",
                     "AddressLine2": "testing AddressLine2",
                     "AddressLine3": "testing AddressLine3",
                     "City": "Bulqize",
                     "State": "Bulqize",
                     "PostalCode": "testing PostalCode",
                     "Country": "Albania",
                     "IPRange": "10.2.5.40/24",
                     "Status": false,
                     "Contact": "9889875505",
                     "Email": "saritasingh@gmail.com",
                     "Department": "innovation",
                     "Phone": "9354033663"
                     
             
       
              
          }])
          }, (error, response) => {
          if(error) {
              return console.dir(error);
          }
          console.log("\n\nResponse Code ****:"+response.statusCode)
          expect(response.statusCode).toBe(200)
          //console.dir(response.body);
          done();
      })
  });

  it("TID-API-041 Api testing for get license manager plugin info",function(done){
    Request.get({
        "headers": { 
          "content-type": "application/json",
          "Accept":"application/json",
          "Accesstoken":Token.Accesstoken
          //"Accesstoken":"Z-pUYL0SpitW909JF8_NLSZwj_VauFsJ"
        },
        "url": URL.VM_URL+"/api/v1/plugins/licensemanager/fetch"
        }, (error, response, body) => {
          if(error) {
              return console.log("error in api",error);
          }
          console.log("\n\nResponse Code ****:"+response.statusCode)
          expect(response.statusCode).toBe(200)
          done();
      })
  })

  it("TID-API-042 Api testing for Communication between two plugins via EC",function(done){
    Request.get({
        "headers": { 
          "content-type": "application/json",
          "Accept":"application/json",
          "Accesstoken":Token.Accesstoken
          //"Accesstoken":"Z-pUYL0SpitW909JF8_NLSZwj_VauFsJ"
        },
        "url": URL.VM_URL+"/api/v1/plugin/api/v1/users"
        }, (error, response, body) => {
          if(error) {
              return console.log("error in api",error);
          }
          console.log("\n\nResponse Code ****:"+response.statusCode)
          expect(response.statusCode).toBe(200)
          done();
      })
  })

  it("TID-API-043 api Testing for User Logout from EC",function(done){
      Request.delete({
      "headers": { 
          "content-type": "application/json" ,
          "Accept":"application/json",
          "Accesstoken":Token.Accesstoken
          //"Accesstoken":"Z-pUYL0SpitW909JF8_NLSZwj_VauFsJ"
          },
      "url": URL.VM_URL+"/api/v1/user/logout",
      "body": JSON.stringify({
          "userDetails":
          {
              "userName":"esadmin12",
              "password":"Icumed@1"
          },
          "authType":"User"
      })
      }, (error, response) => {
          if(error) {
              return console.dir(error);
          }
          console.log("\n\nResponse Code ****:"+response.statusCode)
          expect(response.statusCode).toBe(200)
          done();
      })
  });

});