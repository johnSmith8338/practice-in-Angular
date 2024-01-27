import { CommonModule, DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, Renderer2, inject } from '@angular/core';
import { Slide, StackGalleryService } from './stack-gallery.service';
import { HttpClient } from '@angular/common/http';
import { Observable, map, take } from 'rxjs';
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG, HammerModule } from '@angular/platform-browser';
import * as Hammer from 'hammerjs';

// export class MyHammerConfig extends HammerGestureConfig {
//   override overrides = {
//     swipe: {direction: Hammer.DIRECTION_HORIZONTAL},
//   }
// }

@Component({
  selector: 'app-stack-gallery',
  standalone: true,
  imports: [
    CommonModule,
    HammerModule,
  ],
  providers:[
    // {
    //   provide: HAMMER_GESTURE_CONFIG,
    //   useClass: MyHammerConfig,
    // }
  ],
  templateUrl: './stack-gallery.component.html',
  styleUrls: ['./stack-gallery.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [],
})
export class StackGalleryComponent implements OnInit, OnDestroy {
  gallerySvc = inject(StackGalleryService);
  private http = inject(HttpClient);
  private renderer = inject(Renderer2);
  private element = inject(ElementRef);
  slides: Observable<Slide[]> = new Observable();
  visibleSlides: Observable<Slide[]> = new Observable();

  viewportWidth?: number;
  maxVisibleSlides = 5; // количество видимых слайдов
  visibleSlideCount = 0;
  activeIndex: number = 0;
  currentIndex:number = 0;
  animationState:string = 'visible';
  animationInProgress = false;

  constructor(
    @Inject(DOCUMENT) private document: Document,
  ) {}

  ngOnInit(): void {
    // получаем ширину видимого экрана
    this.getViewportWidth();

    // изменяем полученные данные с сервера под наши условия
    this.slides = this.gallerySvc.getSlidesData().pipe(
      map(data => {
        const slides = data.slides.map((slide, index) => ({ ...slide, index }));
        const totalSlides = slides.length;
        return slides.map((slide, index) =>({
          ...slide,
          zIndex: this.getZIndex(totalSlides, index, 0),
        }));
      })
    );

    // получааем количество слайдов видимых на экране
    this.visibleSlides = this.slides.pipe(
      map(slides => slides.slice(0, this.maxVisibleSlides))
    );

    this.visibleSlides.subscribe(slides => {
      this.visibleSlideCount = slides.length;
    });
    
    // устанавливаем первый слайд и точку пагинации активными при загрузке
    this.slides.pipe(take(1)).subscribe(slides => {
      if(slides.length > 0) {
        this.activeIndex = slides[0].index;
      }
    });
  }
  
  // получаем ширину видимой области
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.getViewportWidth();
  }
  getViewportWidth(): number {
    this.viewportWidth = window.innerWidth;
    return this.viewportWidth;
  }

  // ширина слайда в зависимости от ширины экрана
  getSlideWidth() {
    return this.getViewportWidth() >= 1200 ? 960 : 710;
  };

  getSliderWidth() {
    return this.getViewportWidth() - 40;
  };
  
  // высота слайда соответствующая ширине слайда
  getSlideHeight() {
    return this.getViewportWidth() >= 1200 ? 320 : 237;
  }
  
  // отступ в левую сторону, чтоб показать только часть нижнего слайда
  getLeftPosition(index: number) {
    // return Math.round((this.getSlideWidth() - (this.getViewportWidth() - this.getSlideWidth())/(this.visibleSlideCount - 1)));
    const totalWidth = this.getSliderWidth();
    const slideWidth = this.getSlideWidth();
    const spacing = (totalWidth - slideWidth) / (this.visibleSlideCount - 1);
    if(index === this.activeIndex) {
      return 0;
    }else if(index >= this.activeIndex && index < (this.activeIndex + this.maxVisibleSlides)) {
      const offset = index > this.activeIndex ? slideWidth : 0;
      return Math.round(spacing * (index - this.activeIndex));
    }else{
      return 0;
    }
  }

  getZIndex(totalSlides: number, currentIndex: number, activeIndex: number) {
    const currentIndexAdjusted = activeIndex ?? 0;
    const difference = currentIndex - currentIndexAdjusted;
    return totalSlides - Math.abs(difference) - 1;
  }
  
  // функция, которая выпоолняется при клике на слайд, кроме первого
  clickSlide(index: number): void {
    this.activeIndex = index;
  }

  // функция, которая выпоолняется при клике на слайд, кроме первого
  clickPagination(index: number): void {
    this.activeIndex = index;
  }

  // @HostListener('swipeleft', ['$event'])
  // onSwipeLeft(event: Event): void {
  //   this.handleSwipe('left', this.activeIndex);
  // }
  // @HostListener('swipeRight', ['$event'])
  // onSwipeRight(event: Event): void {
  //   this.handleSwipe('right', this.activeIndex);
  // }

  // handleSwipe(direction: string, index:number): void {
  //   if (direction === 'left') {
  //     // Handle swipe left, e.g., go to the next slide
  //     this.nextSlide(index);
  //   } else if (direction === 'right') {
  //     // Handle swipe right, e.g., go to the previous slide
  //     this.previousSlide(index);
  //   }
  // }
  nextSlide(index:number):void {
    this.slides.subscribe(slides => {
      // if(this.activeIndex < slides.length - 1) {
      //   this.activeIndex = index + 1;
      // }
      const lastIndex = slides.length - 1;
      this.activeIndex = index < lastIndex ? index + 1 : 0;
    });
  }
  previousSlide(index:number):void {
    // if(this.activeIndex > 0) {
    //   this.activeIndex = index - 1;
    // }
    this.slides.subscribe(slides => {
      const lastIndex = slides.length - 1;
      this.activeIndex = index > 0 ? index - 1 : lastIndex;
    });
  }

  ngOnDestroy(): void {
  }
}
