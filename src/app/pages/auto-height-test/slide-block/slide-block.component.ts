import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-slide-block',
  templateUrl: './slide-block.component.html',
  styleUrls: ['./slide-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlideBlockComponent implements OnInit {
  testList: any[] = [
    {
      content: 'Lorem ipsum dolor sit amet.'
    },
    {
      content: 'Recusandae eum error voluptatibus maiores.'
    },
    {
      content: 'Qui cum modi exercitationem aperiam.'
    },
    {
      content: 'Lorem ipsum dolor sit amet.'
    },
    {
      content: 'Recusandae eum error voluptatibus maiores.'
    },
    {
      content: 'Qui cum modi exercitationem aperiam.'
    },
  ];

  listLength = this.testList.length;
  
  constructor() { }
  
  ngOnInit(): void {
  }

}
