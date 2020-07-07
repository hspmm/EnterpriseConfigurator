import { Component, OnInit, ViewChild, HostListener, Injectable } from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {FormBuilder, FormGroup,FormControl, Validators} from '@angular/forms';
import{ NodeCreation } from '../../../interfaces/user';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

import {Router} from '@angular/router';

import * as moment from 'moment';

import { AddElementComponent } from '../add-element/add-element.component';

import { AuthenticationService } from '../../../services/authentication.service'

import { FacilitiesListComponent } from '../facilities-list/facilities-list.component';

import { TreeFlatNode,TreeNode } from '../../../interfaces/user'
import { BehaviorSubject, from } from 'rxjs';
import { AppLocalStorageKeys } from '../../../app-storagekeys-urls';



@Component({
  selector: 'app-heirarchy-tree',
  templateUrl: './heirarchy-tree.component.html',
  styleUrls: ['./heirarchy-tree.component.scss']
})
export class HeirarchyTreeComponent implements OnInit {
  hierarchyTreeDataChange = new BehaviorSubject<TreeNode[]>([]);
  get hierarchyTreeData(): TreeNode[] { return this.hierarchyTreeDataChange.value; }

 /*  @HostListener('contextmenu', ['$event'])
  onRightClick(event) {
    event.preventDefault();
  } */

  @ViewChild('tree',{static:false}) tree;
  expandAll:boolean = false
  FacilitySpinnerRes:boolean = true
  showProgressSpinner:boolean = false
  // serverConnectionError:boolean = false
  showHierarchyTree:boolean = true
  showSearchList:boolean = false
  searchedHierarchyList = []
  searchText:any
  showIframe = false
  showNodeForm = false
  showFacility = false
  facilityFormData = null
  leftPanColumn = 3
  rightPanColumn = 9
  expandTreeView:boolean = true
  hideUpdateBtnWhenMSAS = false
  showSingleInstanceApp = false
  showIframeLoader
  showDetectedPluginData
  // activeAndInactiveplugins
  hierarchyLevelSettings
  NodeInfo:FormGroup
  showNodeInfo:boolean = false
  detectedPlugins
  selectedNodeUrl:SafeResourceUrl
  selectedNode: TreeFlatNode
  currentUser:any
  showEnterpriseSaveError:any
  heirarchyTree:boolean;
  showSpinner:boolean = true;
  nestedNodeMap = new Map<TreeNode, TreeFlatNode>();
  selectedParent: TreeFlatNode | null = null;
  treeFlattener: MatTreeFlattener<TreeNode, TreeFlatNode>;
  treeControl : FlatTreeControl<TreeFlatNode>;
  dataSource : MatTreeFlatDataSource<TreeNode, TreeFlatNode>;
  flatNodeMap = new Map<TreeFlatNode, TreeNode>();
  enterpriseFormControl = new FormControl('Kaiser Permanente');
  displayToast ={
    show : false,
    message : '',
    success : false
  }
  additionalPropertiesFields = []
  rawAddtnlPropertiesFields 
  assignedLevelType
  AdditoinalPropertiesForm: FormGroup
  // adminRole:boolean = false
  appConfigInfo:any
  splitDirection = 'horizantal'
  AppLocalKeys = AppLocalStorageKeys()
  // nodeExpanded:boolean = false
  userPrivileges

  dragNode: any;
  dragNodeExpandOverWaitTimeMs = 300;
  dragNodeExpandOverNode: any;
  dragNodeExpandOverTime: number;
  dragNodeExpandOverArea: string;


  constructor(private dialog: MatDialog, private authService: AuthenticationService,private sanitizer: DomSanitizer,fb:FormBuilder,private router: Router) {


    this.NodeInfo = fb.group({
      Notes: new FormControl(""),
      Name: new FormControl('')
    })
    let userinfo = this.authService.currentUserData
    this.currentUser = userinfo ? userinfo : ''



    this.initializeTreeControlls()

   
    this.hierarchyTreeDataChange.subscribe(treeData=>{
      console.log("@@#### TREE DATA :",treeData)
      // this.hasChild
      this.dataSource.data = treeData;
      
    })

  }

