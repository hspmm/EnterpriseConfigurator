import { Injectable , NgZone} from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient , HttpHeaders, HttpErrorResponse } from '@angular/common/http';
// import { ToastrService } from 'ngx-toastr';

import { AppConfig } from '../app.config'
import { AppLocalStorageKeys } from '../app-storagekeys-urls';
import { User,TreeNode,TreeFlatNode, NodeCreation } from '../interfaces/user';
import { FacilitiesCSVRecord } from '../interfaces/facilities-list.interface';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, throwError} from 'rxjs';
import { catchError} from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  // adminRole:boolean = false
  public loggedIn: BehaviorSubject<any> = new BehaviorSubject<any>('');
  public selectedPlugin: BehaviorSubject<any> = new BehaviorSubject<any>('');
  localKeys = AppLocalStorageKeys()
  AppConfiggurations = AppConfig.settings.env
  sessionExpiry = false
  serverDown = false


  
  constructor(private router:Router,  private http:HttpClient) {
   
    console.log("SETTING EVN File:",this.AppConfiggurations)
    /* this.isLoggedIn.subscribe(userInfo=>{
      localStorage.setItem(this.localKeys.currentUser, JSON.stringify(userInfo));
    }) */
  }


  get isLoggedIn(){
    return this.loggedIn.asObservable()
  }

  get isselectedPluginUrl(){
    return this.selectedPlugin.asObservable()
  }

  get currentUserData(){
    // console.log("Local userData:",JSON.parse(localStorage.getItem(this.localKeys.currentUser)))
    return JSON.parse(localStorage.getItem(this.localKeys.currentUser)) ? JSON.parse(localStorage.getItem(this.localKeys.currentUser)) : ''
  }



 /*  get isAdminRole(){
    if(this.currentUserData.mappedPrivileges && this.currentUserData.mappedPrivileges.length > 0){
      this.currentUserData.mappedPrivileges.forEach(privileges => {      
        for(let key in privileges['Privilege']){
          console.log("##@@ PRIVILEGES:",privileges['Privilege'][key])
          if(privileges['Privilege'][key] == 'Admin'){
            this.adminRole = true
          }
        }
      });
    }
    return this.adminRole
  } */

