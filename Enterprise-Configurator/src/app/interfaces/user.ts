export interface User{
    userName:string
    password:any
}
export interface NodeCreation{
    nodeName:string
    nodeShortName:string
    parentId:number
    pluginId:number
    nodeType:string
    typeOf:string
    nodeInfo : string
    isActive:boolean
   /*  CreatedDate:string
    LastModifiedDate:string
    CreatedBy:string
    ModifiedBy:string */
    
}

export class TreeFlatNode { //*****Actual tree structure that showing in the UI******
    Uid:any;
    NodeName: string;
    NodeID:number;
    ParentID:number;
    PluginID:number;
    NodeType:string;
    TypeOf:string;
    NodeInfo:string;
    icon?:any;
    level: number;
    expandable: boolean;
  }
  
export class TreeNode {  //*****Tree structure that requires to create a tree for TreeFlatNode******
    NodeName: string;
    NodeID?:number;
    Uid?:any;
    ParentID?:number;
    PluginID:number;
    NodeType:string;
    TypeOf:string;
    icon?:any;
    NodeInfo?:any;
    typeOfService?:any;
    pluggable?:boolean;
    appUrl?:any
    children?: TreeNode[];
}