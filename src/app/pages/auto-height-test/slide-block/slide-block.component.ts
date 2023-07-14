import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-slide-block',
  templateUrl: './slide-block.component.html',
  styleUrls: ['./slide-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlideBlockComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
