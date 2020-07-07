import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilitiesMappingComponent } from './facilities-mapping.component';

describe('FacilitiesMappingComponent', () => {
  let component: FacilitiesMappingComponent;
  let fixture: ComponentFixture<FacilitiesMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FacilitiesMappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FacilitiesMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
