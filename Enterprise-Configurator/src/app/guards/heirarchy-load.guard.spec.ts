import { TestBed, async, inject } from '@angular/core/testing';

import { HeirarchyLoadGuard } from './heirarchy-load.guard';

describe('HeirarchyLoadGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HeirarchyLoadGuard]
    });
  });

  it('should ...', inject([HeirarchyLoadGuard], (guard: HeirarchyLoadGuard) => {
    expect(guard).toBeTruthy();
  }));
});