/*   showSuccess() {
    this.toastr.success('Hello world!', 'Toastr fun!');
  } */

  handleError(error: HttpErrorResponse){
    // console.error('An error occurred:', error);
    if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error('An error occurred:', error);
            // window.confirm("Internal server down....!!")
            // this.logout()
    }else{
            // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.log("ERRORRRRRRRRRRRRRRRR:",error)
      console.log("this.sessionExpiry:",this.sessionExpiry)
      if(error.error.errCode == "SESS_EXP" && !this.sessionExpiry){
        this.sessionExpiry = true
        window.confirm("Session Expired....!!")
        this.logout()
      }else if(error.status === 0 && !this.serverDown){
        this.serverDown = true
        window.confirm("Internal server down please try again later....!!")
      }
    }
  }

  /* private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
      return throwError(error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      // console.error(
      //   `Backend returned code ${error.status}, ` +
      //   `body was: ${error.error}`);

          // window.alert("Session Expired...!!")
          this.zone.run(()=>{
            console.log("++++++++++++++++++NAVIGATE:",this.sessionExpiry);
            if(error.error.errCode == "SESS_EXP" && this.sessionExpiry !== true){
              this.sessionExpiry = true
              this.router.navigate(['']);
            }else{
              return throwError(error);
            }
            
          });
    }
    // return an observable with a user-facing error message
    
  }; */


 /*  getAuthTypes(callback){
    this.http.get(this.AppConfiggurations.baseUrl+this.localKeys.urls.authTypes).toPromise().then(authTypes =>{
      console.log("In service authTypes:",authTypes)
      callback(authTypes,null)
    }).catch(err=>{
      console.log("Error authTypes:",err)
      this.handleError(err)
      callback(null,err)
    })
  } */

  checkPrivilege(appPrivilege){
    if(appPrivilege && this.currentUserData.mappedPrivileges && this.currentUserData.mappedPrivileges.length > 0){
      return this.currentUserData.mappedPrivileges.filter(userPrivileges => userPrivileges.Privilege.Key.toLowerCase() == appPrivilege.toLowerCase())
    }
    return false
  }

  login(authObj,callback){
    console.log("authObj:",authObj)
    this.http.post(this.AppConfiggurations.baseUrl+this.localKeys.urls.loginUrl,authObj).toPromise().then(userInfo =>{
      console.log("Login service:",userInfo)
      localStorage.setItem(this.localKeys.accessToken, userInfo['data'].sessionId); 
      // let userInfoData = Object.assign({},authObj.userDetails,userInfo['data'])
      let userInfoData = userInfo['data']
      localStorage.setItem(this.localKeys.currentUser, JSON.stringify(userInfoData));    
      // localStorage.setItem(this.localKeys.accessToken, JSON.stringify(userInfoData.AccessToken));    
      this.loggedIn.next(userInfoData)
      this.router.navigate(['/dashboard'])
    }).catch(err=>{
      console.log("Error :",err)
      //catchError(this.handleError)
      callback(null,err)
    })

    /* this.http.post(this.AppConfiggurations.baseUrl+this.localKeys.urls.loginUrl,authObj).pipe(
      catchError(this.handleError)
    ).toPromise() */

  }

  logout(){    
    this.http.delete(this.AppConfiggurations.baseUrl+this.localKeys.urls.logoutUrl).toPromise().then(appConfigInfo =>{
      console.log("In service Logout:",appConfigInfo)
    }).catch(err=>{
      console.log("Error Logout:",err)
    })
    this.navigateToLoginPage()
  }

  navigateToLoginPage(){
    console.log("coming to navigate to login page")
    localStorage.setItem(this.localKeys.currentUser, '');
    localStorage.setItem(this.localKeys.accessToken,''); 
    localStorage.clear();
    window.localStorage.clear()
    this.router.navigate(['']);
    // this.router.routeReuseStrategy.shouldReuseRoute=()=>true
  }


  getAuthorizationToken(){
    return localStorage.getItem(AppLocalStorageKeys().accessToken)
  }

  getAppConfigInfo(callback){    
    this.http.get(this.AppConfiggurations.baseUrl+this.localKeys.urls.ecConfigUrl).toPromise().then(appConfigInfo =>{
      // console.log("In service appConfigInfo:",appConfigInfo)
      callback(appConfigInfo,null)
    }).catch(err=>{
      this.handleError(err)
      callback(null,err)
    })
  }

  getDetectedPluginsList(callback){  
    /* this.http.get(this.AppConfiggurations.baseUrl+this.localKeys.urls.detectPluginsListUrl).pipe(
      catchError(this.handleError)
    ).toPromise().then(plugins =>{
      console.log("In service:",plugins)
      callback(plugins)
    }).catch(err=>{
      console.log("Error DETECT:",err)
      callback(null,err)
      //catchError(this.handleError)
    }) */
    /* this.http.get(this.AppConfiggurations.baseUrl+this.localKeys.urls.detectPluginsListUrl).toPromise().then(plugins =>{
      console.log("In service:",plugins)
      callback(plugins)
    }).catch(err=>{
      console.log("Error DETECT:",err)
      callback(null,err)
    }) */
    this.http.get(this.AppConfiggurations.baseUrl+this.localKeys.urls.detectPluginsListUrl).toPromise().then(plugins =>{
      console.log("In service:",plugins)
      callback(plugins)
    }).catch(err=>{
      this.handleError(err)
      callback(null,err)
    })
  }


  setPluginServicesEnableAndDisable(json, callback){
    this.http.put(this.AppConfiggurations.baseUrl+this.localKeys.urls.setEnableAndDisablePluginServiceUrl,json).toPromise().then(response =>{
      console.log("In service:",response)
      callback(response, null)
    }).catch(err=>{
      this.handleError(err)
      callback(null,err)
    })
  }

  restartAllPluginsServices(callback){
    this.http.get(this.AppConfiggurations.baseUrl+this.localKeys.urls.restartAllPluginServices).toPromise().then(response =>{
      console.log("In service:",response)
      callback(response, null)
    }).catch(err=>{
      this.handleError(err)
      callback(null,err)
    })
  }


  restartIndividualPluginsServices(pluginUid, callback){
    this.http.get(this.AppConfiggurations.baseUrl+this.localKeys.urls.restartIndividualPluginServices + pluginUid).toPromise().then(response =>{
      console.log("In service:",response)
      callback(response, null)
    }).catch(err=>{
      this.handleError(err)
      callback(null,err)
    })
  }

 
  getHeirarchyList(callback){
    this.http.get(this.AppConfiggurations.baseUrl+this.localKeys.urls.heirarchyUrl).toPromise().then(heirarchy =>{
      console.log("In service:",heirarchy)
      callback(heirarchy)
    }).catch(err=>{
      this.handleError(err)
      callback(null,err)
    })
  }


  saveToHierarchy(enterpriseObj:NodeCreation, callback){
    this.http.post(this.AppConfiggurations.baseUrl+this.localKeys.urls.addHeirarchyNodeUrl,enterpriseObj).toPromise().then(resp =>{
      console.log("In service save enterprise Obj:",resp)
      callback(resp,null)
    }).catch(err=>{
      this.handleError(err)
      callback(null,err)
    })
  }

  bulkCreateOfHierarchyNodes(json, callback){
    this.http.post(this.AppConfiggurations.baseUrl+this.localKeys.urls.bulkCreateHeirarchyNodesUrl,json).toPromise().then(resp =>{
      console.log("In service save enterprise Obj:",resp)
      callback(resp,null)
    }).catch(err=>{
      this.handleError(err)
      callback(null,err)
    })
  }

  updateNodeInfo(nodeInfo,callback){
    this.http.put(this.AppConfiggurations.baseUrl+this.localKeys.urls.updateHierarchyNodeUrl,nodeInfo).toPromise().then(resp =>{
      console.log("In service:",resp)
      callback(resp)
    }).catch(err=>{
      this.handleError(err)
      callback(null,err)
    })
  }

  deleteHeirarchyNode(nodeUid,callback){    
    this.http.delete(this.AppConfiggurations.baseUrl+this.localKeys.urls.deleteHierarchyNodeUrl+nodeUid).toPromise().then(resp =>{
      console.log("In service:",resp)
      callback(resp,null)
    }).catch(err=>{
      this.handleError(err)
      callback(null,err)
    })
  }

  saveHeirarchyLevel(heirarchyLevelData,callback){
    this.http.post(this.AppConfiggurations.baseUrl+this.localKeys.urls.hierarchyLevelUrl,heirarchyLevelData).toPromise().then(resp =>{
      console.log("In service:",resp)
      callback(resp)
    }).catch(err=>{
      this.handleError(err)
      callback(null,err)
    })
  }
  updateHeirarchyLevel(heirarchyLevelData,callback){
    this.http.put(this.AppConfiggurations.baseUrl+this.localKeys.urls.hierarchyLevelUrl,heirarchyLevelData).toPromise().then(resp =>{
      console.log("In service:",resp)
      callback(resp)
    }).catch(err=>{
      this.handleError(err)
      callback(null,err)
    })
  }
  
  getHeirarchyLevel(callback){
    this.http.get(this.AppConfiggurations.baseUrl+this.localKeys.urls.hierarchyLevelUrl).toPromise().then(resp =>{
      console.log("In service:",resp)
      callback(resp)
    }).catch(err=>{
      this.handleError(err)
      callback(null,err)
    })
  }

  storeImportFacilities(facilities:Array<FacilitiesCSVRecord>, callback){
    this.http.post(this.AppConfiggurations.baseUrl+this.localKeys.urls.importFacilities,facilities).toPromise().then(resp =>{
      console.log("In service:",resp)
      callback(resp)
    }).catch(err=>{
      this.handleError(err)
      callback(null,err)
    })
  }

  getImportedFacilities(callback){
    this.http.get(this.AppConfiggurations.baseUrl+this.localKeys.urls.importFacilities).toPromise().then(resp =>{
      console.log("In service:",resp)
      callback(resp)
    }).catch(err=>{
      this.handleError(err)
      callback(null,err)
    })
  }


  updateNodeParentId(json,callback){
    this.http.put(this.AppConfiggurations.baseUrl+this.localKeys.urls.updateNodeParentId,json).toPromise().then(resp =>{
      console.log("In service:",resp)
      callback(resp)
    }).catch(err=>{
      this.handleError(err)
      callback(null,err)
    })
  }


  getLicensemanagerPlugin(callback){
    this.http.get(this.AppConfiggurations.baseUrl+this.localKeys.urls.getLicensePluginUrl).toPromise().then(resp =>{
      console.log("In service:",resp)
      callback(resp,null)
    }).catch(err=>{
      this.handleError(err)
      callback(null,err)
    })
  }


