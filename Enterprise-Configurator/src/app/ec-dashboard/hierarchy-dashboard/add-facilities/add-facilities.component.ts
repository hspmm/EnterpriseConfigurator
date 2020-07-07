import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
// import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {FormBuilder, FormGroup, FormControl, Validators} from '@angular/forms';
import { AuthenticationService } from '../../../services/authentication.service';

import csc from 'country-state-city'
 
// Import Interfaces`
// import { ICountry, IState, ICity } from 'country-state-city'

@Component({
  selector: 'app-add-facilities',
  templateUrl: './add-facilities.component.html',
  styleUrls: ['./add-facilities.component.scss']
})
export class AddFacilitiesComponent implements OnInit {
  AddFacilityForm: FormGroup
  showErrMsg
  fStatus = ["Active", "InActive"]
  FacilityStatus= "Active"
  showProgressSpinner = false
  additionalPropertiesFields
  fCountries = csc.getAllCountries()
  fStates = []
  fCities = []

  AdditoinalPropertiesForm: FormGroup

  @Input() facilityFormInfo
  @Input() FacilitySpinnerRes
  @Output() updatedFacility = new EventEmitter();

  @Output() sendFacilityForm = new EventEmitter();
  @Input() triggerToSendForm

  constructor(private fb:FormBuilder,private authService: AuthenticationService) { 

    this.AddFacilityForm = fb.group({
      FacilityName: new FormControl("", Validators.compose([Validators.required])),
      AddressLine1: new FormControl(""),
      AddressLine2: new FormControl(""),
      AddressLine3: new FormControl(""),
      City: new FormControl("", Validators.compose([Validators.required])),
      State: new FormControl(""),
      PostalCode: new FormControl(""),
      Country: new FormControl(this.fCountries[0], Validators.compose([Validators.required])),
      IPRange: new FormControl(""),
      Status: new FormControl(this.FacilityStatus, Validators.compose([Validators.required])),
      Contact: new FormControl(""),
      Email: new FormControl("", Validators.compose([Validators.email])),
      Department: new FormControl(""),
      Phone: new FormControl("",Validators.compose([Validators.pattern('[0-9]{10}')])),
    })

  }

  ngOnInit() {
    
    if(this.facilityFormInfo != null){
      console.log("FORM DATA:",JSON.parse(this.facilityFormInfo.NodeInfo))
      // this.country = JSON.parse(this.facilityFormInfo.NodeInfo).Country
      // let Country = this.AddFacilityForm.get('Country');
      // Country.setValue()
      // this.AddFacilityForm.controls.levels.patchValue(hierarchyLevels)
      if(JSON.parse(this.facilityFormInfo.NodeInfo).Country){
        this.getStatesByCountry(JSON.parse(this.facilityFormInfo.NodeInfo).Country)
      }
      if(JSON.parse(this.facilityFormInfo.NodeInfo).State){
        this.getCitiesByState(JSON.parse(this.facilityFormInfo.NodeInfo).State)
      }
      this.AddFacilityForm.patchValue(JSON.parse(this.facilityFormInfo.NodeInfo))
      // this.AddFacilityForm.controls["Country"].setValue(JSON.parse(this.facilityFormInfo.NodeInfo).Country);
      // this.AddFacilityForm.setValue(JSON.parse(this.facilityFormInfo.NodeInfo))
      /* this.additionalPropertiesFields = this.facilityFormInfo.additionalPropertiesFields ? this.facilityFormInfo.additionalPropertiesFields : ''
      if(this.facilityFormInfo.additionalPropertiesFields){
        this.AdditoinalPropertiesForm = this.authService.convertToFormGroup(this.facilityFormInfo.additionalPropertiesFields)
      } */
      
    }
  }

  sendValid(value){
    console.log("VALID VALUE:",value)
    // console.log("VALID VALUE:",this.AddFacilityForm.valid)
    if(value && this.AddFacilityForm.valid){
      this.sendFacilityForm.emit({valid:true})
    }else{
      this.sendFacilityForm.emit({valid:false})
    }
   
  }

  ngOnChanges(changes){
    console.log("CHANGED@@@:",changes)
    if(this.facilityFormInfo != null){
      console.log("CHANGED:",changes)
      if(changes.facilityFormInfo){
        // this.AddFacilityForm.get('Country').patchValue(this.fCountries[0])
        /* const levels = this.AddFacilityForm.get('Country') as FormControl;
        while (levels) {
          levels.setValue(this.fCountries[0]);
        } */
        if(JSON.parse(this.facilityFormInfo.NodeInfo).Country){
          this.getStatesByCountry(JSON.parse(changes.facilityFormInfo.currentValue.NodeInfo).Country)
        }
        if(JSON.parse(this.facilityFormInfo.NodeInfo).State){
          this.getCitiesByState(JSON.parse(changes.facilityFormInfo.currentValue.NodeInfo).State)
        }
        this.AddFacilityForm.setValue(JSON.parse(changes.facilityFormInfo.currentValue.NodeInfo))
        //this.additionalPropertiesFields = changes.facilityFormInfo.currentValue.additionalPropertiesFields
        //this.AdditoinalPropertiesForm = this.authService.convertToFormGroup(changes.facilityFormInfo.currentValue.additionalPropertiesFields)
      }
     

      if(changes.FacilitySpinnerRes && !(changes.FacilitySpinnerRes.currentValue)){
        this.showProgressSpinner = false
      }
    }

    if(this.triggerToSendForm){
      this.sendFacilityForm.emit({valid:true, data:this.AddFacilityForm.value})
    }


  }

  getStatesByCountry(countryId){
    console.log("COUNTRY:",countryId)
    // let Country = this.AddFacilityForm.get('Country');
    let states = csc.getStatesOfCountry(countryId)
    console.log("states:",states)
    this.fStates = states
    // Country.setValue(country)
    
  }


  getCitiesByState(stateId){
    console.log("COUNTRY:",stateId)
    let cities = csc.getCitiesOfState(stateId)
    this.fCities = cities
  }


  UpdateFacility(){
    console.log("Updated Form :",this.AddFacilityForm.value)

    let json = {
      nodeId : this.facilityFormInfo.NodeID,
      nodeName : this.AddFacilityForm.value.FacilityName,
      data: this.AddFacilityForm.value,
      // additionalPropertiesForm : this.AdditoinalPropertiesForm
    }
    this.showProgressSpinner = true
    this.updatedFacility.emit(json)
    /* this.authService.updateNodeInfo(json,(res,err)=>{
      if(err){
        this.showErrMsg = {
          message : "Error while updating",
          show : true,
          status : false
        }
        this.dismissMsg()

      }else{
        
        this.showErrMsg = {
          message : "Success updating",
          show : true,
          status : true
        }
      }
      this.dismissMsg()
    }) */
  }

  dismissMsg(){
    setTimeout(()=>{
      this.showErrMsg.show = false
    },2000)
  }


/*   close(){
    this.dialogRef.close();
  } */

}
