import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { TreeFlatNode } from '../../../interfaces/user';
import { SharedService } from '../../../services/shared/shared.service';
import { AuthenticationService } from '../../../services/authentication.service';

@Component({
  selector: 'app-facilities-mapping',
  templateUrl: './facilities-mapping.component.html',
  styleUrls: ['./facilities-mapping.component.scss']
})
export class FacilitiesMappingComponent implements OnInit {
  selection = new SelectionModel(true, []);
  dataSourceOne = new MatTableDataSource()
  hierarchyColumns = [
    { columnDef: 'parentNodes', header: 'ParentNodes', cell: (element: any) => `${element.parentNodes}` },
    { columnDef: 'icon', header: 'Icon', cell: (element: any) => `${element.icon}` },
    { columnDef: 'name', header: 'Facility', cell: (element: any) => `${element.name}` },
    { columnDef: 'select', header: 'Select', cell: (element: any) => `${element.checkbox}` }
  ];
  displayedColumnsOne = this.hierarchyColumns.map(c => c.columnDef);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  allHierarchyNodes = []
  allSelectedHierarchyNodes = []
  mappingSucess:boolean = false

  displayToast ={
    show : false,
    message : '',
    success : false
  }

  isMobile

  constructor(public dialogRef: MatDialogRef<FacilitiesMappingComponent>, @Inject(MAT_DIALOG_DATA) public modelData: any,
    private SharedService:SharedService, private AuthService:AuthenticationService) {

  }

  ngOnInit() {
    this.createParentNodes()

  }

  applyFilter(filterValue: string) {
    this.dataSourceOne.filter = filterValue.trim().toLowerCase();
  }


  /** Whether the number of selected elements matches the total number of rows. */
  /*  isAllSelected() {
     const numSelected = this.selection.selected.length;
     const numRows = this.dataSourceOne.data.length;
     return numSelected === numRows;
   } */



  /** The label for the checkbox on the passed row */
  /* checkboxLabel(row?): string {
    console.log("CHECKBOX LABEL:",row)
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  } */

  getIndex(j) {
    return this.paginator.pageIndex == 0 ? j : j + this.paginator.pageIndex * this.paginator.pageSize
  }

  selectedNode(node:any, index:number, changedValue:boolean) {
    console.log("Selected node:", node)
    console.log("Selected index:", index)
    console.log("Selected index:", changedValue)
    if(changedValue){
      let selectedNode = this.modelData.hierarchyTreeData.filter(hNode=> {
        return hNode.Uid == node.id
      })
      console.log("Selected node:",selectedNode)
      this.allSelectedHierarchyNodes.push(selectedNode[0])
    }else if(!changedValue){
      let removableNode = this.allSelectedHierarchyNodes.findIndex(hNode=> {
        return hNode.Uid == node.id
      })
      console.log("removableNode node:",removableNode)
      this.allSelectedHierarchyNodes.splice(removableNode,1)
    }
    console.log("this.allSelectedHierarchyNodes node:",this.allSelectedHierarchyNodes)
  }

  createParentNodes() {
    let flatHierarchy = this.modelData.hierarchyTreeData
    this.iterateHierarchyTreeNodes(flatHierarchy, 0);
  }

  async iterateHierarchyTreeNodes(flatHierarchy, index) {
    console.log("index:", index)
    
    let node = flatHierarchy[index]
    console.log("node:", node)
    console.log("this.modelData.facilityId:", this.modelData.facilityId)
    console.log("compare:", parseInt(node.TypeOf) != this.modelData.facilityId)
    if (node.TypeOf != this.modelData.facilityId) {
      let nodeObj = {
        id: node.Uid,
        name: node.NodeName,
        icon: node.icon
      }
      let parentNodes = await this.createParentNodesOfHierarchyTree(node, flatHierarchy)
      parentNodes.reverse()
      let treeStructuredParentNodes = parentNodes.length > 1 ? this.createParentNodesStructure(parentNodes) : parentNodes[0]
      // console.log(" facilityParentNodes :", parentNodes)
      console.log(" treeStructuredParentNodes :", treeStructuredParentNodes)
      nodeObj["parentNodes"] = treeStructuredParentNodes
      this.allHierarchyNodes.push(nodeObj)
      this.dataSourceOne.data = this.allHierarchyNodes
      this.dataSourceOne.paginator = this.paginator;
      this.dataSourceOne.paginator.firstPage();
      this.dataSourceOne.sort = this.sort;
      if (index < flatHierarchy.length) {
        index = index + 1
        this.iterateHierarchyTreeNodes(flatHierarchy, index)
      }
    } else {
      if (index < flatHierarchy.length) {
        index = index + 1
        this.iterateHierarchyTreeNodes(flatHierarchy, index)
      }
    }
  }

  async createParentNodesOfHierarchyTree(flatNode, flatHierarchy) {
    let parentNodes = []
    let preceedingNode = await this.findPreceedingNode(flatNode.ParentID, flatHierarchy)
    console.log('preceedingNode:', preceedingNode)
    if (preceedingNode[0]) {

      parentNodes.push(preceedingNode[0].NodeName)
      if (preceedingNode[0].ParentID != null && preceedingNode[0].ParentID < flatNode.NodeID) {
        let addtnlParentNode = await this.createParentNodesOfHierarchyTree(preceedingNode[0], flatHierarchy)
        if (addtnlParentNode.length > 0) {
          addtnlParentNode.forEach(node => {
            parentNodes.push(node)
          })
        }
      }
    }
    return parentNodes
  }

  findPreceedingNode(parentId, flatHierarchy) {
    return flatHierarchy.filter(node => {
      if (node.NodeID === parentId) {
        return node
      }
    })
  }

  createParentNodesStructure(facilityParentNodes) {
    let parentNodeStructure = facilityParentNodes[0]
    for (let i = 1; i < facilityParentNodes.length; i++) {
      parentNodeStructure = parentNodeStructure + ' > ' + facilityParentNodes[i]
    }
    return parentNodeStructure
  }

  close() {
    this.dialogRef.close();
  }

  addToSelectedNodes(){
    this.mappingSucess = true
    let allMappedFacilitiesWithHierarchyTreeNodes = []
    let selectedFacility = this.modelData.selectedMapingFacility
    let facilityCreation = this.SharedService.createFacilityObj(selectedFacility)

    this.allSelectedHierarchyNodes.forEach((treeNode:TreeFlatNode) => {
      let nodeCreationObject = this.SharedService.createNodeObj(selectedFacility.Name,treeNode.NodeID,null,'enterprise-hierarchy',this.modelData.facilityId,JSON.stringify(facilityCreation),true);
      console.log("nodeCreationObject:",nodeCreationObject)
      allMappedFacilitiesWithHierarchyTreeNodes.push(nodeCreationObject)
    });
    console.log("selectedFacility:",selectedFacility)
    let json={
      facilityId : selectedFacility.Uid,
      hierarchyNodes : allMappedFacilitiesWithHierarchyTreeNodes
    }

    console.log("json:",json)

    this.AuthService.bulkCreateOfHierarchyNodes(json,(res,error)=>{
      if(error){
        console.log("Error while bulkcreate:",error)
        this.mappingSucess = false
        this.showToaster('Error while mapping facilities', false)
      }else{
        console.log("Success while bulkcreate:",res)
        this.showToaster('Successfully mapped facilities', true)
        let responseObj = {
          parentNodes : this.allSelectedHierarchyNodes,
          newNodes : res.data ? res.data : []
        }
        this.dialogRef.close(responseObj)
      }
    })
    // this.dialogRef.close(facilityMapingJson);
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
