import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, effect, ElementRef, HostListener, inject, OnInit, signal, ViewChild } from '@angular/core';
import { HAMMER_GESTURE_CONFIG, HammerGestureConfig } from '@angular/platform-browser';
import * as Hammer from 'hammerjs'
import { catchError, of, tap } from 'rxjs';

export class HammerConfig extends HammerGestureConfig {
  override = {
    swipe: { direction: Hammer.DIRECTION_ALL },
  };
}

export interface Card {
  id: number;
  srcUrl: string;
  title: string;
  isActive: boolean;
  isVisible: boolean;
  uniqueId?: number;
}
export interface CardsData {
  slides: Card[];
}

@Component({
  selector: 'app-karo-circle-gallery',
  standalone: true,
  imports: [
    CommonModule,
  ],
  providers: [{
    provide: HAMMER_GESTURE_CONFIG,
    useClass: HammerConfig
  }],
  templateUrl: './karo-circle-gallery.component.html',
  styleUrls: ['./karo-circle-gallery.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideVisibility', [
      state('visible', style({
        opacity: 1,
      })),
      state('hidden', style({
        opacity: 0
      })),
      transition('visible <=> hidden', [
        animate('0.5s')
      ])
    ])
  ]
})
export class KaroCircleGalleryComponent implements OnInit {
  cardsUrl = 'assets/slides.json';
  http = inject(HttpClient);
  cdr = inject(ChangeDetectorRef);

  screenWidth = signal(window.innerWidth);

  slides: Card[] = [];

  @ViewChild('sliderContainer', { static: false }) sliderContainer!: ElementRef<HTMLDivElement>;
  slideWidth = computed(() => {
    return this.screenWidth() < 1024 ? 142 : 340;
  });
  slideHeight = computed(() => {
    return this.slideWidth() === 340 ? 540 : 226;
  });
  visibleSlidesCount = computed(() => {
    return this.screenWidth() < 1024 ? 1 : 2;
  });
  deltaX = signal(0);
  deltaIndex = computed(() => {
    const maxSlides = this.visibleSlidesCount() * 2 + 1;
    const indexDelta = this.deltaX() / (this.screenWidth() / maxSlides);
    if (Math.abs(indexDelta) > maxSlides) {
      return indexDelta > 0 ? maxSlides : maxSlides * -1;
    }
    return indexDelta;
  });
  indexCenter = signal(0);
  originalSlidesLength = 0;

  currentIndex = 0;
  isDragging = false;
  startX = 0;
  currentTranslate = 0;
  prevTranslate = 0;

  trackById(index: number, item: Card) {
    return item.uniqueId;
  }

  getCards() {
    return this.http.get<CardsData>(this.cardsUrl).pipe(
      tap(data => console.log('Полученные данные:', data)),
      catchError(error => {
        console.error('Ошибка при загрузке данных:', error);
        return of({ slides: [] });
      })
    );
  }

  constructor() {
    window.addEventListener('resize', () => {
      this.screenWidth.set(window.innerWidth);
    });
    effect(() => {
      const delta = this.deltaIndex();
      // console.log(delta);
      this.slides.forEach((_, index) => {
        const slideElement = document.querySelector(`.slide:nth-child(${index + 1})`) as HTMLElement;
        slideElement.style.transform = this.getSlideTransform(index, delta);
      });
    });
  }

  ngOnInit(): void {
    this.getCards().subscribe((data: { slides: Card[] }) => {
      this.slides = data.slides.map((slide, index) => ({ ...slide, uniqueId: index }));
      this.originalSlidesLength = this.slides.length;
      this.cdr.markForCheck();
      this.updateActiveSlide();
      this.resetSlidePosition();

      // Проверка количества видимых слайдов
      const visibleSlides = this.visibleSlidesCount() * 2 + 1;

      if (visibleSlides > this.slides.length) {
        console.log('Количество видимых слайдов больше, чем количество слайдов в массиве.');
        // Дополнительная логика, если необходимо
      } else {
        console.log('Количество видимых слайдов меньше или равно количеству слайдов в массиве.');
        this.slides = [...this.slides, ...this.slides.map((slide, index) => ({ ...slide, uniqueId: index + this.originalSlidesLength }))];
        this.indexCenter.set(Math.floor(this.originalSlidesLength));
        this.cdr.markForCheck();
        this.updateActiveSlide();
        this.resetSlidePosition();
      }
    });
  }

  onPan(event: Event) {
    console.log("onPAN");
  }

  onDragStart(event: MouseEvent | TouchEvent) {
    this.isDragging = true;
    this.startX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    event.preventDefault();
  }

  onDrag(event: MouseEvent | TouchEvent) {
    if (!this.isDragging) return;
    const currentX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const deltaX = currentX - this.startX;
    this.deltaX.set(deltaX);
    console.log('deltaX: ', deltaX)
    // Обновите положение слайдов
    this.updateSlidePosition();
  }

