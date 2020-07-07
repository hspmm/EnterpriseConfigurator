import { Injectable } from '@angular/core';
import { NodeCreation } from '../../interfaces/user';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor(private _snackBar: MatSnackBar) { }

  createNodeObj(nodeName:string, parentId:number, pluginId:number, nodeType:string, typeOf:string, nodeInfo:string, isActive:boolean){
    let nodeObj:NodeCreation = {
      nodeName : nodeName,
      nodeShortName : nodeName,
      parentId : parentId,
      pluginId : pluginId,
      nodeType : nodeType,
      typeOf : typeOf,
      nodeInfo : nodeInfo,
      isActive : isActive
    }
    return nodeObj
  }

  createFacilityObj(selectedFacility){
    console.log("In shared service :",selectedFacility)
    let FacilityObj = {
      FacilityName: selectedFacility.Name ? selectedFacility.Name : '',
      AddressLine1: selectedFacility.AddressLine1 ? selectedFacility.AddressLine1 : '',
      AddressLine2: selectedFacility.AddressLine2 ? selectedFacility.AddressLine2 : '',
      AddressLine3: selectedFacility.AddressLine3 ? selectedFacility.AddressLine3 : '',
      City: selectedFacility.City ? selectedFacility.City : '',
      State: selectedFacility.State ? selectedFacility.State : '',
      PostalCode: selectedFacility.PostalCode ? selectedFacility.PostalCode : '',
      Country: selectedFacility.Country ? selectedFacility.Country : '',
      IPRange: selectedFacility.IPRange ? selectedFacility.IPRange : '',
      Status: selectedFacility.Status ? selectedFacility.Status : '',
      Contact: selectedFacility.Contact ? selectedFacility.Contact : '',
      Email: selectedFacility.Email ? selectedFacility.Email : '',
      Department: selectedFacility.Department ? selectedFacility.Department : '',
      Phone: selectedFacility.Phone ? selectedFacility.Phone : '',
    }
    return FacilityObj;
  }

}
