import { CommonModule, DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, Renderer2, computed, inject, signal } from '@angular/core';
import { ServerSlide, Slide, StackGalleryService } from './stack-gallery.service';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, take } from 'rxjs';

@Component({
  selector: 'app-stack-gallery',
  standalone: true,
  imports: [
    CommonModule,
  ],
  providers:[],
  templateUrl: './stack-gallery.component.html',
  styleUrls: ['./stack-gallery.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StackGalleryComponent implements OnInit, OnDestroy {
  gallerySvc = inject(StackGalleryService);
  private http = inject(HttpClient);
  private renderer = inject(Renderer2);
  private element = inject(ElementRef);
  slides: Observable<Slide[]> = new Observable();
  visibleSlides: Observable<Slide[]> = new Observable();
  currentIndex = this.gallerySvc.currentIndex;

  viewportWidth?: number;
  maxVisibleSlides = 5; // количество видимых слайдов
  visibleSlideCount = 0;
  activeIndex: number|null = null;

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
          zIndex: this.getZIndex(totalSlides, index),
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
  
  // высота слайда соответствующая ширине слайда
  getSlideHeight() {
    return this.getViewportWidth() >= 1200 ? 320 : 237;
  }
  
  // отступ в левую сторону, чтоб показать только часть нижнего слайда
  getMarginLeft(isFirst: boolean) {
    if(isFirst) {
      return 0;
    }else{
      return Math.round((this.getSlideWidth() - (this.getViewportWidth() - this.getSlideWidth())/(this.visibleSlideCount - 1)) * -1);
    }
  }

  getZIndex(totalSlides: number, currentIndex: number) {
    return totalSlides - currentIndex - 1;
  }
  
  // функция, которая выпоолняется при клике на слайд, кроме первого
  clickSlide(index: number): void {
    this.activeIndex = index;
  }

  // функция, которая выпоолняется при клике на слайд, кроме первого
  clickPagination(index: number): void {
    this.activeIndex = index;
    console.log(this.visibleSlideCount)
  }

  ngOnDestroy(): void {
  }
}
