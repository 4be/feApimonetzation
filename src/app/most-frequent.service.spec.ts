import { TestBed } from '@angular/core/testing';

import { MostFrequentService } from './most-frequent.service';

describe('MostFrequentService', () => {
  let service: MostFrequentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MostFrequentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
