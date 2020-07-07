import { NgModule } from '@angular/core';
import {CdkStepperModule} from '@angular/cdk/stepper';
import {CdkTreeModule} from '@angular/cdk/tree';
import {CdkTableModule} from '@angular/cdk/table';
import {DragDropModule} from '@angular/cdk/drag-drop';


import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTreeModule } from '@angular/material/tree';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatChipsModule} from '@angular/material/chips';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSnackBarModule} from '@angular/material/snack-bar';

  
  
  @NgModule({
    imports: [],
    exports: [
      MatAutocompleteModule,
      CdkStepperModule,
      CdkTableModule,
      MatInputModule,
      MatRippleModule,
      MatGridListModule,
      MatToolbarModule,
      MatMenuModule,
      MatButtonModule,
      MatIconModule,
      MatStepperModule,
      MatSelectModule,
      CdkTreeModule,
      MatTreeModule,
      MatListModule,
      MatExpansionModule,
      MatDialogModule,
      MatCheckboxModule,
      MatSlideToggleModule,
      MatTabsModule,
      MatProgressSpinnerModule,
      MatTooltipModule,
      MatChipsModule,
      MatTableModule,
      MatSortModule,
      MatPaginatorModule,
      MatSnackBarModule,
      DragDropModule
    ]
  })
  
  export class MaterialModule { }