  initializeTreeControlls(){
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TreeFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

  getLevel = (node: TreeFlatNode) => node.level;

  isExpandable = (node: TreeFlatNode) => node.expandable;

  getChildren = (node: TreeNode): TreeNode[] => node.children;

  hasChild = (_: number, _nodeData: TreeFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: TreeFlatNode) => _nodeData.NodeName === '';

  transformer = (node: TreeNode, level: number) => {
    //console.log("&&&&%%%:",this.treeControl)
    // console.log("CALLING TRANSFORM:",node)
    // console.log("CALLING TRANSFORM level:",level)
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.NodeName === node.NodeName
        ? existingNode
        : new TreeFlatNode();
    flatNode.NodeName = node.NodeName;
    flatNode.level = level;
    flatNode.icon = node.icon;
    flatNode.NodeID = node.NodeID;
    flatNode.Uid = node.Uid;
    flatNode.ParentID = node.ParentID;
    flatNode.PluginID = node.PluginID;
    flatNode.NodeInfo = node.NodeInfo;
    flatNode.TypeOf = node.TypeOf;
    flatNode.NodeType = node.NodeType;
    // flatNode.AdditionalProperties = node.AdditionalProperties;
    flatNode.expandable =  node.children.length > 0 ? !!node.children : !node.children;
    // flatNode.expandable =   !!node.children ;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  ngOnInit() {
    if (document.documentElement.clientWidth < 768) { // 768px portrait
      this.splitDirection = 'vertical'
    }
    window.onresize = () => {
      if (document.documentElement.clientWidth < 768) { // 768px portrait
        this.splitDirection = 'vertical'
      }else{
        this.splitDirection = 'horizantal'
      }
    };
    // console.log("%%%$$@@@@: ",this.authService.isAdminRole)
    // this.adminRole = this.authService.isAdminRole
    this.getPlugins()
    this.getAppConfig()
    this.assignPrivileges()
    // this.getAllPluginsFromDb()
    this.getHierarchyLevelSettings()
  }

  assignPrivileges(){
    this.userPrivileges = {
      addHierarchyTree : this.authService.checkPrivilege(this.AppLocalKeys.privileges.addHierarchyTree).length > 0,
      editHierarchyTree : this.authService.checkPrivilege(this.AppLocalKeys.privileges.editHierarchyTree).length > 0,
      deleteHierarchyTree : this.authService.checkPrivilege(this.AppLocalKeys.privileges.deleteHierarchyTree).length > 0
    } 
  }


  getPlugins(){
    this.authService.getDetectedPluginsList((detectedPlugins,err)=>{
      if(err){
        console.log("Error while geting the detected Plugins:",err);
        this.detectedPlugins = []
        this.getTreeList()
        // this.router.navigateByUrl('/server-error');
      }else{
        console.log("Successfully detected Plugins:",detectedPlugins);
        if(detectedPlugins && detectedPlugins.data && detectedPlugins.data.length > 0){          
          this.detectedPlugins = detectedPlugins.data
          this.getTreeList()
        }
      }
    })
  }

  getAppConfig(){
    this.authService.getAppConfigInfo((appconfigInfo,err)=>{
      if(err){
        console.log("Error while getting App config Info:",err)
      }else{
        this.appConfigInfo = appconfigInfo && appconfigInfo.responseCode === 0 ? appconfigInfo.data : {}
      }
    })
  }

  getTreeList(){
    this.authService.getHeirarchyList(async (heirarchy,err)=>{
      if(err){
        console.log("error in getting heirarchy:",err)
        this.showSpinner = false
        /* if(err.statusText == "Unknown Error" || err.statusText == "Internal Server Error"){
          this.serverConnectionError = true
        } */
      }else{
        console.log('Heirarchy:',heirarchy)
        if(heirarchy && heirarchy.data && heirarchy.data.length > 0){
          const treeDataSource = await this.buildHierarchyTree(heirarchy.data)
          this.hierarchyTreeDataChange.next(treeDataSource)
          //this.dataSource.data  = treeDataSource
          // this.dataSource.data = this.buildHierarchyTree(heirarchy.data)
          // this.authService.treeDataChange.next(treeDataSource);
          this.selectedNode = this.treeControl.dataNodes[0]
          this.showNodeInfo = true
          this.setNodeInfoFormValidators()
          console.log("Tree:",this.dataSource.data)
          this.showSpinner = false
          this.heirarchyTree = true

          console.log("USerSELECTED NODE:",JSON.parse(localStorage.getItem('userSelectedNodeID')))
          let userSelectedNodeID = JSON.parse(localStorage.getItem('userSelectedNodeID')) ? JSON.parse(localStorage.getItem('userSelectedNodeID')) : this.selectedNode.NodeID
          console.log("USerSELECTED NODE AFTER:",userSelectedNodeID)
          let selectedLevelNode = this.treeControl.dataNodes.findIndex(levelNode => {
            return levelNode.NodeID == userSelectedNodeID;
          })
          console.log("selectedLevelNode IBNDEX:",selectedLevelNode)
          selectedLevelNode = selectedLevelNode == -1 ? 0 : selectedLevelNode
          this.selectedNode = this.treeControl.dataNodes[selectedLevelNode]
          this.expandHierarchy(this.selectedNode)
          
        }else if(heirarchy && heirarchy.data.length < 1){
          this.showSpinner = false
          this.heirarchyTree = false
          this.router.navigate(['dashboard/create-enterprise'], { skipLocationChange: true });
        }

      }
    })
  }

  setNodeInfoFormValidators(){
    let notes = this.NodeInfo.get('Notes');
    let name = this.NodeInfo.get('Name');

    if(this.showNodeInfo){
      console.log("this.selectedNode:",this.selectedNode)          
      //description.setValue(this.selectedNode.NodeInfo)
      //description.setValidators([Validators.required]);
      if(this.selectedNode.NodeInfo != null){
        this.NodeInfo.patchValue(JSON.parse(this.selectedNode.NodeInfo))
      } else{
        name.setValue(this.selectedNode.NodeName)
        name.setValidators([Validators.required]); 
        notes.setValue('')
      } 
    }
  }

  expandHierarchy(selectedNode:TreeFlatNode){
    console.log("IN EXPAND:",selectedNode)
    this.expandParents(selectedNode)
    this.expandChilds(selectedNode)
    /* console.log("DATA NODES:",this.treeControl.dataNodes)
    if(selectedNode.level == 1 || selectedNode.level == 0){
      this.treeControl.expand(this.treeControl.dataNodes[0])
      this.treeControl.expand(this.treeControl.dataNodes[this.findIndexOfParentNode(selectedNode.NodeID)])
    }else if(selectedNode.level > 1){
      this.treeControl.expand(this.treeControl.dataNodes[0])
      let uprootLevel = selectedNode.level - 1
      this.expandUpRootLevels(selectedNode, uprootLevel)
      
    } */
    this.userSelectedNode(selectedNode)
  }

  expandChilds(selectedNode: TreeFlatNode){
    console.log("##$$:",this.findIndexOfParentNode(selectedNode))
    // this.nodeExpanded = true
    this.treeControl.expand(this.treeControl.dataNodes[this.findIndexOfParentNode(selectedNode)])
  }

 

  expandParents(node: TreeFlatNode) {
    const parent = this.getParent(node);
    this.treeControl.expand(parent);
    if (parent && parent.level > 0) {
      this.expandParents(parent);
    }
  }

  userSelectedNode(node:TreeFlatNode){
    console.log("Selected Node:",node)
    this.additionalPropertiesFields = []
    if(node){
      this.getSelectedNodes(node)
      // this.getAddtionalPropertiesFromDb(node) // Uncomment For Additional properties
      // this.getAdditionalPropertyEmptyFields(node)
    }
  }

 /*  expandCollapseAll(){
    this.expandAll = !this.expandAll
    if(this.expandAll){
      this.treeControl.expandAll()
    }else{
      this.treeControl.collapseAll()
    }    
  } */

  onSubmitNodeInfoForm(nodeName, nodeInfo, AddtnlProperty){
    console.log("Nodetype :",this.assignedLevelType)
    // console.log("ADDTNL :",AddtnlProperty.value)
    /* for(let key in AddtnlProperty){
      if(AddtnlProperty[key] === false){
        this.updateAddtnlProperty(this.selectedNode.NodeID)
      }
    } */
    this.showProgressSpinner = true
    this.FacilitySpinnerRes = true
    let updatejsonObj = {
      uid : this.selectedNode.Uid,
      nodeName : nodeName,
      nodeType : this.assignedLevelType && this.assignedLevelType.LevelType ? this.assignedLevelType.Name : this.selectedNode.NodeType,
      typeOf : this.assignedLevelType && this.assignedLevelType.LevelType ? this.assignedLevelType.LevelType : this.selectedNode.TypeOf,
      nodeInfo: nodeInfo,
      // additionalProperties : AddtnlProperty.value
      additionalProperties :''
    }
    this.updateNodeInfoForm(updatejsonObj)
  }

  updateNodeInfoForm(updatejsonObj){
    console.log("node info:",updatejsonObj)
    this.authService.updateNodeInfo(updatejsonObj,(res,err)=>{
      if(err){
        this.showProgressSpinner = false
        console.log("error while updating the node info:",err)
        this.showToaster("Internal error while Updating", false)
        this.FacilitySpinnerRes = false
      }else{
      
        this.showProgressSpinner = false
        this.FacilitySpinnerRes = false
        console.log("Success while updating the node info:",res)
        this.showToaster("Successfully Update", true)
        console.log("updatejsonObj:",updatejsonObj)
        this.updateItemNode(this.selectedNode, updatejsonObj.nodeName, updatejsonObj.nodeInfo, updatejsonObj.typeOf, updatejsonObj.nodeType)
      }

    })
  }

  async updateItemNode(selectedNode: TreeFlatNode, updatedNodeName, updatedNodeInfo, nodeTypeOf, nodeType){
    const currentNode = this.flatNodeMap.get(selectedNode);
    console.log("newNode:",updatedNodeInfo)
    console.log("nodeTypeNodeType:",nodeTypeOf)
    currentNode.NodeName = updatedNodeName
    currentNode.NodeType = nodeType
    currentNode.TypeOf = nodeTypeOf
    currentNode.NodeInfo = JSON.stringify(updatedNodeInfo)
    this.assignIconsToHierarchyLevels(currentNode)
    this.facilityFormData = currentNode
    this.hierarchyTreeDataChange.next(this.hierarchyTreeData)
    this.expandChilds(selectedNode)
  }

  async buildHierarchyTree(array){
    let map = {};
    for(let i = 0; i < array.length; i++){
        let obj = array[i];
        this.assignIconsToHierarchyLevels(obj)
        obj.children= [];
        
        map[obj.NodeID] = obj;
        let parent = obj.ParentID || '-';
        if(!map[parent]){
            map[parent] = {
                children: []
            };
        }
        map[parent].children.push(obj);        
        map[parent].children = await this.sortHierarchy(map[parent].children)
    }
    return map['-'].children;
  }

  sortHierarchy(children){
    return children.sort((a, b) => (a.NodeType > b.NodeType) ? 1 : (a.NodeType === b.NodeType) ? a.NodeName.toLowerCase().localeCompare(b.NodeName.toLowerCase()) : -1 )
  }


  assignIconsToHierarchyLevels(obj){
    console.log("OBJ@@@@@@@@@@%%%%:",obj)
    console.log("typeof Number:",typeof obj.TypeOf)

    if(obj && obj.ParentID === null){
      console.log("APPLOCAL KEYS:",this.AppLocalKeys)
      obj.icon = this.AppLocalKeys.defaultHierarchyRootIcon
    }else if(obj && obj.PluginID !== null){
      if(this.detectedPlugins && this.detectedPlugins.length > 0){
        //registerdPlugin = this.activeAndInactiveplugins.find(data => obj.PluginID == data.PluginID)
        let pluginData = this.detectedPlugins.find(pluginData => pluginData.Uid === obj.PluginID)
        return obj.icon = pluginData && pluginData.IconUrl ? pluginData.IconUrl : ''
      }else{
        return obj.icon = ''
      }
    }else if(obj){
      if(this.hierarchyLevelSettings && this.hierarchyLevelSettings.length > 0){
        let level = this.hierarchyLevelSettings.find(level => level.LevelType === parseInt(obj.TypeOf))
        console.log("LEVEL TYPE &&&&&&&&&:",level)
        let image = level ? level.Image ? level.Image.split(',') : [] : [];
        obj.icon = image ? image.length>0 ? image[1] : '' : '';
        return obj
      }else {
        return obj.icon = ''
      }
    }else{
      return obj.icon = ''
    }
  }


  showToaster(toastMsg, isSuccess){
    console.log("TOASTER :",toastMsg + "success :",isSuccess)
    this.displayToast = {
      show : true,
      message : toastMsg,
      success : isSuccess
    }

    setTimeout(()=>{
      this.displayToast.show = false
    },2000)
  }



/*   updateAddtnlProperty(nodeId){
    let obj ={
      nodeId : nodeId,
      value : false
    }
    this.authService.updateAdditonalProperty(obj,(res, err)=>{

    })
  } */






  getParent(node: TreeFlatNode) {
    const { treeControl } = this;
    const currentLevel = treeControl.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = treeControl.dataNodes[i];

      if (treeControl.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
  }




  /* expandUpRootLevels(selectedNode, uprootLevel){
    if( uprootLevel > 0){
      let upRootLevelIndex = this.findIndexOfParentNode(selectedNode.ParentID)
      this.treeControl.expand(this.treeControl.dataNodes[upRootLevelIndex])
      uprootLevel = uprootLevel - 1 
      this.expandUpRootLevels(this.treeControl.dataNodes[upRootLevelIndex], uprootLevel)
    }
    
  } */

  findIndexOfParentNode(parentId){
    console.log("PARENT NODE:",parentId)
    console.log("TREE CONTROL:",this.treeControl.dataNodes)
    return this.treeControl.dataNodes.findIndex(levelNode => {
      return levelNode.NodeID == parentId.NodeID;
    })
  }


  /* getAllPluginsFromDb(){
    this.authService.getActiveInactivePluginsList((plugins,err)=>{
      if(err){
        console.log("Error while getting the plugins form DB:",err);
        this.activeAndInactiveplugins = []
      }else{
        console.log("SUCCES while getting the plugins form DB:",plugins);
        if(plugins && plugins.data){
          this.activeAndInactiveplugins = plugins.data
        }
      }
     
    })
  } */

  getHierarchyLevelSettings(){
    this.authService.getHeirarchyLevel((res,err)=>{
      if(err){
        console.log("Error while fetching the hierarchy level settings:",err)
      }else if(res && res.data && res.data.hierarchyLevels && res.data.hierarchyLevels.LevelData.length > 0){
        console.log("Hierarchy Level settings:",res.data)
        let levels = res.data.hierarchyLevels
        console.log("Hierarchy Level settings:",levels)
        // this.hierarchyLevelSettings = res.data.hierarchyLevels[0].LevelData ? res.data.hierarchyLevels[0].LevelData.levels ? res.data.hierarchyLevels[0].LevelData.levels : "" :  ""
        let hierarchyLevelSettings = levels && levels.length < 1 ? [] : this.sortingOfLevels(levels.LevelData)
        hierarchyLevelSettings.push(hierarchyLevelSettings.shift())
        // hierarchyLevelSettings.length > 0 ? hierarchyLevelSettings.push(hierarchyLevelSettings.shift()) : ''
        // console.log("-------------->Hierarchy Level settings:",hierarchyLevelSettings)
        this.hierarchyLevelSettings = hierarchyLevelSettings
        console.log("@@## Hierarchy Level settings:",this.hierarchyLevelSettings)
      }else{
        this.hierarchyLevelSettings = []
      }

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



  /* async getPluginData(pluginId){
    console.log("getPlugin Data:",pluginId)
    return await this.activeAndInactiveplugins.find(data => pluginId == data.PluginID)
  } */

  getAdditionalPropertyEmptyFields(node:TreeFlatNode,insertedPropertyFields){
    this.authService.getAdditionalPropertiesMaster((propertyFields:any, error:any)=>{
      if(error){
        this.additionalPropertiesFields = []
        console.log("Error while getting the additional property:",error)
        this.getSelectedNodes(node)
      }else{
        console.log("Succes getting the additional property:",propertyFields)
        if(insertedPropertyFields){
          insertedPropertyFields.forEach(property => {
            propertyFields.data.forEach(element => {
              if(element.Id == property.AddtnlPropertyMasterId){
                element.Value = property.Value
              }
            });
          });
        }
        this.rawAddtnlPropertiesFields = JSON.stringify(propertyFields.data)
        this.additionalPropertiesFields = propertyFields.data
        this.AdditoinalPropertiesForm = this.authService.convertToFormGroup(propertyFields.data)
        this.getSelectedNodes(node)
        
      }
    })
  }

  getAddtionalPropertiesFromDb(node:TreeFlatNode){
    this.authService.getAdditionalPropertiesWithNodeUid(node.Uid,(propertyFields:any, error:any)=>{
      if(propertyFields){
        console.log("IN RESPONSE :",propertyFields.data)
        this.getAdditionalPropertyEmptyFields(node,propertyFields.data)
      }else{
        console.log("IN error :",error)
        this.getAdditionalPropertyEmptyFields(node,'')
      }
      
    })
  }




  getSelectedNodes(node:TreeFlatNode){
    this.selectedNode = node
    let selectedNodeType = []
    let lastLevelOfHierarchyLevels
    console.log("$$$%%%$####: ",this.hierarchyLevelSettings)
    if(this.hierarchyLevelSettings && this.hierarchyLevelSettings.length > 0){
      selectedNodeType = this.hierarchyLevelSettings.filter(level => level.LevelType == node.TypeOf)
      console.log("$$$%%%$####: ",selectedNodeType[0])
      this.assignedLevelType = selectedNodeType[0]
      lastLevelOfHierarchyLevels = this.hierarchyLevelSettings[this.hierarchyLevelSettings.length - 1]
    }else{
      this.assignedLevelType = selectedNodeType
    }  
    
    localStorage.setItem('userSelectedNodeID',JSON.stringify(node.NodeID))
    if(node.PluginID != null && this.detectedPlugins && this.appConfigInfo){
      this.showIframe = true
      this.showNodeForm = false
      this.showFacility = false
      this.showIframeLoader = true
      this.showSingleInstanceApp = false
      this.selectedNodeUrl= ''
      let selectedPlugin = this.detectedPlugins.filter(pluginData => pluginData.Uid == node.PluginID)
      console.log("Selected PLUGIN data:",selectedPlugin)
      // let url = selectedPlugin[0].url + ':' + selectedPlugin[0].serverPort +'/#/addelement' + '/'+node.NodeID+'/'+this.currentUser.userName+'/'+node.NodeName        
      this.hideUpdateBtnWhenMSAS = false
      let url = selectedPlugin[0].BaseUrl + ':' + selectedPlugin[0].UiPort + selectedPlugin[0].UiUrls.showElement +'/'+ node.Uid
      this.selectedNodeUrl= this.sanitizer.bypassSecurityTrustResourceUrl(url);
      console.log("SAFE URL :",this.selectedNodeUrl)
    }else if(lastLevelOfHierarchyLevels && (node.TypeOf == lastLevelOfHierarchyLevels.LevelType)){
      // console.log("%%%%&&&:",JSON.parse(this.rawAddtnlPropertiesFields))
      this.facilityFormData = node
      // this.facilityFormData.additionalPropertiesFields = JSON.parse(this.rawAddtnlPropertiesFields) // Uncomment for Additional fields
      this.facilityFormData.additionalPropertiesFields = ''
      this.showIframe = false
      this.showNodeForm = false
      this.showFacility = true
      this.showSingleInstanceApp = false
    }else{
      this.showIframe = false
      this.showNodeForm = true
      this.showFacility = false 
      this.showSingleInstanceApp = false
      this.setNodeInfoFormValidators()
    }
  }

  // selectedSingleInstanceApplication(singleInstanceApp){
  //   console.log("singleInstanceApp:",singleInstanceApp)
  //   // this.expandCollpaseTree()
  //   this.expandTreeView = false
  //   this.leftPanColumn = 1
  //   this.rightPanColumn = 11
  //   this.showIframe = false
  //   this.showNodeForm = false
  //   this.showFacility = false
  //   this.showIframeLoader = true
  //   this.showSingleInstanceApp = true
  //   this.selectedNode = this.treeControl.dataNodes[-1]
  //   let url = singleInstanceApp.baseUrl + ':' + singleInstanceApp.uiPort
  //   this.selectedNodeUrl= this.sanitizer.bypassSecurityTrustResourceUrl(url);

  // }

  selectedSingleInstanceApplication(singleInstanceApp){
    console.log("singleInstanceApp:",singleInstanceApp)
    // // this.expandCollpaseTree()
    // this.expandTreeView = false
    // this.leftPanColumn = 1
    // this.rightPanColumn = 11
    // this.showIframe = false
    // this.showNodeForm = false
    // this.showFacility = false
    // this.showIframeLoader = true
    // this.showSingleInstanceApp = true
    // this.selectedNode = this.treeControl.dataNodes[-1]
    // let url = singleInstanceApp.BaseUrl + ':' + singleInstanceApp.UiPort + JSON.parse(singleInstanceApp.UiUrls).home
    //this.selectedNodeUrl= this.sanitizer.bypassSecurityTrustResourceUrl(url);
    let jsonData= {
      singleInstanceAppInfo : singleInstanceApp,
      rootNodeInfo : this.treeControl.dataNodes[0]
    }
    this.authService.selectedPlugin.next(jsonData)
    // this.authService.selectedPluginUrl.next(this.sanitizer.bypassSecurityTrustResourceUrl(url))
    this.router.navigate(['dashboard/app'], { skipLocationChange: true });

  }

  getPluginIframeContentWindow(){
    let iframe = document.getElementById('pluginiframe');
    if (iframe == null) return false;
    return (<HTMLIFrameElement>iframe).contentWindow;
  }

  getPluginIframeContentWindow1(){
    console.log("##$$$:,",event)
    document.getElementById('pluginiframe').onerror = (event)=>{
      console.log("##$$$:,22233",event)
      alert('myframe is loaded');
    };
  }

  onLoadSuccess(event){
    console.log("On LOADED SUCCES of Iframe",event)
    console.log("On LOADED SUCCES of Iframe",event.contentWindow)
    this.getPluginIframeContentWindow1()
    this.showIframeLoader = false
    let url = this.selectedNodeUrl["changingThisBreaksApplicationSecurity"];
    let pluginIframeWindow = this.getPluginIframeContentWindow()
    //pluginIframeWindow.valueOf(obj)
    if(pluginIframeWindow){
      pluginIframeWindow.postMessage({accesstoken:this.currentUser.sessionId, action : 'show'}, url);
    }
   
  }

  onIframeLoadError(event){
    console.log("LOADING ERROR",event)
  }

  UpdatePluginFormData(){
    if(this.selectedNodeUrl["changingThisBreaksApplicationSecurity"]){
      this.showProgressSpinner = true
      console.log("UPSDATE URL:",this.selectedNodeUrl["changingThisBreaksApplicationSecurity"])
      let url = this.selectedNodeUrl["changingThisBreaksApplicationSecurity"];

      let pluginIframeWindow = this.getPluginIframeContentWindow()
      if(pluginIframeWindow)
      pluginIframeWindow.postMessage({accesstoken:this.currentUser.sessionId, action : 'update'}, url);
    }else{
      this.showProgressSpinner = false
      window.alert("Plugin Url Not found")
    }

  }

  addElement(node:TreeFlatNode){
    console.log(node)
    if(node){
      let plugins = []
      this.detectedPlugins.forEach(plugin => {
        // console.log("%&&&&&&&&&&&& Condition:"+"Plugin:"+plugin.Name+":-->",(plugin && plugin.Instances && (plugin.Instances > 1) && (plugin.Type && ((plugin.Type).toLowerCase() != 'default') || plugin.Type != '' )))
        if((plugin && plugin.Instances && (plugin.Instances > 1) && (plugin.Type && ((plugin.Type).toLowerCase() != 'default') || plugin.Type != '' ) && plugin.ServicesEnabled === true)){
          // if(plugin &&(plugin.ServicesEnabled === true)){
            plugins.push(plugin)
          // }          
        }
      });
      const dialogRef = this.dialog.open(AddElementComponent,{
        data: {
          nodeData: node,
          detectedPlugins : plugins
        },
        width:'1450px'
      });
  
      dialogRef.afterClosed().subscribe((result) => {
        if(result){
          console.log("AFTER DIALOG CLOSED:",result)
          this.showToaster("Successfully added to hierarchy", result)
          let newNodesArr = result.newNode ? result.newNode : []
          newNodesArr.forEach(newNode => {
            this.addNewItem(result.parentNode,newNode)
          });
          
        }
      })

    }else{
      window.alert("Please select one of the level in heirarchy tree")
    }

  }

 /*  refreshTree(){
    let _data = this.dataSource.data;
    this.dataSource.data = null;
    this.dataSource.data = _data;
  } */

  async addNewItem(node: TreeFlatNode,newNode: TreeNode) {
    const parentNode = this.flatNodeMap.get(node);
    console.log("newNode:",newNode)
    newNode.children = []
    newNode = await this.assignIconsToHierarchyLevels(newNode)
    // let parentOfFlat = this.treeControl.getChildren(node)
    // console.log("+++++++++++++++++++++--->:",parentOfFlat)
    /* if(parentNode.children){
      parentNode.children.push(newNode)
    }
    console.log("@@@###parentNode:",parentNode)
    this.transformer(parentNode,node.level) */
    //this.treeControl.dataNodes[this.findIndexOfParentNode(node.NodeID)].expandable = true
    this.insertItem(node, parentNode,newNode)
  }
  
  async insertItem(currentNode:TreeFlatNode, parent: TreeNode, newNode: TreeNode){
    if (parent.children) {
      parent.children.push(newNode);     
      // parent.children.push(newNode as TreeFlatNode);
      // parent.children = await this.sortHierarchyTree(parent.children)
      // parent.children = await this.sortHierarchyTreeWithName(parent.children)
      parent.children = await this.sortHierarchy(parent.children)
      // this.refreshTree()
      this.hierarchyTreeDataChange.next(this.hierarchyTreeData)
      this.expandChilds(currentNode)

      let addedChildNode = this.treeControl.dataNodes.filter(addedNode => addedNode.NodeID == newNode.NodeID)
      console.log("ADDED CHILD NODE:",addedChildNode[0])
      this.userSelectedNode(addedChildNode[0])      
    }    
  }





  expandCollpaseTree(){
    this.expandTreeView = !this.expandTreeView
    if(this.expandTreeView){
      this.leftPanColumn = 3
      this.rightPanColumn = 9
    }else if(!this.expandTreeView){
      this.leftPanColumn = 1
      this.rightPanColumn = 11
    }
  }

  showFacilitiesList(){
    let facilitiesId = this.hierarchyLevelSettings && this.hierarchyLevelSettings.length != 0 ? this.hierarchyLevelSettings[this.hierarchyLevelSettings.length - 1].LevelType : 0
    const dialogRef = this.dialog.open(FacilitiesListComponent,{
      data : {
        facilitiesId : facilitiesId,
        hierarchyTreeData : this.treeControl.dataNodes
      },
      width:'1450px'
    });

    dialogRef.afterClosed().subscribe((res) => {
      console.log("Closing facilities list:",res)
      if(res.msg == "navigateToNode"){
        this.selectedTreeNode(res.response)
      }else if(res.msg == "newNodes"){
        res.response.parentNodes.forEach(parentNode => {
          res.response.newNodes.forEach(newNode => {
            this.addNewItem(parentNode,newNode)
          });
        });
      }
      
    })
  }

  removeElement(node:TreeFlatNode){
    console.log("removalbe Node:",node)
    if(node && node.Uid){
      const currentNode = this.flatNodeMap.get(node);
      if(node.ParentID != null){
        this.authService.deleteHeirarchyNode(node.Uid,(result,err)=>{
          if(err){
            console.log(err)
            this.showToaster("internal error while deleting", false)
          }else{
            this.showToaster("Succesfully deleted", true)
            console.log("node fro root:",this.hierarchyTreeData[0])
            this.findChildNodeAndRemove(currentNode,this.hierarchyTreeData[0])
          }
        })
      }else{
        window.alert("Cannot able to delete the root")
      }
    }else{
      window.alert("Please select one of the level in heirarchy tree")
    }


  }

  findChildNodeAndRemove(currentNode:TreeNode, rootNode: any){
    console.log("currentNode :" , currentNode );
    console.log( " rootNode:" , rootNode);
    const index = rootNode.children.indexOf(currentNode);
    console.log("INDEX:",index)
    if (index !== -1) {     
      console.log("INDEXWW:",index)
      let parentNodeOfSelected = this.getParent(this.selectedNode)
      console.log("parentNodeOfSelected",this.selectedNode)
      rootNode.children.splice(index,1)
      this.hierarchyTreeDataChange.next(this.hierarchyTreeData)
      this.userSelectedNode(parentNodeOfSelected)
    }else{
      if(rootNode && rootNode.children){
        for (let element in rootNode.children) {
          console.log("Recursive " ,element);
          console.log("Recursive " , rootNode.children[element]);
          if (rootNode.children[element]) {
            // return this.findParent(id, node.children[element]);
            this.findChildNodeAndRemove(currentNode, rootNode.children[element])
          } else {
            continue;
          }
        }
      }
    }
  }

  

/*   public findParent(id: number, node: any):any {

    console.log("id " + id + " node" + node.Id);
    if (node != undefined && node.Id == id) {
      console.log("coming to after check id " );
      return node;
    } else {
      console.log("ELSE " ,node.children);
      if(node && node.children)
      for (let element in node.children) {
        console.log("Recursive " ,element);
        console.log("Recursive " , node.children[element]);
        if (node.children[element]) {
          return this.findParent(id, node.children[element]);
        } else {
          continue;
        }


      }

    }
  } */


  createEnterprise(){
    console.log(this.enterpriseFormControl.value)
    console.log("moment:",moment().valueOf())
    if(this.enterpriseFormControl.value && this.currentUser.userName){
      let enterpriseObj:NodeCreation = {
        nodeName : this.enterpriseFormControl.value,
        nodeShortName : this.enterpriseFormControl.value,
        parentId: null,
        pluginId:null,
        nodeType: 'enterprise-hierarchy',
        typeOf : 'enterprise-configurartor',
        nodeInfo : null,
        isActive:true
      }
      this.authService.saveToHierarchy(enterpriseObj,(res,err)=>{
        if(err){
          this.showEnterpriseSaveError = err          
        }else{
          this.getTreeList()
          console.log("in heirarchy component, rep of saving enterprise:",res)
        }
      })
    }
  }

  showDetectedPluginCommands(detectedPlugin){
    console.log("Detetced plugin data:",detectedPlugin)
    this.showDetectedPluginData = detectedPlugin
  }

  searchInHierarchy(text){
    //console.log("Search text:",this.treeControl.dataNodes)
    if(text){
     this.searchedHierarchyList = []
      this.showHierarchyTree = false
      this.showSearchList = true
      this.treeControl.dataNodes.forEach(list => {
        if(list.NodeName.toLowerCase().indexOf(text.toLowerCase()) != -1){
          this.searchedHierarchyList.push(list)
        }
          
      });

    }else{
      //this.searchedHierarchyList = []

      this.showHierarchyTree = true
      this.showSearchList = false
    }

  }

  selectedTreeNode(list){
    //this.treeControl.dataNodes.find(node=> node.NodeID == list.NodeID)

    let selectedLevelNode = this.treeControl.dataNodes.findIndex(levelNode => {
      return levelNode.NodeID == list.NodeID;
    })
    console.log("selectedLevelNode IBNDEX:",selectedLevelNode)
    this.selectedNode = this.treeControl.dataNodes[selectedLevelNode]
    this.showHierarchyTree = true
    this.showSearchList = false
    this.searchText = ''
    this.expandHierarchy(this.selectedNode)
  }

  updatePluginResponse(responseData){
    responseData.forEach(node => {
      let selectedLevelNode = this.treeControl.dataNodes.findIndex(levelNode => {
        return levelNode.NodeID == node.NodeID;
      })
      let selectedNode = this.treeControl.dataNodes[selectedLevelNode]
      const currentNode = this.flatNodeMap.get(selectedNode);
      currentNode.NodeName = node.NodeName
      this.hierarchyTreeDataChange.next(this.hierarchyTreeData)
      this.expandChilds(selectedNode)
    });
  }

  renderPluginUrl(iconUrl){
    if(iconUrl){
      iconUrl = 'data:image/png;base64,'+iconUrl
      return this.sanitizer.bypassSecurityTrustResourceUrl(iconUrl);
    }else{
      return 'assets/icons/default-icon.png';
    }
  }

  /*************** DRANG AND DROP HIERARCHY TREE *************************/
  handleDragStart(event, node) {
    // Required by Firefox (https://stackoverflow.com/questions/19055264/why-doesnt-html5-drag-and-drop-work-in-firefox)
    // event.dataTransfer.setData(node);
    // event.dataTransfer.setDragImage(node, 0, 0);
    this.dragNode = node;
    this.treeControl.collapse(node);
  }

  handleDragOver(event, node) {
    // console.log("DRAGing NODE:",node)
    event.preventDefault();

    // Handle node expand
    if (node === this.dragNodeExpandOverNode) {
      if (this.dragNode !== node && !this.treeControl.isExpanded(node)) {
        if ((new Date().getTime() - this.dragNodeExpandOverTime) > this.dragNodeExpandOverWaitTimeMs) {
          this.treeControl.expand(node);
        }
      }
    } else {
      this.dragNodeExpandOverNode = node;
      this.dragNodeExpandOverTime = new Date().getTime();
    }

    // Handle drag area
    // const percentageX = event.offsetX / event.target.clientWidth;
    const percentageY = event.offsetY / event.target.clientHeight;
    if (percentageY < 0.25) {
      this.dragNodeExpandOverArea = 'above';
    } else if (percentageY > 0.75) {
      this.dragNodeExpandOverArea = 'below';
    } else {
      this.dragNodeExpandOverArea = 'center';
    }
  }

/*   handleDrop(event, node) {
    event.preventDefault();
    if (node !== this.dragNode) {
      let newItem: TreeNode;
      if (this.dragNodeExpandOverArea === 'above') {
        newItem = this.copyPasteItemAbove(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node));
      } else if (this.dragNodeExpandOverArea === 'below') {
        newItem = this.copyPasteItemBelow(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node));
      } else {
        newItem = this.copyPasteItem(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node));
      }
      // this.deleteItem(this.flatNodeMap.get(this.dragNode));
      this.removeElement(this.dragNode)
      this.treeControl.expandDescendants(this.nestedNodeMap.get(newItem));
    }
    this.dragNode = null;
    this.dragNodeExpandOverNode = null;
    this.dragNodeExpandOverTime = 0;
  } */
  async handleDrop(event, node) {
    event.preventDefault();
    console.log("NODE:",node)
    console.log("draged node:",this.dragNode)
    console.log("this.dragNodeExpandOverArea:",this.dragNodeExpandOverArea)
    if (node !== this.dragNode && (this.dragNode.ParentID !== node.NodeID)) {
      let newItem: TreeNode;
      if (this.dragNodeExpandOverArea === 'above') {
        newItem = this.copyPasteItemAbove(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node));
      } else if (this.dragNodeExpandOverArea === 'below') {
        newItem = this.copyPasteItemBelow(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node));
      } else {
        // let updatejsonObj = {
        //   uid : this.dragNode.Uid,
        //   parentNodeId : node.NodeId
        // }
        // let changedNode = await this.updateNodeInfoForm1(updatejsonObj)
        // let changedNode = this.dragNode 
        // changedNode.ParentID= node.NodeID
        // changedNode.Uid= 'ABcd-123-dsdvgfb'
        // newItem = this.copyPasteItem(changedNode, this.flatNodeMap.get(node));
        newItem = this.copyPasteItem(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node));
      }
      console.log("*****************************************************",newItem)
      this.deleteItem(this.flatNodeMap.get(this.dragNode));
      // this.removeElement(this.dragNode)
      // this.treeControl.expandDescendants(this.nestedNodeMap.get(newItem));
    }
    // this.dragNode = null;
    // this.dragNodeExpandOverNode = null;
    // this.dragNodeExpandOverTime = 0;
  }

  handleDragEnd(event) {
    this.dragNode = null;
    this.dragNodeExpandOverNode = null;
    this.dragNodeExpandOverTime = 0;
  }

  deleteItem(node: TreeNode) {
    console.log("DELETE NODE:",node)
    // this.deleteNode(this.hierarchyTreeData[0], node);
    this.deleteNode(this.hierarchyTreeData[0].children, node);
    // this.findChildNodeAndRemove(node,this.hierarchyTreeData[0])
    this.hierarchyTreeDataChange.next(this.hierarchyTreeData);
  }

  

  deleteNode(nodes: TreeNode[], nodeToDelete: TreeNode) {
    const index = nodes.indexOf(nodeToDelete.Uid, 0);
    if (index > -1) {
      nodes.splice(index, 1);
    } else {
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          this.deleteNode(node.children, nodeToDelete);
        }
      });
    }
  }

  deleteNode1(rootNode: any,currentNode:TreeNode) {
    /* const index = nodes.findIndex(treeNode => {
      return treeNode.Uid == nodeToDelete.Uid;
    })
    console.log("nodes:",nodes)
    console.log("index:",index)
    if (index > -1) {
      nodes.splice(index, 1);
    } else {
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          // this.deleteNode(node.children, nodeToDelete);
        }
      });
    } */
   /*  console.log("currentNode :" , currentNode );
    console.log( " rootNode:" , rootNode);
    const index = rootNode.children.findIndex(treenode => {
      console.log("+++++++++++++++> UID:",treenode)
      return treenode.Uid === currentNode.Uid
    });
    console.log("INDEX:",index)
    if (index > -1) {
     
      console.log("INDEXWW:",index)
      // let parentNodeOfSelected = this.getParent(this.selectedNode)
      
      rootNode.children.splice(index,1)
      console.log("---------> After rootNode delete",rootNode)
      // this.hierarchyTreeDataChange.next(this.hierarchyTreeData)
      // this.userSelectedNode(parentNodeOfSelected)
    }else{
      if(rootNode && rootNode.children){
        for (let element in rootNode.children) {
          console.log("Recursive " ,element);
          console.log("Recursive " , rootNode.children[element]);
          if (rootNode.children[element]) {
            // return this.findParent(id, node.children[element]);
            this.deleteNode(rootNode.children[element],currentNode)
          } else {
            continue;
          }
  
  
        }
      }
    } */
  }


