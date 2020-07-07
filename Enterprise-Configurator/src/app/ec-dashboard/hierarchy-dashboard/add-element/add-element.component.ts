import { Component, OnInit,Inject, HostListener, ElementRef, ViewChild, AfterContentInit } from '@angular/core';
import { AuthenticationService } from '../../../services/authentication.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {FormBuilder, FormGroup, FormControl, Validators, FormGroupDirective, NgForm} from '@angular/forms';
import { AppLocalStorageKeys } from '../../../app-storagekeys-urls';
import { SharedService } from '../../../services/shared/shared.service';
import{ NodeCreation } from '../../../interfaces/user';
import { Router } from '@angular/router';


import * as moment from 'moment';

@Component({
  selector: 'app-add-element',
  templateUrl: './add-element.component.html',
  styleUrls: ['./add-element.component.scss']
})
export class AddElementComponent implements OnInit {
  @ViewChild('useriframe',{static:false}) iframe: ElementRef;
  @HostListener('contextmenu', ['$event'])
  onRightClick(event) {
    event.preventDefault();
  }
  appLocalKeys = AppLocalStorageKeys()
  currentUser
  plugin
  plugins
  pluginFrameUrl:SafeResourceUrl
  pluginServicesDown = false
  showIframeLoadingSpinner = false
  HeirarchyNodeForm: FormGroup
  //AddFacilityForm: FormGroup

  selectedPlugin:any 
  // showErrMsgOfAddingPlugin

  showIframe:boolean = false
  showNodeForm:boolean = false
  showFacility:boolean = false

  facilityFormValid:boolean = false

  displayToast ={
    show : false,
    message : '',
    success : false
  }
  showProgressSpinner = false
  triggerTosendFacilityForm
  additionalPropertiesFields
  AdditoinalPropertiesForm

  hierarchyGroupLevels = []
  noPluginsFound = false

  constructor(private authService: AuthenticationService,public dialogRef: MatDialogRef<AddElementComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,private sanitizer: DomSanitizer,private fb:FormBuilder, private SharedService:SharedService
    ,private router: Router) {

    console.log("node data:",this.data.nodeData)
    console.log("plugins data:",this.data.detectedPlugins)
    let userinfo = this.authService.currentUserData
    this.currentUser = userinfo ? userinfo : ''
    console.log("currentUser:",this.currentUser)

    //--------- HIERARCHY NODE FORM -----------//
    this.HeirarchyNodeForm = fb.group({
      Name: new FormControl(""),
      Notes: new FormControl(""),
      AllowIndependentMeds: new FormControl(false),
    })
    

  }

 
  ngOnInit() {
    this.getPluginsAndHierarchyLevel()
    this.setHeirarchyLevelFormValidators()
    //this.getAdditionalPropertiesFields()
  }

  setImage(iconUrl){
    let url = 'data:image/jpg;base64,'+iconUrl
    return {
      "background-image": "url("+url+")"
    }
  }

  getAdditionalPropertiesFields(){
    this.authService.getAdditionalPropertiesMaster((propertyFields:any, error:any)=>{
      if(error){
        this.additionalPropertiesFields = []
        console.log("Error while getting the additional property:",error)
      }else{
        console.log("Succes getting the additional property:",propertyFields)
        this.additionalPropertiesFields = propertyFields.data
        this.AdditoinalPropertiesForm = this.authService.convertToFormGroup(propertyFields.data)
        
      }
    })
  }

  searchForLevelType(nodeTypeOf, levels){
    if(nodeTypeOf == this.appLocalKeys.appType){
      return levels
    }else{
      const foundLevelIndex = levels.map((level:any) => { return level.LevelType; }).indexOf(parseInt(nodeTypeOf));
      console.log("LEVEL SEARCH :",foundLevelIndex)
      if(foundLevelIndex > -1){
        // levels.splice(foundLevelIndex, 1);
        let finalLevels = []
        for(let i=foundLevelIndex+1; i<levels.length; i++){
          console.log("INDEX :",i)
          finalLevels.push(levels[i])
        }
        console.log("finalLevels :",finalLevels)
        return finalLevels
      }else if(foundLevelIndex < -1){
        return []
      }
    }
  }

