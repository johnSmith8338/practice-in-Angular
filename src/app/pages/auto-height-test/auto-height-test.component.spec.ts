import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoHeightTestComponent } from './auto-height-test.component';

describe('AutoHeightTestComponent', () => {
  let component: AutoHeightTestComponent;
  let fixture: ComponentFixture<AutoHeightTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutoHeightTestComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutoHeightTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