insertItem1(parent: TreeNode, fromNode: TreeNode): TreeNode{
  if (!parent.children) {
    parent.children = [];
  }
  const newItem = fromNode;
  
  parent.children.push(newItem);
  this.hierarchyTreeDataChange.next(this.hierarchyTreeData);
  return newItem;
}
  copyPasteItem(from: TreeNode, to: TreeNode) {
    const newItem = this.insertItem1(to,from);
    
    // const newItem = this.addNewItem(this.selectedNode,to)
    if (from.children) {
      from.children.forEach(child => {
        this.copyPasteItem(child, newItem);
      });
    }
    return newItem;
  }

  copyPasteItemAbove(from: TreeNode, to: TreeNode): TreeNode {
    const newItem = this.insertItemAbove(to, from);
    if (from.children) {
      from.children.forEach(child => {
        this.copyPasteItem(child, newItem);
      });
    }
    return newItem;
  }

  copyPasteItemBelow(from: TreeNode, to: TreeNode): TreeNode {
    const newItem = this.insertItemBelow(to, from);
    if (from.children) {
      from.children.forEach(child => {
        this.copyPasteItem(child, newItem);
      });
    }
    return newItem;
  }

  insertItemAbove(node: TreeNode, fromNode: TreeNode): TreeNode {
    const parentNode = this.getParentFromNodes(node);
    // const parentNode = this.getParent(this.selectedNode);
    const newItem = fromNode;
    if (parentNode != null) {
      parentNode.children.splice(parentNode.children.indexOf(node), 0, newItem);
    } else {
      this.hierarchyTreeData.splice(this.hierarchyTreeData.indexOf(node), 0, newItem);
    }
    this.hierarchyTreeDataChange.next(this.hierarchyTreeData);
    return newItem;
  }

  insertItemBelow(node: TreeNode, fromNode: TreeNode): TreeNode {
    const parentNode = this.getParentFromNodes(node);
    const newItem = fromNode;
    if (parentNode != null) {
      parentNode.children.splice(parentNode.children.indexOf(node) + 1, 0, newItem);
    } else {
      this.hierarchyTreeData.splice(this.hierarchyTreeData.indexOf(node) + 1, 0, newItem);
    }
    this.hierarchyTreeDataChange.next(this.hierarchyTreeData);
    return newItem;
  }