  async getPluginsAndHierarchyLevel() {
    let plugins = []
    if (this.data && this.data.detectedPlugins) {
      let detectedPlugins = JSON.stringify(this.data.detectedPlugins)
      plugins = JSON.parse(detectedPlugins)
      plugins.sort((a, b) => (a.Name > b.Name) ? 1 :  -1 )
    }

    this.getLevels().then(async (levels) => {
      if (levels) {
        console.log("LEVELS :",levels)
        let finalHierarchyGroupLevels = await this.searchForLevelType(this.data.nodeData.TypeOf,levels)
        console.log("finalHierarchyGroupLevels :",finalHierarchyGroupLevels)
        if(finalHierarchyGroupLevels && finalHierarchyGroupLevels.length > 0){
          for (let i = 0; i < finalHierarchyGroupLevels.length; i++) {
            let constantLevel = {
              Name: finalHierarchyGroupLevels[i].Name,
              IconUrl: finalHierarchyGroupLevels[i].Image,
              Notes: 'Notes',
              LevelType: finalHierarchyGroupLevels[i].LevelType,
              FacilityType : finalHierarchyGroupLevels[i].facilityType,
              AllowIndependentMeds : "Allow Independent Meds"
            }
            let image = constantLevel.IconUrl.split(',')
            constantLevel.IconUrl = image[1]
            plugins.push(constantLevel)
          }
        }

        console.log("plugins concat :", plugins)
        this.plugins = plugins
        this.selectPlugin(this.plugins[0])
        this.plugin = this.plugins[0]
      }
    }).catch(err => {
      console.log("error while getting the hierarchyLevel info:", err)
      this.plugins = plugins
      this.selectPlugin(this.plugins[0])
      this.plugin = this.plugins[0]
    })

  }

  getLevels(){
    return new Promise((resolve, reject) => {
      this.authService.getHeirarchyLevel( (res,err)=>{
        if(err){
          console.log("error while getting the hierarchyLevel info:",err)
          reject(err)
        }else{
          let levels = res.data.hierarchyLevels
          if(levels && levels.length < 1){
            this.hierarchyGroupLevels = []
          }else{
            let hierarchyGroupLevels = levels.LevelData
            hierarchyGroupLevels = this.sortingOfLevels(hierarchyGroupLevels)
            hierarchyGroupLevels.push(hierarchyGroupLevels.shift());
            this.hierarchyGroupLevels = hierarchyGroupLevels
            resolve(hierarchyGroupLevels)
          }
        }
      })
    })
  }

  sortingOfLevels(hierarchyLevels){
    return hierarchyLevels.sort((n1,n2) => {
      if (n1.LevelType > n2.LevelType) {
          return 1;
      }
  
      if (n1.LevelType < n2.LevelType) {
          return -1;
      }
  
      return 0;
    });
  }


  selectPlugin(plugin){   
    console.log("IFRAME1111 :",)
    console.log("Selected :",plugin);
    console.log("LAST HIERARCHY GROUP LEVEL :",this.hierarchyGroupLevels[this.hierarchyGroupLevels.length-1]);
    console.log("Full HIERARCHY GROUP LEVEL :",this.hierarchyGroupLevels);
    this.selectedPlugin = plugin
    if(plugin && plugin.BaseUrl && plugin.UniqueName){
      this.showIframe = true
      this.showNodeForm = false
      this.showFacility = false
      this.showIframeLoadingSpinner = true
      this.pluginServicesDown = false
      // let url = plugin.url+':'+plugin.serverPort+'/#/addelement/'+this.data.nodeData.NodeID+'/'+this.currentUser.userName;
      let url = plugin.BaseUrl+':'+plugin.UiPort+'/#/addelement/'+this.data.nodeData.Uid;
      // let url = plugin.BaseUrl+':4202/#/addelement/'+this.data.nodeData.Uid;
      this.pluginFrameUrl= this.sanitizer.bypassSecurityTrustResourceUrl(url);
      // this.pluginFrameUrl= this.sanitizer.bypassSecurityTrustResourceUrl('http://localhost:4201/addelement');
      console.log(url)     
     
    }else if(plugin && (plugin.LevelType === this.hierarchyGroupLevels[this.hierarchyGroupLevels.length-1].LevelType)){
      console.log("YYYYYYY")
      this.showIframe = false
      this.showNodeForm = false
      this.showFacility = true
      this.pluginFrameUrl = null
      this.facilityFormValid = false
      //this.setFacilityFormValidators()
    }else if(plugin){
      console.log("DDDDDD")
      this.showIframe = false
      this.showNodeForm = true
      this.showFacility = false
      this.pluginFrameUrl = null
    }else{
      this.noPluginsFound = true
    }
    
    // this.selectedPlugin = plugin
  }

  sendMsgToPluginToSaveToHierarchy(selectedPlugin){
    this.showProgressSpinner = true
    console.log("selected plugin to save:",selectedPlugin)
    console.log("selected plugin to save:",this.iframe)
    // let url = selectedPlugin.BaseUrl+':4202/#/addelement/'+this.data.nodeData.Uid;
    let url = selectedPlugin.BaseUrl+':'+selectedPlugin.UiPort+selectedPlugin.UiUrls.addElement +'/'+this.data.nodeData.Uid;
    
    let iframe = document.getElementById('useriframe');
    console.log("IIII FRAME:",iframe)
    console.log("url:",url)
    if (iframe == null) return;
    var iWindow = (<HTMLIFrameElement>iframe).contentWindow;
    iWindow.postMessage({accesstoken:this.currentUser.sessionId, action : 'save'}, url);
  }

