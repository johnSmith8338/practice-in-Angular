import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-link-directive-test',
  templateUrl: './link-directive-test.component.html',
  styleUrls: ['./link-directive-test.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkDirectiveTestComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
