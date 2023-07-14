import { ChangeDetectionStrategy, Component, DoCheck, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';

@Component({
  selector: 'app-child',
  templateUrl: './child.component.html',
  styleUrls: ['./child.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChildComponent implements OnInit, OnDestroy, OnChanges, DoCheck {
  @Input() value = 'Input значение в ребенке';

  @ViewChild('foo') content: any; //шаблонная переменная

  constructor() {
    console.log('CHILD constructor: ' + this.value);
  }
  
  ngOnInit(): void {
    console.log('CHILD ngOnInit: ' + this.value);
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    console.log('CHILD ngOnChange: ' + this.value, changes);
  }

  ngDoCheck(): void {
    console.log('CHILD ngDoCheck: ' + this.value);
  }

  ngOnDestroy(): void {
    console.log('CHILD ngOnDestroy: ' + this.value);
  }

}
