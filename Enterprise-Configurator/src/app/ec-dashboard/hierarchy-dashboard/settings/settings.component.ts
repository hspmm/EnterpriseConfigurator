import { Component, OnInit, ViewChild } from '@angular/core';
import {FormBuilder, FormGroup,FormArray , FormControl, Validators, FormGroupDirective, NgForm} from '@angular/forms';

import { AuthenticationService } from '../../../services/authentication.service';

import {MatTreeNestedDataSource} from '@angular/material/tree';
import {NestedTreeControl} from '@angular/cdk/tree';

import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import { AppLocalStorageKeys } from '../../../app-storagekeys-urls';

export class TreeFlatNode { //*****Actual tree structure that showing in the UI******
  name:string;
  icon:any
  level: number;
  expandable: boolean;
}

interface FoodNode {
  name: string;
  icon:any;
  children?: FoodNode[];
}

const TREE_DATA: FoodNode[] = [
  {
    name: 'Kaiser Permanent',
    icon:'assets/icons/IconEnterprise.jpg',
    children: [
      {name: 'North Cal',icon:'assets/icons/IconRegion.jpg',
        children:[
          {name:'Campus 1',icon:'assets/icons/IconLocationSetting.jpg',
            children:[
              {name:'Facility 1',icon:'assets/icons/Facility.jpg',
                children : [
                  {name:'Mednet 1',icon:'assets/icons/IconMednet.jpg'},
                ]
              },
            ]
          }
        ]
      },
      {name: 'South Cal',icon:'assets/icons/IconRegion.jpg',
        children:[
          {name:'Campus 2',icon:'assets/icons/IconLocationSetting.jpg',
          children:[
            {name:'Facility 2',icon:'assets/icons/Facility.jpg',
              children : [
                {name:'Mednet 1',icon:'assets/icons/IconMednet.jpg'},
                {name:'Mednet 2',icon:'assets/icons/IconMednet.jpg'},
              ]
            },
            {name:'Facility 3',icon:'assets/icons/Facility.jpg',
            children : [
              {name:'Mednet 10',icon:'assets/icons/IconMednet.jpg'},
              {name:'Mednet 11',icon:'assets/icons/IconMednet.jpg'},
              {name:'Mednet 12',icon:'assets/icons/IconMednet.jpg'},
              {name:'Mednet 13',icon:'assets/icons/IconMednet.jpg'},
            ]
          },
          ]
          }
        ]
      },
    ]
  }
];


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  @ViewChild('tree',{static:false}) tree;
  serverConnectionError:boolean = false
  maxHierarchyLevels = 10
  LevelIndex:number
  iconSizeIsLarge:boolean = false
  iconResolutionIsLarge:boolean = false
  hierarchyLevels
  disableRemoveLevel:boolean = true
  // showHeirarchyLevelError
  HeirarchyForm: FormGroup
  regionIcon
  siteIcon
  facilityIcon
  selectedFileIndex:number
  formArrayItems= []
  levels: FormArray;
  // treeControl = new NestedTreeControl<FoodNode>(node => node.children);
  dataSource : MatTreeFlatDataSource<FoodNode, TreeFlatNode>;
  flatNodeMap = new Map<TreeFlatNode, FoodNode>();
  nestedNodeMap = new Map<FoodNode, TreeFlatNode>();
  treeFlattener: MatTreeFlattener<FoodNode, TreeFlatNode>;
  treeControl : FlatTreeControl<TreeFlatNode>;
  AppLocalKeys = AppLocalStorageKeys()
  // adminRole:boolean = false

  displayToast ={
    show : false,
    message : '',
    success : false
  }

  hierarchyLevelsId:number
  userPrivileges

  transformer = (node: FoodNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.name === node.name
        ? existingNode
        : new TreeFlatNode();
    flatNode.level = level;
    flatNode.icon = node.icon;
    flatNode.name = node.name;
    flatNode.expandable = node.children ? node.children.length > 0 ? !!node.children : !node.children : !node;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  constructor(private fb:FormBuilder, private authService: AuthenticationService) {
    //this.dataSource.data = TREE_DATA;
    this.HeirarchyForm = fb.group({
      levels:fb.array([
        fb.group(({
          Name: new FormControl('Region',Validators.compose([Validators.required])),
          // Strict:(true),
          LevelType:1,
          Image:new FormControl('data:image/jpg;base64,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',
                  Validators.compose([Validators.required])),
          Icon:('')
        })),
        fb.group(({
          Name:new FormControl('Campus',Validators.compose([Validators.required])),
          LevelType:2,
          Image:new FormControl('data:image/jpg;base64,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',
                  Validators.compose([Validators.required])),
          Icon:('')
        })),
        fb.group(({
          Name:new FormControl('Facility',Validators.compose([Validators.required])),
          LevelType:0,
          Image:new FormControl('data:image/jpg;base64,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',
                  Validators.compose([Validators.required])),
          Icon:('')
        })),
      ])
    })

    
    this.getSettingsFromDB()

    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TreeFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.assignPrivileges()
  }

  assignPrivileges(){
    this.userPrivileges = {
      manageHierarchyLevels : this.authService.checkPrivilege(this.AppLocalKeys.privileges.manageHierarchyLevels).length > 0
    } 
  }

  getLevel = (node: TreeFlatNode) => node.level;

  isExpandable = (node: TreeFlatNode) => node.expandable;

  getChildren = (node: FoodNode): FoodNode[] => node.children;

  hasChild = (_: number, _nodeData: TreeFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: TreeFlatNode) => _nodeData.name === '';

  ngOnInit() {
    
    // this.adminRole = this.authService.isAdminRole
    
    this.dataSource.data = TREE_DATA
    this.treeControl.expand(this.treeControl.dataNodes[0])
  }

  setStyle(i){
    let marginLeft = 100 - i*4
    return {
      'margin-left':100 - (marginLeft) +'%',
      'width':100 - i*4 +'%',
    }
  }

  createItem(levelNumber) {
    return {
      Name:new FormControl('New',Validators.compose([Validators.required])),
      LevelType:  levelNumber,
      Image:new FormControl('data:image/jpg;base64,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',
              Validators.compose([Validators.required])),
      Icon:''
    }
  }

  get formData() { return <FormArray>this.HeirarchyForm.get('levels'); }


  addLevel(control,index) {
    console.log("CCCC",index)
    let level = <FormArray>this.HeirarchyForm.controls.levels;
    if(level.value.length < this.maxHierarchyLevels)
    level.insert(index+1,this.fb.group(this.createItem(index+1)))
    this.setAddRemoveLevelBtnsEnableDisable()
  }

  RemoveLevel(index){
    let level = <FormArray>this.HeirarchyForm.controls.levels;
    console.log("LEVEL VALE:",level.value[index])
    if(level.value[index].Id == ''){
      this.showToaster('Cannot able to remove if already saved', false)
    }else if(level.value.length < 2){
      this.showToaster('Atleast one level should required',false)
    }else if (level.value.length > 1 && level.value[index].Id != ''){
      level.removeAt(index)
      this.setAddRemoveLevelBtnsEnableDisable()
    }else{
      this.showToaster('Something went wrong', false)
    }   
  }

  onFileChange(event,index,form) {
    console.log("FORM :",form.value[index])
    console.log("----------------> :")
    const reader = new FileReader();
    this.selectedFileIndex = index 
    if(event.target.files[0].size/1024/1024 < 1){
      if(event.target.files && event.target.files.length) {
        this.iconSizeIsLarge = false
        const file:File = <File>event.target.files;

        reader.readAsDataURL(file[0]);
        const img = new Image();
        img.src = window.URL.createObjectURL(file[0]);
        reader.onload = () => {
          const width = img.naturalWidth;
          const height = img.naturalHeight;
          if( width > 90 && height > 90 ){
            this.iconResolutionIsLarge = true 
            this.showToaster("icon Resolution shouldn't exceed 90x90",false)
            
          }else{
            console.log(reader.result)
            this.iconResolutionIsLarge = false
            form.value[index].Image = reader.result
          }
          console.log("FORM :",form.value[index])
        };
      }
    }else {
      this.iconSizeIsLarge = true 
      console.log("SHOW TOASTER")
      this.showToaster("icon size shouldn't exceeded 1MB",false)
    }

  }

  onSubmit(UpdatedFormData){   
    if(this.HeirarchyForm.valid && this.userPrivileges.manageHierarchyLevels){
      let UpdatedLevels = UpdatedFormData.value
      let HierarchyLevels = UpdatedLevels
      if(HierarchyLevels && HierarchyLevels.length > 0){
        console.log("FILE:",HierarchyLevels)
        console.log("levels:",this.hierarchyLevels)
        for(let i=0;i<HierarchyLevels.length;i++){
          HierarchyLevels[i].Icon = ''
          HierarchyLevels[i].LevelType = i + 1
          HierarchyLevels[i].facilityType = false
        }      
  
        HierarchyLevels[HierarchyLevels.length-1].facilityType = true
        HierarchyLevels[HierarchyLevels.length-1].LevelType = 0
        console.log("FILE:",HierarchyLevels)
        if(this.hierarchyLevels && this.hierarchyLevels.length > 0){
          let updatingLevels = {
            id : this.hierarchyLevelsId,
            levels : HierarchyLevels
          }
          console.log("UPDATING HIERARCHY LEVELS:",HierarchyLevels)
          this.authService.updateHeirarchyLevel(updatingLevels,(res,err)=>{
            if(err){
              console.log("error while updating the node info:",err)
              this.showToaster('Error While Updating', false)
            }else{
              console.log("Updated Succefully:",res)
              this.setHierarchyLevelsToForm(res.data)
              this.showToaster('Successfully Updated', true)
            }       
          })
        }else{
          console.log("SAVING HIERARCHY LEVELS:",HierarchyLevels)
          this.authService.saveHeirarchyLevel(HierarchyLevels,(res,err)=>{
            if(err){
              console.log("error while updating the node info:",err)
              this.showToaster('Error While Updating', false)
            }else{
              console.log("Saved Succefully:",res)
              let response = res.data
              if(res && res.data){
                this.hierarchyLevelsId = response.Id
                //this.hierarchyLevels = response.LevelData
                this.setHierarchyLevelsToForm(response)
                this.showToaster('Successfully Created', true)
              }    
            }
          })
        }
  
  
      }
    }else{
      this.showToaster('Please fill the required fields or you might not have access to save/update', false)
    } 

  }

  get level():FormGroup{
    return this.fb.group({
      Id : '',
      Name: '',
      LevelType: '',
      Icon:'',
      Image:''
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

setHierarchyLevelsToForm(hierarchyLevels){
  // console.log("SORTING:",hierarchyLevels)
  hierarchyLevels = hierarchyLevels.LevelData
  console.log("LEVELS:",hierarchyLevels)
  hierarchyLevels = this.sortingOfLevels(hierarchyLevels)
  console.log("LEVELS$$$$$:",hierarchyLevels)
  hierarchyLevels.push(hierarchyLevels.shift());
  this.hierarchyLevels = hierarchyLevels
  console.log("hierarchyLevels#####:",this.hierarchyLevels)
  const levels = this.HeirarchyForm.get('levels') as FormArray;
  while (levels.length) {
    levels.removeAt(0);
  }
  hierarchyLevels.forEach(() =>{
    const levels = this.HeirarchyForm.get('levels') as FormArray;
    console.log('Levels:',levels)
    levels.push(this.level)
  });
  this.HeirarchyForm.controls.levels.patchValue(hierarchyLevels)
}

  getSettingsFromDB(){
    console.log("DD",this.HeirarchyForm.controls.levels)
    this.authService.getHeirarchyLevel((res,err)=>{
      if(err){
        console.log("error while getting the node info:",err)
        this.setAddRemoveLevelBtnsEnableDisable()
        if(err.statusText="Unknown Error"){
          this.serverConnectionError = true
        }
      }else{
        console.log("Retrieved DATA:",res)
        let response = res.data
        this.maxHierarchyLevels = response.maxHierarchyLevels
        if(res && res.data && response.hierarchyLevels.length < 1){
          console.log("Elseeee:")
          this.hierarchyLevels = []
        }else{
          console.log("IFFFF:")
          this.hierarchyLevelsId = response.hierarchyLevels.Id
          this.setHierarchyLevelsToForm(response.hierarchyLevels)
        }
        this.setAddRemoveLevelBtnsEnableDisable()
      }
    })
  }

  setAddRemoveLevelBtnsEnableDisable(){
    let level = <FormArray>this.HeirarchyForm.controls.levels;
    console.log("HH:",level.value.length-1)
    console.log("HH:",level.value)
    this.LevelIndex = level.value.length-1 === 0 ? level.value.length : level.value.length-1
    if(level.value.length > 1){
      this.disableRemoveLevel = false
    }else if(level.value.length <= 3){
      this.disableRemoveLevel = true
    }
    // level.controls[this.HeirarchyForm.controls.levels.value.length-1]['controls']['Name'].disable()
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

}
