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
    this.deltaX();
    console.log('deltaX: ', this.deltaX())
    window.addEventListener('resize', () => {
      this.screenWidth.set(window.innerWidth);
    });
    effect(() => {
      const delta = Math.round(this.deltaIndex());
      this.slides.forEach((_, index) => {
        if (this.slides) {
          const slideElement = document.querySelector(`.slide:nth-child(${index + 1})`) as HTMLElement;
          slideElement.style.transform = this.getSlideTransform(index, this.deltaX()); // Устанавливаем transform
        }
      });
    });
  }

  ngOnInit(): void {
    this.getCards().subscribe((data: { slides: Card[] }) => {
      const visibleSlides = this.visibleSlidesCount() * 2 + 1;

      // Инициализируем оригинальный массив слайдов
      const originalSlides = data.slides.map((slide, index) => ({
        ...slide,
        uniqueId: index
      }));
      this.originalSlidesLength = originalSlides.length;

      // Создаем две дополнительные копии слайдов с уникальными идентификаторами
      const clonedSlides1 = originalSlides.map((slide, index) => ({
        ...slide,
        uniqueId: index + this.originalSlidesLength,
      }));

      // Объединяем все слайды в один массив
      this.slides = [...clonedSlides1, ...originalSlides];

      const activeSlideIndex = this.slides.findIndex(slide => slide.isActive);
      this.indexCenter.set(0);

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

    // console.log('deltaX:', deltaX);

    // Обновляем положение слайдов при изменении deltaX
    this.updateSlidePosition();
  }

  onDragEnd(event: MouseEvent | TouchEvent) {
    this.isDragging = false;

    // Вычисляем новый индекс центра
    this.calculateIndexCenter();

    // Сбрасываем deltaX и обновляем слайдер
    this.deltaX.set(0);
    this.updateSlidePosition();
    this.updateActiveSlide();
    this.cdr.markForCheck();
  }


  calculateIndexCenter(): void {
    const maxSlides = this.visibleSlidesCount() * 2 + 1;
    const slideWidth = this.screenWidth() / maxSlides;
    const indexDelta = Math.round(this.deltaX() / slideWidth); // Округляем до ближайшего целого

    let newIndexCenter = this.indexCenter() + indexDelta;

    // Убедимся, что индекс не выходит за пределы
    if (newIndexCenter < 0) {
      newIndexCenter = this.slides.length - 1;
    } else if (newIndexCenter >= this.slides.length) {
      newIndexCenter = 0;
    }

    this.indexCenter.set(newIndexCenter);
  }


  resetSlidePosition() {
    const slides = document.querySelectorAll('.slide') as NodeListOf<HTMLElement>;
    slides.forEach((slide, index) => {
      const transform = this.getSlideTransform(index, this.deltaX());
      slide.style.transform = transform;
    });
  }

  updateSlidePosition(noTransition = false) {
    const slides = document.querySelectorAll('.slide') as NodeListOf<HTMLElement>;

    const arcAngle = 12; // Угол между слайдами
    const distance = 2600; // Радиус (расстояние до центра вращения)

    // Ограничиваем значение deltaX
    const maxDelta = this.screenWidth(); // Пример: макс. deltaX равен ширине экрана
    const correctedDeltaX = Math.min(Math.max(this.deltaX(), -maxDelta), maxDelta);

    slides.forEach((slide, index) => {
      const relativeIndex = (index - this.indexCenter() + this.slides.length) % this.slides.length;

      // Вычисляем угол для текущего слайда с учетом ограниченного deltaX
      const angle = arcAngle * (relativeIndex - Math.floor(this.slides.length / 2)) + correctedDeltaX / 10;

      // Устанавливаем постоянный радиус через transform-origin и вращаем слайды вниз
      slide.style.transformOrigin = `center ${distance}px`; // Смещение вниз на расстояние `distance`
      slide.style.transform = `rotate(${angle}deg)`;

      // Добавляем плавность анимации
      slide.style.transition = noTransition ? 'none' : 'transform 0.5s ease';
    });
  }

  getSlideTransform(index: number, deltaX: number): string {
    const totalSlides = this.slides.length;
    const relativeIndex = (index - this.indexCenter() + totalSlides) % totalSlides; // Относительный индекс слайда

    const arcAngle = 12; // Угол между слайдами
    let angle = arcAngle * (relativeIndex - Math.floor(totalSlides / 2)); // Угол с учетом положения относительно центра

    // Применяем deltaX к углу
    angle -= deltaX / 10; // Корректировка угла на основе deltaX

    const radius = this.screenWidth() < 1024 ? 1000 : 2600; // Радиус вращения
    const slideElement = document.querySelector(`.slide:nth-child(${index + 1})`) as HTMLElement;
    slideElement.style.transformOrigin = `center ${radius}px`; // Устанавливаем transform-origin
    return `rotate(${angle}deg)`;
  }

  nextSlide() {
    if (this.slides.length <= this.visibleSlidesCount() * 2 + 1) {
      if (this.indexCenter() < this.slides.length - 1) {
        this.indexCenter.update(value => value + 1);
      }
    } else {
      this.indexCenter.update(value => (value + 1) % this.slides.length);
    }
    this.updateSlidePosition(); // Убедитесь, что слайды обновляются
    this.updateActiveSlide();
  }

  previousSlide() {
    if (this.slides.length <= this.visibleSlidesCount() * 2 + 1) {
      if (this.indexCenter() > 0) {
        this.indexCenter.update(value => value - 1);
      }
    } else {
      this.indexCenter.update(value => (value - 1 + this.slides.length) % this.slides.length);
    }
    this.updateSlidePosition(); // Убедитесь, что слайды обновляются
    this.updateActiveSlide();
  }

  updateActiveSlide() {
    // Учитываем только оригинальные слайды для центра
    const centerIndexInOriginal = this.indexCenter() % this.originalSlidesLength;

    this.slides.forEach((slide, index) => {
      // Устанавливаем класс .active только для слайда, соответствующего centerIndexInOriginal
      slide.isActive = (index % this.originalSlidesLength) === centerIndexInOriginal;
    });
  }

  getSlideState(index: number): boolean {
    const totalSlides = this.slides.length;

    // Проверяем, находится ли слайд в начале или в конце списка
    const isAtStart = index === 0 && this.indexCenter() === totalSlides - 1;
    const isAtEnd = index === totalSlides - 1 && this.indexCenter() === 0;

    // Скрываем слайды, которые перемещаются с конца в начало и наоборот
    const isVisible = !isAtStart && !isAtEnd;
    return isVisible;
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
