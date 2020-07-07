import { Injectable } from '@angular/core';
import { HttpClient , HttpHeaders, HttpInterceptor,  HttpEvent, HttpHandler, HttpRequest} from '@angular/common/http';
import { AuthenticationService } from '../services/authentication.service';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private auth: AuthenticationService) {}
  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {
      console.log("@@@@@@@HTTP INTERCEPTER:",req)
      if(this.auth.getAuthorizationToken()){
        const authToken = this.auth.getAuthorizationToken();
        req = req.clone({
            setHeaders: {
                Accesstoken : authToken,
                'Content-Type': 'application/json'
            }
        });
      }

        req = req.clone({ body: undefined });
    return next.handle(req);
  }
  
  /* intercept(req: HttpRequest<any>, next: HttpHandler) {
      
    // Get the auth token from the service.
    const authToken = this.auth.getAuthorizationToken();
    console.log("@@@@########## ACCESS TOKEN :",authToken)
    // Clone the request and replace the original headers with
    // cloned headers, updated with the authorization.
    const authReq = req.clone({
      headers: req.headers.set('Accesstoken', authToken),
    });

    // send cloned request with header to the next handler.
    return next.handle(authReq);
  } */
}