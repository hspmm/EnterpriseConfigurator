import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanLoad, Route , Router, CanActivate } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthenticationService } from '../services/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class HeirarchyLoadGuard implements CanLoad {
  constructor(private authService: AuthenticationService, private router: Router){ }

  canLoad(): boolean {

    return true
    
/*     this.authService.getHeirarchyList((heirarchy,err)=>{
      if(err){
        console.log("error in getting heirarchy:",err)
      }else{
        this.router.navigate(['']);
        console.log('Heirarchy:',heirarchy)
      }
    }) */

  }
  
}
