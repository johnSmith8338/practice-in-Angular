import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkDirectiveTestComponent } from './link-directive-test.component';

describe('LinkDirectiveTestComponent', () => {
  let component: LinkDirectiveTestComponent;
  let fixture: ComponentFixture<LinkDirectiveTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LinkDirectiveTestComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LinkDirectiveTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
