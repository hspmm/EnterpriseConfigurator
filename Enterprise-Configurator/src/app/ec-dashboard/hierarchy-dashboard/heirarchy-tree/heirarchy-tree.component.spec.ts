import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeirarchyTreeComponent } from './heirarchy-tree.component';

describe('HeirarchyTreeComponent', () => {
  let component: HeirarchyTreeComponent;
  let fixture: ComponentFixture<HeirarchyTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeirarchyTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeirarchyTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
