import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service'
import { User } from '../../interfaces/user'
import { Router } from '@angular/router';
import { AppLocalStorageKeys } from '../../app-storagekeys-urls'

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  currentUser:User
  headerDropDownContent
  headerContent
  public counter = 90
  intervalId
  ApplocalKeys = AppLocalStorageKeys()
  userPrivileges

  constructor(private authService:AuthenticationService,public router: Router) { 
    console.log("--------> ROUTER:",this.router.url)
    this.assignPrivileges()  
    this.authService.isLoggedIn.subscribe(data=>{
      console.log("USer data:",data)
      this.currentUser = data
    })

    //this.startTimer()


    this.getHeaderDropDownContent()
    this.getHeaderContent()
  }

  ngOnInit() {
    let userinfo = this.authService.currentUserData
    this.currentUser = userinfo ? userinfo : '' 
    
  }

  assignPrivileges(){
    this.userPrivileges = {
      managePluginServices : this.authService.checkPrivilege(this.ApplocalKeys.privileges.managePluginServices).length > 0 ,
      manageHierarchyLevels : this.authService.checkPrivilege(this.ApplocalKeys.privileges.manageHierarchyLevels).length > 0
    } 
  }

 /*  startTimer(){
    this.intervalId = setInterval(() => {
      this.counter = this.counter - 1;
      //console.log(this.counter)
      if(this.counter === 0) clearInterval(this.intervalId)
    }, 1000)
  } */

  stopTimer(){
    clearInterval(this.intervalId)
  }

  getHeaderContent(){
    this.headerContent = [
      {
        name:"Home",
        icon:"home",
        link:"dashboard",
        hasAccess : true,
        id : "homePageButton"
      },
      {
        name:"Settings",
        icon:"settings",
        link:"settings",
        hasAccess : this.userPrivileges.manageHierarchyLevels ? this.userPrivileges.manageHierarchyLevels : false,
        id : "settingsPageButton"
      },
    ]
  }

  getHeaderDropDownContent(){
    this.headerDropDownContent = [
      {
        name:"Plugins Status",
        icon:"list",
        link:"about",
        hasAccess : this.userPrivileges.managePluginServices ? this.userPrivileges.managePluginServices : false,
        id : "pluginStatusPageButton"
      }
    ]
  }


  logout(){
    this.authService.logout()
  }

  getPluginIcon(plugin){
    /* this.authService.pluginIcon(plugin,(data)=>{
      console.log
    }) */
  }



}
