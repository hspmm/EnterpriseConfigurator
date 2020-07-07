import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, FormControl, Validators, FormGroupDirective, NgForm} from '@angular/forms';

import { AuthenticationService } from '../services/authentication.service';
// import { AppLocalStorageKeys } from '../app-storagekeys-urls';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  // AuthTypes = AppLocalStorageKeys().authTypes
  // AuthTypes : [] = []
  SigninForm: FormGroup
  hide=true
  showSpinner = false
  hidePassword = true

  // loginAs:string

  displayToast ={
    show : false,
    message : '',
    success : false
  }

  constructor(fb:FormBuilder, private authService:AuthenticationService) {
    this.SigninForm = fb.group({
      userName: new FormControl("", Validators.compose([
        Validators.required
      ])),
      password: new FormControl("", Validators.compose([
        Validators.required
      ]))
    })
  }

  ngOnInit() {
    /* this.authService.getAuthTypes((authTypes, err) =>{
      if(authTypes){
        console.log("Success of geting auth types:",authTypes)
        this.AuthTypes = authTypes['data']
        this.loginAs = authTypes['data'][0]
      }else{
        console.log("Error of geting auth types:",err)
      }
    }) */
  }

  showPassword(mouseEvent){
    if(mouseEvent){
      this.hidePassword = false
    }else{
      this.hidePassword = true
    }
  }

  onSubmit(signinForm){
    // console.log("Login:",loginAs)
    // if(loginAs){
      let authObj = {
        userDetails : this.SigninForm.value,
        // authType : loginAs
      }
      /*  if(this.SigninForm.value){
         userInfo = this.SigninForm.value
       }else{
         userInfo = {
           userName : 'user_1'
         }
       } */
       this.showSpinner = true
       this.authService.login(authObj,(response,err)=>{
         if(!response){
           console.log("signin error:",err)
           let errMsg = err.error ? err.error.errorMessage ? err.error.errorMessage.ErrorText : err.statusText : err.statusText
           this.displayToast = {
             show : true,
             message : errMsg,
             success : false
           }
           this.showSpinner = false
         }else{
           signinForm.resetForm();
         }
   
         setTimeout(()=>{
           this.displayToast.show = false
         },4000)
         
       });
   /*  }else{
      this.displayToast = {
        show : true,
        message : 'Please select any authentication type',
        success : false
      }
    } */

    
  }

  closeToast(){
    this.displayToast.show = false
  }

  /* createSession(){
    console.log("Creating session")
    this.authService.getActiveInactivePluginsList((res, err)=>{
      if(err){
        console.log("EEEEEEEP:",err)
      }
      if(res){
        console.log("RRRRRRRRRRRRRRRRRRR:",res)
      }
    })
  } */

}
