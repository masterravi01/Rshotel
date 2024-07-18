import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddUpdatePropertyComponent } from './add-update-property/add-update-property.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { NgxFileDropModule } from 'ngx-file-drop';
import { FileUploadComponent } from '../../core/reused/file-upload/file-upload.component';
import { RoomTypeRangeSetupComponent } from './room-type-range-setup/room-type-range-setup.component';

const routes: Routes = [
  { path: '', redirectTo: 'property', pathMatch: 'full' },
  {
    path: 'property/:propertyUnitId',
    component: AddUpdatePropertyComponent,
    title: 'Property Setup',
  },
  {
    path: 'roomtyperangesetup/:propertyUnitId',
    component: RoomTypeRangeSetupComponent,
    title: 'Room & RoomType Setup',
  },
];

@NgModule({
  declarations: [AddUpdatePropertyComponent, RoomTypeRangeSetupComponent],
  imports: [
    CommonModule,
    RouterModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    NgxFileDropModule,
    FileUploadComponent,
  ],
})
export class PropertySetupModule {}
