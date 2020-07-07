import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../../services/authentication.service';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-single-instance',
  templateUrl: './single-instance.component.html',
  styleUrls: ['./single-instance.component.scss']
})
export class SingleInstanceComponent implements OnInit {
  plugin
  loadedPlugin:boolean = true
  currentUser
  singleInstancePluginUrl
  licensePluginInfo
  rootNodeInfo

  constructor(public authService:AuthenticationService, private sanitizer : DomSanitizer) { 
    let userinfo = this.authService.currentUserData
    this.currentUser = userinfo ? userinfo : ''
    console.log("currentUser:",this.currentUser)
    this.authService.isselectedPluginUrl.subscribe(jsonData=>{
      console.log("USer data:",jsonData)
      let pluginInfo = jsonData.singleInstanceAppInfo
      this.rootNodeInfo = jsonData.rootNodeInfo
      this.plugin = pluginInfo
      let url = pluginInfo.BaseUrl + ':' + pluginInfo.UiPort + pluginInfo.UiUrls.home
      this.sanitizer.bypassSecurityTrustResourceUrl(url)
      this.singleInstancePluginUrl =  this.sanitizer.bypassSecurityTrustResourceUrl(url)
    })

    this.authService.getLicensemanagerPlugin((licensePluginInfo,err)=>{
      if(err){
        console.log("Error while getting the license manager info")
      }else{
        this.licensePluginInfo = licensePluginInfo.data
      }
    })
  }

  ngOnInit() {
  }

  onLoadSuccess(pluginFrameUrl,event){
    console.log("pluginFrameUrl:",pluginFrameUrl)
    let url = pluginFrameUrl.changingThisBreaksApplicationSecurity;
      var iframe = document.getElementById('pluginiframe');
      this.loadedPlugin = false
      console.log("Onload url:",url)
      if (iframe == null) return;
      var iWindow = (<HTMLIFrameElement>iframe).contentWindow;
      setTimeout(()=>{
        if(this.licensePluginInfo && (this.plugin.Name == this.licensePluginInfo.Name)){
          iWindow.postMessage({accesstoken:this.currentUser.sessionId,custID:this.rootNodeInfo.Uid,custName:this.rootNodeInfo.NodeName}, url);
        }else{
          iWindow.postMessage({accesstoken:this.currentUser.sessionId}, url);
        }
      },1000)      
  }

  onIframeLoadError(event){
    console.log("Error of loading plugin")
  }

}
