import { ChangeDetectionStrategy, Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GalleryComponent implements OnInit {

  @HostListener('window:scroll', ['$event']) // for window scroll events
  onScroll() {
  console.log();
}

  constructor() { }

  ngOnInit(): void {
  }

}
