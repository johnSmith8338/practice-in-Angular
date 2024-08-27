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
    const indexDelta = this.deltaX() / (this.screenWidth() / maxSlides) * -1;
    if (Math.abs(indexDelta) > maxSlides) {
      console.log('>>>')
      return indexDelta > 0 ? maxSlides * -1 : maxSlides;
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
        slideElement.style.transform = this.getSlideTransform(index);
      });
    });
  }

  ngOnInit(): void {
    this.getCards().subscribe((data: { slides: Card[] }) => {
      // Инициализируем оригинальный массив слайдов
      const originalSlides = data.slides.map((slide, index) => ({
        ...slide,
        uniqueId: index,
      }));
      this.originalSlidesLength = originalSlides.length;

      // Создаем две дополнительные копии слайдов с уникальными идентификаторами
      const clonedSlides1 = originalSlides.map((slide, index) => ({
        ...slide,
        uniqueId: index + this.originalSlidesLength,
      }));

      const clonedSlides2 = originalSlides.map((slide, index) => ({
        ...slide,
        uniqueId: index + this.originalSlidesLength * 2,
      }));

      // Объединяем все слайды в один массив
      this.slides = [...originalSlides, ...clonedSlides1, ...clonedSlides2];

      // Устанавливаем indexCenter на середину общего массива
      this.indexCenter.set(this.originalSlidesLength);

      // Обновляем отображение
      this.updateSlidePosition();
      this.updateActiveSlide();
      this.cdr.markForCheck();
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

    console.log('deltaX:', deltaX);

    // Положение слайдов обновляется при каждом изменении deltaX
    this.updateSlidePosition();
  }

  onDragEnd(event: MouseEvent | TouchEvent) {
    this.isDragging = false;

    // Если deltaX больше порогового значения в правую сторону
    if (this.deltaX() > 50) {
      this.nextSlide(); // Увеличиваем indexCenter
    }
    // Если deltaX больше порогового значения в левую сторону
    else if (this.deltaX() < -50) {
      this.previousSlide(); // Уменьшаем indexCenter
    } else {
      this.resetSlidePosition(); // Возвращаем на место
    }

    // Сбрасываем deltaX и обновляем слайдер
    this.deltaX.set(0);
    this.updateActiveSlide();
    this.cdr.markForCheck();
  }

  resetSlidePosition() {
    const slides = document.querySelectorAll('.slide') as NodeListOf<HTMLElement>;
    slides.forEach((slide, index) => {
      const transform = this.getSlideTransform(index);
      slide.style.transform = transform;
    });
  }

  updateSlidePosition(noTransition = false) {
    this.slides.forEach((slide, index) => {
      const slideElement = document.querySelector(`.slide[data-unique-id="${slide.uniqueId}"]`) as HTMLElement;
      if (slideElement) {
        slideElement.style.transform = this.getSlideTransform(index);
        slideElement.style.transition = noTransition ? 'none' : 'transform 0.5s ease';
      }
    });

    // const slide = document.querySelector('.slides') as HTMLElement;
    // slide.style.setProperty('--current-translate', `${this.currentTranslate}px`);
  }

  getSlideTransform(index: number): string {
    const totalSlides = this.slides.length;
    const relativeIndex = (index - this.indexCenter() + totalSlides) % totalSlides; // Относительный индекс слайда

    const arcAngle = 10; // Угол между слайдами
    let angle = arcAngle * (relativeIndex - Math.floor(totalSlides / 2)); // Угол с учетом положения относительно центра

    const distance = this.screenWidth() < 1024 ? 1000 : 2400; // Расстояние между слайдами
    const translateX = distance * Math.sin(angle * (Math.PI / 180)); // Смещение по X
    const translateY = -distance * Math.cos(angle * (Math.PI / 180)); // Смещение по Y
    const additionalY = distance - 150; // Дополнительное смещение вниз

    return `translate(${translateX}px, ${translateY + additionalY}px) rotate(${angle}deg)`;
  }

  nextSlide() {
    if (this.slides.length <= this.visibleSlidesCount() * 2 + 1) {
      if (this.indexCenter() < this.slides.length - 1) {
        this.indexCenter.update(value => value + 1);
      }
    } else {
      this.indexCenter.update(value => (value + 1) % this.slides.length);
    }
    this.updateActiveSlide();
    // this.cdr.markForCheck();
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
    // this.cdr.markForCheck();
  }

  updateActiveSlide() {
    const centerIndexInOriginal = this.indexCenter() % this.originalSlidesLength;

    this.slides.forEach((slide, index) => {
      // Устанавливаем класс .active только для слайда, соответствующего centerIndexInOriginal
      slide.isActive = (index % this.originalSlidesLength) === centerIndexInOriginal;

      // Логируем для отладки
      console.log('slide id:', slide.id);
      console.log('indexCenter:', this.indexCenter());

      // Определяем видимость слайда
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
