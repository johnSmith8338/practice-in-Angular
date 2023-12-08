import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-grid-card-layout',
  templateUrl: './grid-card-layout.component.html',
  styleUrls: ['./grid-card-layout.component.scss']
})
export class GridCardLayoutComponent implements OnInit {
  flipped!: boolean;

  constructor() { }

  ngOnInit(): void {
    this.flipped = false;
  }

}
