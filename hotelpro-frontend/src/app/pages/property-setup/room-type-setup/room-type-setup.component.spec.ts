import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomTypeSetupComponent } from './room-type-setup.component';

describe('RoomTypeSetupComponent', () => {
  let component: RoomTypeSetupComponent;
  let fixture: ComponentFixture<RoomTypeSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomTypeSetupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RoomTypeSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
