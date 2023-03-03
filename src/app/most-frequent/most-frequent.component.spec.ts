import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MostFrequentComponent } from './most-frequent.component';

describe('MostFrequentComponent', () => {
  let component: MostFrequentComponent;
  let fixture: ComponentFixture<MostFrequentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MostFrequentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MostFrequentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