  onDragEnd(event: MouseEvent | TouchEvent) {
    this.isDragging = false;
    const threshold = 100;
    const deltaIndexValue = this.deltaIndex();

    if (deltaIndexValue > threshold) {
      this.previousSlide();
    } else if (deltaIndexValue < -threshold) {
      this.nextSlide();
    } else {
      this.resetSlidePosition();
    }

    // Обновляем indexCenter и сбрасываем deltaX
    const newIndexCenter = (this.indexCenter() + deltaIndexValue + this.slides.length) % this.slides.length;
    this.indexCenter.set(newIndexCenter);
    this.deltaX.set(0);
    this.updateActiveSlide();
    this.cdr.markForCheck();
  }

  resetSlidePosition() {
    const slides = document.querySelectorAll('.slide') as NodeListOf<HTMLElement>;
    slides.forEach((slide, index) => {
      const transform = this.getSlideTransform(index, this.deltaIndex());
      slide.style.transform = transform;
    });
  }

  updateSlidePosition() {
    this.slides.forEach((_, index) => {
      const slideElement = document.querySelector(`.slide:nth-child(${index + 1})`) as HTMLElement;
      slideElement.style.transform = this.getSlideTransform(index, this.deltaIndex());
    });
    // const slide = document.querySelector('.slides') as HTMLElement;
    // slide.style.setProperty('--current-translate', `${this.currentTranslate}px`);
  }

  getSlideTransform(index: number, deltaIndex: number): string {
    const totalSlides = this.slides.length;
    const arcAngle = 10; // Угол между слайдами
    const angle = arcAngle * (index - this.indexCenter() + deltaIndex); // Угол для каждого слайда

    console.log()
    const distance = this.screenWidth() < 1024 ? 1000 : 2400; // Расстояние между слайдами
    const translateX = distance * Math.sin(angle * (Math.PI / 180)); // Смещение по X
    const translateY = -distance * Math.cos(angle * (Math.PI / 180)); // Смещение по Y
    const additionalY = distance - 150; // Дополнительное смещение вниз

    return `translate(${translateX}px, ${translateY + additionalY}px) rotate(${angle}deg)`;
  }

  nextSlide() {
    console.log(this.slides.length <= this.visibleSlidesCount())
    console.log(this.slides.length, this.visibleSlidesCount())
    if (this.slides.length <= this.visibleSlidesCount() * 2 + 1) {
      if (this.indexCenter() < this.slides.length - 1) {
        this.indexCenter.update(value => value + 1);
      }
    } else {
      this.indexCenter.update(value => (value + 1) % this.slides.length);
    }
    this.updateActiveSlide();
    this.cdr.markForCheck();
  }

  previousSlide() {
    if (this.slides.length <= this.visibleSlidesCount() * 2 + 1) {
      if (this.indexCenter() > 0) {
        this.indexCenter.update(value => value - 1);
      }
    } else {
      this.indexCenter.update(value => (value - 1 + this.slides.length) % this.slides.length);
    }
    this.updateActiveSlide();
    this.cdr.markForCheck();
  }

  updateActiveSlide() {
    this.slides.forEach((slide, index) => {
      slide.isActive = index === this.indexCenter();
      console.log('indexCenter: ', this.indexCenter())
      slide.isVisible = this.getSlideState(index) === 'visible';
    });
  }

  getSlideState(index: number): string {
    const totalSlides = this.slides.length;
    const middleIndex = Math.floor(this.originalSlidesLength / 2);
    const lowerBound = (this.indexCenter() + middleIndex - this.visibleSlidesCount() + totalSlides) % totalSlides;
    const upperBound = (this.indexCenter() + middleIndex + this.visibleSlidesCount() + totalSlides) % totalSlides;

    const isVisible = (index >= lowerBound && index <= upperBound) || (lowerBound > upperBound && (index >= lowerBound || index <= upperBound));
    return isVisible ? 'visible' : 'hidden';
  }

  toggleOpen(index: number): void {
    const slideElement = document.querySelector(`.slide:nth-child(${index + 1})`) as HTMLElement;
    const imgWrapper = document.querySelector(`.img-wrapper`) as HTMLElement;
    if (slideElement.classList.contains('opened')) {
      slideElement.classList.remove('opened');
      slideElement.style.setProperty('width', `${this.slideWidth()}px`);
      slideElement.style.setProperty('height', `${this.slideHeight()}px`);
    } else {
      slideElement.classList.add('opened');
      const sliderContainer = document.querySelector('.slider-container') as HTMLElement;
      const sliderContainerParams = sliderContainer.getBoundingClientRect();
      const slideElementParams = slideElement.getBoundingClientRect();
      const imgWrapperParams = imgWrapper.getBoundingClientRect();

      slideElement.style.setProperty('transform', `translate(0px,0px)`);
      setTimeout(() => {
        slideElement.style.setProperty('transform',
          `translate(${(sliderContainerParams.width / 2) - (this.slideWidth() / 2)}px,
          ${(slideElementParams.height - sliderContainerParams.height) / 2}px)`);
        slideElement.style.setProperty('width', `${sliderContainerParams.width / 2.2}px`);
        slideElement.style.setProperty('height', `${sliderContainerParams.height}px`);
      }, 1000)
    }
  }
}
