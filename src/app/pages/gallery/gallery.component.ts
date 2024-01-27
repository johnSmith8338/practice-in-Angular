import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Slide, StackGalleryService } from '../stack-gallery/stack-gallery.service';
import { Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HammerModule } from '@angular/platform-browser';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [
    CommonModule,
    HammerModule,
  ],
  providers:[],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GalleryComponent implements OnInit {
  gallerySvc = inject(StackGalleryService);
  private http = inject(HttpClient);
  slides: Observable<Slide[]> = new Observable();
  activeIndex: number = 0;
  currentIndex:number = 0;
  lastIndex: number = 0;

  constructor() { }

  ngOnInit(): void {
    // изменяем полученные данные с сервера под наши условия
    this.slides = this.gallerySvc.getSlidesData().pipe(
      map(data => {
        const slides = data.slides.map((slide, index) => ({ ...slide, index }));
        const totalSlides = slides.length;
        return slides.map((slide, index) =>({
          ...slide,
          // zIndex: this.getZIndex(totalSlides, index, 0),
        }));
      })
    );

    // this.slides.subscribe(slides => {
    //   const slidesLenght = slides.length;
    // });
    this.slides.subscribe(slides => {
      this.lastIndex = slides.length - 1; // Declare lastIndex here
    });
  }

  // getZIndex(totalSlides: number, currentIndex: number, activeIndex: number) {
  //   const currentIndexAdjusted = activeIndex ?? 0;
  //   const difference = currentIndex - currentIndexAdjusted;
  //   return totalSlides - Math.abs(difference) - 1;
  // }

  showPrev(index: number) {
    this.slides.subscribe(slides => {
      // const lastIndex = slides.length - 1;
      this.activeIndex = index > 0 ? index - 1 : this.lastIndex;
    });
  }
  showNext(index: number) {
    this.slides.subscribe(slides => {
      // const lastIndex = slides.length - 1;
      this.activeIndex = index < this.lastIndex ? index + 1 : 0;
    });
  }
  selectActiveSlide(index: number) {
    this.activeIndex = index;
  }

}
