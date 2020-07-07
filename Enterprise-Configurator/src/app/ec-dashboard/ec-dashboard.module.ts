import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { EcDashboardRoutingModule } from './ec-dashboard-routing.module';
import { MaterialModule } from '../material-module'

import { DashboardComponent } from './dashboard/dashboard.component';
import { HeaderComponent } from './header/header.component';
import { HeirarchyTreeComponent } from './hierarchy-dashboard/heirarchy-tree/heirarchy-tree.component';
import { AddElementComponent } from './hierarchy-dashboard/add-element/add-element.component';
import { SettingsComponent } from './hierarchy-dashboard/settings/settings.component';
import { AboutComponent } from './hierarchy-dashboard/about/about.component';
import { AddFacilitiesComponent } from './hierarchy-dashboard/add-facilities/add-facilities.component';
import { FacilitiesListComponent } from './hierarchy-dashboard/facilities-list/facilities-list.component';
import { CreateEnterpriseComponent } from './hierarchy-dashboard/create-enterprise/create-enterprise.component';
import { FacilitiesMappingComponent } from './hierarchy-dashboard/facilities-mapping/facilities-mapping.component';


import { PluginInstancePipe } from '../pipes/plugin-instance.pipe'
import { DynamicFormComponent } from './hierarchy-dashboard/dynamic-form/dynamic-form.component';
import { SingleInstanceComponent } from './hierarchy-dashboard/single-instance/single-instance.component';

import { AngularSplitModule } from 'angular-split';


@NgModule({
  declarations: [
    DashboardComponent,
    HeaderComponent, 
    HeirarchyTreeComponent, 
    AddElementComponent, 
    SettingsComponent, 
    AboutComponent, 
    AddFacilitiesComponent, 
    FacilitiesListComponent,
    PluginInstancePipe,
    DynamicFormComponent,
    SingleInstanceComponent,
    CreateEnterpriseComponent,  
    FacilitiesMappingComponent  
  ],
  imports: [
    CommonModule,
    EcDashboardRoutingModule,
    MaterialModule,
    FormsModule, 
    ReactiveFormsModule,
    AngularSplitModule.forRoot()
    
  ],
  entryComponents: [
    AddElementComponent,
    FacilitiesListComponent,
    FacilitiesMappingComponent
  ]
})
export class EcDashboardModule { }
