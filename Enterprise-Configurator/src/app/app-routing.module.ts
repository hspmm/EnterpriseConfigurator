import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LandingComponent } from './landing/landing.component';
import { UnderMaintenanceComponent } from './under-maintenance/under-maintenance.component';

import { AuthGuard } from './guards/auth.guard';
import { NotFoundComponent } from './not-found/not-found.component';


const routes: Routes = [
  {
    path:'',
    component: LandingComponent,
    canActivate: [AuthGuard]
  },
  {
    path:'dashboard',
    canLoad: [AuthGuard],
    loadChildren: () => import('./ec-dashboard/ec-dashboard.module').then(m => m.EcDashboardModule),
    
  },
  {
    path:'not-found',
    component: NotFoundComponent
  },
  {
    path:'under-maintenance',
    component: UnderMaintenanceComponent
  },
  {path: '**', redirectTo:'', pathMatch:'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