  close(){
    this.dialogRef.close();
  }

  onload(pluginFrameUrl){
    /* document.oncontextmenu = function() { 
      return false; 
    }; */
      let url = pluginFrameUrl.changingThisBreaksApplicationSecurity;
      var iframe = document.getElementById('useriframe');
      this.showIframeLoadingSpinner = false
      console.log("Onload url:",url)
      if (iframe == null) return;
      var iWindow = (<HTMLIFrameElement>iframe).contentWindow;
      // var iWindow1 = (<HTMLIFrameElement>iframe).oncontextmenu = function(){ 
      //   event.preventDefault();
      //   return false; 
      // };
      iWindow.postMessage({accesstoken:this.currentUser.sessionId}, url);
      // iWindow.postMessage({accesstoken:'hflsdnlfkvdlsm'}, url);
      // this.populateIframe(iframe, url,  [['AccessToken', 'abcd1234']]);
      
  }



  populateIframe(iframe, url, headers) {
    var scope = this
    var xhr = new XMLHttpRequest();
    console.log("XHR:",xhr)
    xhr.open('GET', url);
    xhr.onreadystatechange = handler;
    xhr.responseType = 'blob';
    // console.log("XHR:",xhr)
    headers.forEach(function(header) {
      xhr.setRequestHeader(header[0], header[1]);
    });
    xhr.send();
  
    function handler() {
      console.log("this:",this)
      console.log("this.readyState:",this.readyState)
      console.log("this.DONE:",this.DONE)
      if (this.readyState === this.DONE) {        
        if (this.status === 200) {
          console.log("SUCESSSSSS:",iframe)
          scope.pluginServicesDown = false
          // this.response is a Blob, because we set responseType above
          // iframe.src = scope.pluginFrameUrl
          // iframe.src = URL.createObjectURL(this.response);
        } else {
          console.error('XHR failed', this);
          scope.pluginServicesDown = true
        }
      }
    }
  
  
  }

  triggerFacilityFormTosendData(){
    this.triggerTosendFacilityForm = true
  }

  createFacilityForm(event){
    console.log("FACILITY FORM :",event)
    if(event.valid && event.data){
      this.showProgressSpinner = true
      this.saveFacilityToTree(event.data)
    }else if(event.valid){
      this.facilityFormValid = true
      
    }else if(!(event.valid)){
      this.facilityFormValid = false
    }
  }

  saveFacilityToTree(facilityData){
    /* let enterpriseObj = {
      ParentID: this.data.nodeData.NodeID,
      PluginID:null,
      NodeType: "enterprise-hierarchy",
      TypeOf: this.selectedPlugin.facilityType === true ? this.selectedPlugin.levelType : this.selectedPlugin.levelType ? this.selectedPlugin.levelType : this.selectedPlugin.Name,
      // TypeOf: this.selectedPlugin.levelType ? this.selectedPlugin.levelType : this.selectedPlugin.Name,
      CreatedDate: moment().format("YYYY-MM-DD HH:mm:ss:SS"),
      LastModifiedDate:moment().format("YYYY-MM-DD HH:mm:ss:SS"),
      CreatedBy: this.currentUser.userName,
      ModifiedBy: this.currentUser.userName,
      IsActive:1
    } */
    console.log("Coming to add facility")
    /* enterpriseObj['NodeName'] = facilityData.FacilityName
    enterpriseObj['NodeShortName'] = facilityData.FacilityName
    enterpriseObj['NodeInfo'] = JSON.stringify(facilityData)
    enterpriseObj['addtnlProperties'] = this.AdditoinalPropertiesForm.value */
    // let hierarchyType = this.selectedPlugin.FacilityType === true ? this.selectedPlugin.LevelType ?  :  this.selectedPlugin.LevelType
    let hierarchyType = this.selectedPlugin.LevelType
    let nodeCreationSchema:NodeCreation = this.SharedService.createNodeObj(facilityData.FacilityName, this.data.nodeData.NodeID, null, "enterprise-hierarchy", hierarchyType, JSON.stringify(facilityData), true);
    console.log("Coming to add facility:",nodeCreationSchema)
    this.saveToEnterpriseHierarchy(nodeCreationSchema)
  }



