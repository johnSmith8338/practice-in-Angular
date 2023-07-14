import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-parent',
  templateUrl: './parent.component.html',
  styleUrls: ['./parent.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParentComponent implements OnInit {
  parentValue = 'Другое значение value, написанное в родителе у тега child';
  show:boolean = false;
  showText(event: MouseEvent) {
    event.preventDefault();
   this.show = !this.show;
  //  console.log(this.show, event);
  }

  constructor() { }

  ngOnInit(): void {
  }

}
