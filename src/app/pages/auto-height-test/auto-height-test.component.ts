import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-auto-height-test',
  templateUrl: './auto-height-test.component.html',
  styleUrls: ['./auto-height-test.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutoHeightTestComponent implements OnInit {
  isBlockOpened = false;
  isBlockOpenedTwo = false;

  isClickChanged(click:boolean) {
    this.isBlockOpened = click;
  }
  isClickChangedTwo(clickTwo:boolean) {
    this.isBlockOpenedTwo = clickTwo;
  }

  constructor() { }

  ngOnInit(): void {
  }

}
