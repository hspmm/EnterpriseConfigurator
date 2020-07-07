import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup,FormControl, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { NodeCreation } from '../../../interfaces/user'
import { SharedService } from '../../../services/shared/shared.service';
import { AuthenticationService } from '../../../services/authentication.service';
import { AppLocalStorageKeys } from '../../../app-storagekeys-urls';

@Component({
  selector: 'app-create-enterprise',
  templateUrl: './create-enterprise.component.html',
  styleUrls: ['./create-enterprise.component.scss']
})
export class CreateEnterpriseComponent implements OnInit {
  CreateEnterpriseForm :FormGroup
  appLocalKeys = AppLocalStorageKeys()

  constructor(private fb:FormBuilder, private SharedService:SharedService, private AuthService:AuthenticationService,
    private router:Router) { 
    this.CreateEnterpriseForm = fb.group({
      enterpriseName: new FormControl('Kaiser Permanente',Validators.compose([
        Validators.required
      ]))
    })
  }

  ngOnInit() {

    setTimeout(()=>{
      this.signout()
    },10000);
  }

  signout(){
    this.AuthService.logout();
  }

  createEnterprise(){
    console.log(this.CreateEnterpriseForm.value)
    let enterpriseName = this.CreateEnterpriseForm.value.enterpriseName
    let enterpriseObj:NodeCreation = this.SharedService.createNodeObj(enterpriseName, null, null, 'enterprise-hierarchy', this.appLocalKeys.appType, null, true)
    // this.SharedService.showToaster()
    this.AuthService.saveToHierarchy(enterpriseObj,(res,err)=>{
      if(err){
        console.log("Error while saving enterprise:",err)
        // this.showEnterpriseSaveError = err          
      }else{
        // this.SharedService.showToaster()        
        console.log("in heirarchy component, rep of saving enterprise:",res)
        this.router.navigate(['dashboard'])
      }
    })
    /* console.log("moment:",moment().valueOf())
    if(this.enterpriseFormControl.value && this.currentUser.userName){
      let enterpriseObj:NodeCreation = {
        NodeName : this.enterpriseFormControl.value,
        NodeShortName : this.enterpriseFormControl.value,
        ParentID: null,
        PluginID:null,
        NodeType: 'enterprise-hierarchy',
        TypeOf : 'enterprise-configurartor',
        PluginInfoId : null,
        NodeInfo : null,
        CreatedDate: moment().format("YYYY-MM-DD HH:mm:ss:SS"),
        LastModifiedDate:moment().format("YYYY-MM-DD HH:mm:ss:SS"),
        CreatedBy: this.currentUser.userName,
        ModifiedBy: this.currentUser.userName,
        IsActive:1
      }
      this.authService.saveToHierarchy(enterpriseObj,(res,err)=>{
        if(err){
          this.showEnterpriseSaveError = err          
        }else{
          this.getTreeList()
          console.log("in heirarchy component, rep of saving enterprise:",res)
        }
      })
    } */
  }

}
