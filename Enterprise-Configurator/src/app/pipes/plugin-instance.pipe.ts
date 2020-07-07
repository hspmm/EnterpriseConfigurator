import { Pipe, PipeTransform } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service'
// import {DomSanitizer,SafeResourceUrl} from '@angular/platform-browser';

@Pipe({
  name: 'pluginInstance'
})
export class PluginInstancePipe implements PipeTransform {
  constructor(private authService:AuthenticationService){}

  transform(detectedPlugins,privileges) {
    // console.log("PIPE######:",detectedPlugins)
    // console.log("PIPE###### privileges:",privileges)
    let singleInstancePlugins = []
    if(detectedPlugins && privileges){
      let manageSingleinstancePlugins = this.authService.checkPrivilege(privileges.manageSingleInstancePlugins).length > 0
      let manageDefaultPlugins = this.authService.checkPrivilege(privileges.manageDefaultPlugins).length > 0
      // console.log("manageDefaultPlugins:",manageDefaultPlugins)
      detectedPlugins.forEach(plugin => {       
        if(plugin && (plugin.Instances && parseInt(plugin.Instances) === 1) && (plugin.ServicesEnabled === true) && manageSingleinstancePlugins){
          if(plugin.Type && ((plugin.Type).toLowerCase() === 'default') && manageDefaultPlugins){
            singleInstancePlugins.unshift(plugin)
          }else if(!plugin.Type || plugin.Type == ''){
            singleInstancePlugins.push(plugin)
          }
          
        }
      });
      return singleInstancePlugins.reverse()
    }
  }

}
