import { Component } from '@angular/core';
import { LoaderService } from '../../core/services/loader.service';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  imports: [NgxSkeletonLoaderModule, CommonModule],
  templateUrl: './global-loader.component.html',
  styleUrl: './global-loader.component.css',
})
export class GlobalLoaderComponent {
  loading$ = this.loaderService.loading$;

  constructor(private loaderService: LoaderService) {}
}