/*  async updateNodeInfoForm1(updatejsonObj){
    console.log("node info:",updatejsonObj)
    return this.authService.updateNodeParentId(updatejsonObj,(res,err)=>{
      if(err){
        console.log("error while updating the node info:",err)
        this.showToaster("Internal error while Updating", false)
      }else{
        console.log("Success while updating the node info:",res)
        this.showToaster("Successfully Update", true)
        console.log("updatejsonObj:",updatejsonObj)
        return updatejsonObj
      }

    })
  } */

  getParentFromNodes(node: TreeNode): TreeNode {
    for (let i = 0; i < this.hierarchyTreeData.length; ++i) {
      const currentRoot = this.hierarchyTreeData[i];
      const parent = this.getParentFromTreeNodes(currentRoot,node);
      if (parent != null) {
        return parent;
      }
    }
    return null;
  }

  getParentFromTreeNodes(currentRoot: TreeNode, node: TreeNode): TreeNode {
    if (currentRoot.children && currentRoot.children.length > 0) {
      for (let i = 0; i < currentRoot.children.length; ++i) {
        const child = currentRoot.children[i];
        if (child === node) {
          return currentRoot;
        } else if (child.children && child.children.length > 0) {
          const parent = this.getParentFromTreeNodes(child, node);
          if (parent != null) {
            return parent;
          }
        }
      }
    }
    return null;
  }

  
  @HostListener('window:message', ['$event'])
  onMessage(eventFromChild) {
    console.log("eventFromChild in UPDATE :",eventFromChild)
    if(eventFromChild.data.message == 'Successfully Updated'){
      this.showProgressSpinner = false
      this.updatePluginResponse(eventFromChild.data.responseInfo.responseData)
      this.showToaster("Successfully Updated",true)
    }else if(eventFromChild.data.message == 'Error while updating'){
      this.showToaster("Error while updating",false)
      // this.showErrMsgOfUpdatingPlugin = {show:true,status:false,message:eventFromChild.data}
    }
  }
}
