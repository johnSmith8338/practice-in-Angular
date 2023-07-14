import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-bottom-block',
  templateUrl: './bottom-block.component.html',
  styleUrls: ['./bottom-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BottomBlockComponent implements OnInit {
  @Input() click:boolean = false;
  @Output() clickChanged = new EventEmitter<boolean>();
  
  openSlide(event: MouseEvent) {
    this.click = !this.click;
    this.clickChanged.emit(this.click);
    // console.log(this.click);
  }

  constructor() { }

  ngOnInit(): void {
  }

}
