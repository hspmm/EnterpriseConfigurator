import { Component, OnInit } from '@angular/core';

import { AuthenticationService } from '../../../services/authentication.service';
import { AppLocalStorageKeys } from '../../../app-storagekeys-urls';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  detectedPlugins = []
  appConfigInfo:any
  AppLocalKeys = AppLocalStorageKeys()
  userPrivileges

  constructor(private authService: AuthenticationService) {
    this.assignPrivileges()
   }

  ngOnInit() {
    this.getDetectedPlugins()    
  }

  assignPrivileges(){
    this.userPrivileges = {
      managePluginServices : this.authService.checkPrivilege(this.AppLocalKeys.privileges.managePluginServices).length > 0
    } 
  }

  getDetectedPlugins(){
    this.authService.getDetectedPluginsList((detectedPlugins,err)=>{
      if(err){
        console.log("Error while geting the detected Plugins in about page:",err);
        this.getAppConfigInfo()
        //this.detectedPlugins = []
      }else if(detectedPlugins && detectedPlugins.responseCode === 0 && detectedPlugins.data.length > 0){
        console.log("Successfully detected Plugins in about page:",detectedPlugins);
        // this.detectedPlugins = detectedPlugins
        //this.getHierarchyList(detectedPlugins.data)
        this.detectedPlugins = detectedPlugins.data
        this.detectedPlugins.forEach(plugin =>{
          plugin.showServiceSpinner = false
          plugin.changeServiceStarted = false
          plugin.serviceRespStatus = true
          plugin.showRestartSpinner = false
          plugin.restartServiceStarted = false
          plugin.restartRespStatus = true
        })
      }
      this.getAppConfigInfo()
    })
  }

  getAppConfigInfo(){
    this.authService.getAppConfigInfo((appInfo,err)=>{
      if(err){
        console.log("error in getting app config:",err)
      }else if(appInfo && appInfo.responseCode === 0){   
        this.detectedPlugins.unshift(appInfo.data)   
        this.appConfigInfo = appInfo.data
      }
    })
  }


  onChangeService(plugin){
    console.log('Changing plugin:',plugin)
    this.enableSpinnerChangeServiceOfPlugin(plugin, true)
    this.updateServiceRespStatus(plugin, true)
    let json = {
      uid : plugin.Uid,
      uniqueName : plugin.UniqueName,
      serviceEnabled : plugin.ServicesEnabled
    }
    this.authService.setPluginServicesEnableAndDisable(json,(resp,err)=>{
      if(err){
        console.log("error in updating plugin services:",err)
        
        this.enableSpinnerChangeServiceOfPlugin(plugin, false)
        this.updateServiceRespStatus(plugin, false)
      }else{
        console.log("Response in updating plugin services:",resp)
        setTimeout(()=>{
          this.enableSpinnerChangeServiceOfPlugin(plugin, false)
          this.updateServiceRespStatus(plugin, true)
        },1000)
        
      }
    })
  }

  enableSpinnerChangeServiceOfPlugin(plugin, status:boolean){
    let pluginIndex = this.detectedPlugins.findIndex(detectedplugin => detectedplugin.Uid === plugin.Uid);
    this.detectedPlugins[pluginIndex].showServiceSpinner = status
    this.detectedPlugins[pluginIndex].changeServiceStarted = status
  }

  updateServiceRespStatus(plugin, status:boolean){
    let pluginIndex = this.detectedPlugins.findIndex(detectedplugin => detectedplugin.Uid === plugin.Uid);
    this.detectedPlugins[pluginIndex].serviceRespStatus = status
  }

  enableSpinnerOfRestartServices(plugin, status:boolean){
    let pluginIndex = this.detectedPlugins.findIndex(detectedplugin => detectedplugin.Uid === plugin.Uid);
    this.detectedPlugins[pluginIndex].showRestartSpinner = status
    this.detectedPlugins[pluginIndex].restartServiceStarted = status
  }

  updateRestartRespStatus(plugin, status:boolean){
    let pluginIndex = this.detectedPlugins.findIndex(detectedplugin => detectedplugin.Uid === plugin.Uid);
    this.detectedPlugins[pluginIndex].restartRespStatus = status
  }


 /*  getHierarchyList(detectedPlugins){
    this.authService.getHeirarchyList((hierarchy,err)=>{
      if(err){
        console.log("error in getting heirarchy:",err)
        this.detectedPlugins = detectedPlugins
      }else{
        console.log('Heirarchy:',hierarchy)
        hierarchy = hierarchy.data
        if(hierarchy && hierarchy.length > 0){
          detectedPlugins.forEach(plugin => {
            let usedPlugin = this.checkPluginUsedInHierarchyTree(plugin,hierarchy)
            // let pluginData = detectedPlugins.find(pluginData => pluginData.name == heirarchy.TypeOf)
            if(usedPlugin){
              console.log("&&&&:",usedPlugin)
              plugin['usedInEc'] = true
            }else{
              plugin['usedInEc'] = false
            }
          });
          console.log("AFTER:",detectedPlugins)
          this.detectedPlugins = detectedPlugins
        }else{
          this.detectedPlugins = detectedPlugins
        }
      }
    })
  }

  checkPluginUsedInHierarchyTree(plugin,hierarchy){
    let pluginData = hierarchy.find(node => node.TypeOf == plugin.name)
    console.log("Used Plugin:",pluginData)
    return pluginData
  } */

  restartpluginServices(plugin){
    console.log("APP CONFIG:",plugin)
    if(this.appConfigInfo.UniqueName === plugin.UniqueName){
      this.detectedPlugins.forEach(detectedPlugin =>{
        this.enableSpinnerOfRestartServices(detectedPlugin,true)
        this.updateRestartRespStatus(detectedPlugin, true)
      })
      this.authService.restartAllPluginsServices((resp,err)=>{
        if(err){
          console.log("Error while restarting the services:",err)
          this.detectedPlugins.forEach(detectedPlugin =>{
            this.enableSpinnerOfRestartServices(detectedPlugin,false)
            this.updateRestartRespStatus(detectedPlugin, false)
          })
        }else{
          console.log("Success of restarting the services :",resp)
          this.detectedPlugins.forEach(detectedPlugin =>{
            this.enableSpinnerOfRestartServices(detectedPlugin,false)
            this.updateRestartRespStatus(detectedPlugin, true)
          })
          this.detectedPlugins = resp.data ? resp.data : []
          this.getAppConfigInfo()
        }
      })
    }else{
      let oldPluginDataIndex = this.detectedPlugins.findIndex(detectedPlugin => detectedPlugin.Uid === plugin.Uid) ;
      this.enableSpinnerOfRestartServices(this.detectedPlugins[oldPluginDataIndex],true)
      this.updateRestartRespStatus(this.detectedPlugins[oldPluginDataIndex], true)
      this.authService.restartIndividualPluginsServices(plugin.Uid, (resp,err)=>{
        if(err){
          console.log("Error while restarting the services:",err)                   
          this.enableSpinnerOfRestartServices(this.detectedPlugins[oldPluginDataIndex],false)
          this.updateRestartRespStatus(this.detectedPlugins[oldPluginDataIndex], false)
        }else{
          console.log("Success of restarting the services :",resp)
          if(resp && resp.responseCode === 0 && resp.data){
            console.log("oldPluginDataIndex:",oldPluginDataIndex)
            this.enableSpinnerOfRestartServices(this.detectedPlugins[oldPluginDataIndex],false)
            this.detectedPlugins.splice(oldPluginDataIndex, 1, resp.data)
            this.updateRestartRespStatus(this.detectedPlugins[oldPluginDataIndex], true)
          }
        }
      })
    }
    
  }


}
