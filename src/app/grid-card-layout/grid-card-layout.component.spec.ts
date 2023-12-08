import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridCardLayoutComponent } from './grid-card-layout.component';

describe('GridCardLayoutComponent', () => {
  let component: GridCardLayoutComponent;
  let fixture: ComponentFixture<GridCardLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GridCardLayoutComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GridCardLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