/*   getActiveInactivePluginsList(callback){
    this.http.get(this.AppConfiggurations.baseUrl+this.localKeys.urls.pluginsListUrl).toPromise().then(plugins =>{
      console.log("In service:",plugins)
      callback(plugins)
    }).catch(err=>{
      console.log("Error:",err)
      callback(null,err)
    })
  } */

 /*  getPluginById(pluginId,callback){
    this.http.get(this.AppConfiggurations.baseUrl+this.localKeys.urls.pluginsListUrl+'/'+pluginId).toPromise().then(plugin =>{
      console.log("In service:",plugin)
      callback(plugin)
    }).catch(err=>{
      console.log("Error:",err)
      callback(null,err)
    })
  } */








 /*  saveToTree(pluginData,callback){
    this.http.post(this.AppConfiggurations.baseUrl+this.localKeys.urls.saveToHeirarchyUrl,pluginData).toPromise().then(resp =>{
      console.log("In service:",resp)
      callback(resp)
    }).catch(err=>{
      console.log("Error:",err)
      callback(null,err)
    })
  } */


  getFacilitiesList(callback){
    this.http.get(this.AppConfiggurations.baseUrl+this.localKeys.urls.facilitiesListUrl).toPromise().then(resp =>{
      console.log("In service Facilities list:",resp)
      callback(resp)
    }).catch(err=>{
      this.handleError(err)
      callback(null,err)
    })
  }
  updateFacility(facilityData,callback){
    this.http.put(this.AppConfiggurations.baseUrl+this.localKeys.urls.updateFacilityUrl,facilityData).toPromise().then(resp =>{
      console.log("In service Facilities list:",resp)
      callback(resp)
    }).catch(err=>{
      this.handleError(err)
      callback(null,err)
    })
  }


  getAdditionalProperty(addtnlPropertyId,callback){
    this.http.get(this.AppConfiggurations.baseUrl+this.localKeys.urls.getAdditionalProperties+'/'+addtnlPropertyId).toPromise().then(resp =>{
      console.log("In service Get additional properties:",resp)
      callback(resp,null)
    }).catch(err=>{
      this.handleError(err)
      callback(null,err)
    })
  }
  updateAdditonalProperty(bodyObj,callback){
    this.http.put(this.AppConfiggurations.baseUrl+this.localKeys.urls.updateAddtnlProperty,bodyObj).toPromise().then(resp =>{
      console.log("In service Get additional properties:",resp)
      callback(resp,null)
    }).catch(err=>{
      this.handleError(err)
      callback(null,err)
    })
  }

  convertToFormGroup(dynamicFormFields){
    let group: any = {};
    dynamicFormFields.forEach(question => {
      console.log("Form fields @@@@:",question)
      if((question.Type).toLowerCase() == "checkbox" || (question.Type).toLowerCase() == "radio"){
        question.Value = (question.Value === 'true') ? true : false
      }
      console.log("question.Value :",question.Value)
      question.key = question.Name.replace(/ /g,"_")
      question.key = question.key+':'+question.Id
      group[question.key] = question.Required ? new FormControl(question.Value || '', Validators.required) : new FormControl(question.Value || '');

      console.log(" @@@@:",group[question.key])
    });
    console.log("Returned group :",group)
    return new FormGroup(group);
  }

  getAdditionalPropertiesMaster(callback){ 
    this.http.get(this.AppConfiggurations.baseUrl+this.localKeys.urls.getAdditionalProperties).toPromise().then(resp =>{
      console.log("In service Get additional properties:",resp)
      callback(resp,null)
    }).catch(err=>{
      this.handleError(err)
      callback(null,err)
    })


  }

  getAdditionalPropertiesWithNodeUid(id,callback){
    this.http.get(this.AppConfiggurations.baseUrl+this.localKeys.urls.getAdditionalProperties+'/'+id).toPromise().then(resp =>{
      console.log("In service Get additional properties:",resp)
      callback(resp,null)
    }).catch(err=>{
      this.handleError(err)
      callback(null,err)
    })
  }

  /* postHeadersToIframe(pluginFrameUrl){
    console.log("url:",pluginFrameUrl.changingThisBreaksApplicationSecurity)
    
    let headerOptions = {
      headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accesstoken': 'abcd123'
      })
    }
    this.http.get('http://localhost:4202/#/addelement',headerOptions).toPromise().then(resp=>{
      console.log("In service Get additional properties:",resp)
    }).catch(err=>{
      console.log("Error:",err)
    })
  } */
}
