import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddUpdatePropertyComponent } from './add-update-property/add-update-property.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { NgxFileDropModule } from 'ngx-file-drop';
import { FileUploadComponent } from '../../core/reused/file-upload/file-upload.component';
import { RoomTypeRangeSetupComponent } from './room-type-range-setup/room-type-range-setup.component';
import { RoomsReviewComponent } from './rooms-review/rooms-review.component';
import { TaxSetComponent } from './tax-set/tax-set.component';
import { RateplanComponent } from './rateplan/rateplan.component';

const routes: Routes = [
  { path: '', redirectTo: 'property', pathMatch: 'full' },
  {
    path: 'property/:propertyUnitId',
    component: AddUpdatePropertyComponent,
    title: 'Property Setup',
  },
  {
    path: 'roomtyperangesetup/:propertyUnitId/:roomTypeId',
    component: RoomTypeRangeSetupComponent,
    title: 'RoomType Setup',
  },
  {
    path: 'roomsreview/:propertyUnitId',
    component: RoomsReviewComponent,
    title: 'Rooms Review',
  },
  {
    path: 'taxsetup/:propertyUnitId',
    component: TaxSetComponent,
    title: 'Tax Setup',
  },
  {
    path: 'rateplansetup/:propertyUnitId',
    component: RateplanComponent,
    title: 'Base Rate Setup',
  },
];

@NgModule({
  declarations: [
    AddUpdatePropertyComponent,
    RoomTypeRangeSetupComponent,
    RoomsReviewComponent,
    TaxSetComponent,
    RateplanComponent,
  ],
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
