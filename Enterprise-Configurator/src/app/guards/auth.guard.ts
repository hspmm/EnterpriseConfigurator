import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanLoad, Route , Router, CanActivate} from '@angular/router';
import { Observable } from 'rxjs';

import { AuthenticationService } from '../services/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad, CanActivate {
  constructor(private authService: AuthenticationService, private router: Router){ }

  canLoad(): boolean {
    let userinfo = this.authService.currentUserData
    if(userinfo && userinfo.mappedPrivileges && userinfo.mappedPrivileges.length > 0){
      return true;
    }else if (userinfo && userinfo.mappedPrivileges && userinfo.mappedPrivileges.length < 1){
      this.router.navigate(['/not-found'])
      // return true
    }else{
      this.authService.logout()
      return false;
    }
  }

  canActivate(){
    if(this.authService.currentUserData){
      this.router.navigate(['/dashboard']);
    }    
    return true;
  }

}
