import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { MaterialModule } from './material-module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AngularSplitModule } from 'angular-split';
// import { AngularFontAwesomeModule } from 'angular-font-awesome';
// import { ToastrModule } from 'ngx-toastr';

// import { NoopInterceptor } from './noop-interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingComponent } from './landing/landing.component';
import { UnderMaintenanceComponent } from './under-maintenance/under-maintenance.component';

import {AuthGuard} from './guards/auth.guard';
import { NotFoundComponent } from './not-found/not-found.component';

import { AppConfig } from './app.config';

import { AuthInterceptor } from './interceptors/auth-interceptor';

/** Http interceptor providers in outside-in order */
export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
];

// import { HashLocationStrategy, LocationStrategy } from '@angular/common';
export function initializeApp(appConfig: AppConfig) {
  return () => appConfig.load();
}

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    NotFoundComponent,
    UnderMaintenanceComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,  
    AngularSplitModule.forRoot(),
    // ToastrModule.forRoot()
    // AngularFontAwesomeModule  
  ],
  providers: [
    AuthGuard,
    AppConfig,
    { provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppConfig], 
      multi: true 
    },
    httpInterceptorProviders,

  ],
  /* providers: [
    AuthGuard,
    AppConfig,
    { provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppConfig], 
      multi: true 
    },
    { provide: LocationStrategy, 
      useClass: HashLocationStrategy
    }
  ], */
  bootstrap: [AppComponent]
})
export class AppModule { }
