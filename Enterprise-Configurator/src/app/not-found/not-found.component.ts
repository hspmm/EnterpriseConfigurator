import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {
  user
  constructor(private authService: AuthenticationService) {
    this.user = this.authService.currentUserData
   }

  ngOnInit() {

    setTimeout(()=>{
      this.signout()
    },5000);
  }

  signout(){
    this.authService.logout();
  }

}