  onClickSubmit(){
    this.showProgressSpinner = true
    console.log("this.selectedPlugin:",this.selectedPlugin)
    if(this.HeirarchyNodeForm.value && this.showNodeForm){
      console.log("Coming to add Node form")
      // console.log("Coming to add Node form nd addtnl fields:",this.AdditoinalPropertiesForm.value)
      console.log(this.HeirarchyNodeForm.value)
     /*  enterpriseObj['NodeName'] = this.HeirarchyNodeForm.value.Name
      enterpriseObj['NodeShortName'] = this.HeirarchyNodeForm.value.Name
      enterpriseObj['NodeInfo'] = JSON.stringify(this.HeirarchyNodeForm.value)
      enterpriseObj['addtnlProperties'] = this.AdditoinalPropertiesForm.value */
      let hierarchyTypeOf = this.selectedPlugin.LevelType ? this.selectedPlugin.LevelType : this.selectedPlugin.UniqueName;
      let nodeCreationSchema:NodeCreation = this.SharedService.createNodeObj(this.HeirarchyNodeForm.value.Name, this.data.nodeData.NodeID, null, "enterprise-hierarchy", hierarchyTypeOf, JSON.stringify(this.HeirarchyNodeForm.value), true);
      this.saveToEnterpriseHierarchy(nodeCreationSchema);

    }
   /*  else if(this.AddFacilityForm.value && this.showFacility){
      console.log("Coming to add facility")
      enterpriseObj['NodeName'] = this.AddFacilityForm.value.FacilityName
      enterpriseObj['NodeShortName'] = this.AddFacilityForm.value.FacilityName
      enterpriseObj['NodeInfo'] = JSON.stringify(this.AddFacilityForm.value)

      this.saveToEnterpriseHierarchy(enterpriseObj)
    } */
  }

  saveToEnterpriseHierarchy(enterpriseObj){
    console.log("OBJJJJ:",enterpriseObj)
    this.authService.saveToHierarchy(enterpriseObj,(res,err)=>{
      this.showProgressSpinner = false
      if(err){
        console.log("ERROR TO SHOW TOAST")
        this.displayToast = {
          show : true,
          message : "Internal error while adding",
          success : false
        }
        setTimeout(()=>{
          this.displayToast.show = false
        },3000)
      }else{
        console.log("in heirarchy component, rep of saving enterprise:",res)
        let responseNode = res ? res.data ? res.data : enterpriseObj : ''
        // setTimeout(()=>{
          let result = {
            newNode : [responseNode],
            parentNode : this.data.nodeData
          }
          this.dialogRef.close(result);
        // },2000)
      }

    })
  }


 /*  navigatePluginPages(selectedPlugin,command){
    let url = selectedPlugin.UiUrl+':'+selectedPlugin.Port+'/'+command.url
    this.pluginFrameUrl= this.sanitizer.bypassSecurityTrustResourceUrl(url);
  } */



/*   buildRegisterPluginForm(){
    this.registerPluginForm = this.formBuilder.group({
      pluginId: new FormControl(""),
     pluginUrl: new FormControl("")
    })
  } */

  setHeirarchyLevelFormValidators(){
    let regionName = this.HeirarchyNodeForm.get('Name');

    if(!this.pluginFrameUrl){
      regionName.setValidators([Validators.required]);
    }
  }

  goToSettingsPage(){
    this.dialogRef.close()
    this.router.navigate(['/dashboard/settings'])
  }


/*   -------- WORKING METHOD FOR ADD HIERARCHY ----------
@HostListener('window:message', ['$event'])
  onMessage(e) {
    console.log("In Parent APP:", e.data)
    console.log("In Parent APP this.selectedPlugin:", this.selectedPlugin)
    let json = {
      name: e.data.name,
      parentId: this.data.nodeData.NodeID,
      port: this.selectedPlugin.serverPort,
      data: e.data
    }
    this.authService.saveToTree(json, (res, err) => {
      if (err) {
        this.showEnterpriseHeirarchySaveError = 'Error While Updating'
        setTimeout(() => {
          this.showEnterpriseHeirarchySaveError = ''
        }, 2000)
      } else {
        console.log("in heirarchy component, rep of saving enterprise into tree:", res)
        this.showEnterpriseHeirarchySaveError = 'Updated Successfully'
        setTimeout(() => {
          this.showEnterpriseHeirarchySaveError = ''
          this.dialogRef.close();
        }, 2000)
      }
    })
  } */

  /* setFacilityFormValidators(){
    let FacilityName = this.AddFacilityForm.get('FacilityName');

    FacilityName.setValidators([Validators.required]);
  } */

  @HostListener('window:message', ['$event'])
  onMessage(eventFromChild) {
    console.log("eventFromChild :",eventFromChild)
    this.showProgressSpinner = false
    if(eventFromChild.data.message == 'Successfully saved'){
      let result = {
        newNode : eventFromChild.data.responseInfo.responseData,
        parentNode : this.data.nodeData
      }
      this.dialogRef.close(result);
    }else if(eventFromChild.data.message == "Error while saving"){
      this.displayToast = {
        show : true,
        message : "Internal error while adding",
        success : false
      }
      setTimeout(()=>{
        this.displayToast.show = false
      },3000)
    }
  }

}

