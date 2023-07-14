import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlideBlockComponent } from './slide-block.component';

describe('SlideBlockComponent', () => {
  let component: SlideBlockComponent;
  let fixture: ComponentFixture<SlideBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SlideBlockComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlideBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
