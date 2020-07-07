import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent  } from './dashboard/dashboard.component';
import { HeirarchyTreeComponent } from './hierarchy-dashboard/heirarchy-tree/heirarchy-tree.component';
import { SettingsComponent } from './hierarchy-dashboard/settings/settings.component';
import { AboutComponent } from './hierarchy-dashboard/about/about.component';
import { CreateEnterpriseComponent } from './hierarchy-dashboard/create-enterprise/create-enterprise.component';
import { SingleInstanceComponent } from './hierarchy-dashboard/single-instance/single-instance.component';


const routes: Routes = [
  {
    path:'',
    component: DashboardComponent,
    children:[
      {
        path:'',
        component: HeirarchyTreeComponent,
      },
      {
        path:'settings',
        component: SettingsComponent
      },
      {
        path:'about',
        component: AboutComponent
      }, 
      {
        path:'create-enterprise',
        component: CreateEnterpriseComponent
      }, 
      {
        path:'app',
        component: SingleInstanceComponent
      },
    ]
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EcDashboardRoutingModule { }
