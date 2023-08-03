import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RxjsTestClearComponent } from './rxjs-test-clear.component';

describe('RxjsTestClearComponent', () => {
  let component: RxjsTestClearComponent;
  let fixture: ComponentFixture<RxjsTestClearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RxjsTestClearComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RxjsTestClearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
