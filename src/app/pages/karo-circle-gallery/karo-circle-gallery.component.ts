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
  text?: string;
  isActive: boolean;
  isVisible: boolean;
  isOpen?: boolean;
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

      if (this.originalSlidesLength >= visibleSlides) {
        const clonedSlides1 = originalSlides.map((slide, index) => ({
          ...slide,
          uniqueId: index + this.originalSlidesLength,
        }));

        // Объединяем все слайды в один массив
        if (this.originalSlidesLength % 2) {
          this.slides = [...clonedSlides1, ...originalSlides];
        }
      } else {
        this.slides = [...originalSlides];
      }

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

  // @HostListener('mousedown', ['$event'])
  // @HostListener('touchstart', ['$event'])
  onDragStart(event: MouseEvent | TouchEvent) {
    this.isDragging = true;
    this.startX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    // event.preventDefault();
  }

  // @HostListener('mousemove', ['$event'])
  // @HostListener('touchmove', ['$event'])
  onDrag(event: MouseEvent | TouchEvent) {
    if (!this.isDragging) return;

    const currentX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const deltaX = currentX - this.startX;
    this.deltaX.set(deltaX);

    // console.log('deltaX:', deltaX);

    // Обновляем положение слайдов при изменении deltaX
    this.updateSlidePosition();
  }

  // @HostListener('mouseup', ['$event'])
  // @HostListener('mouseleave', ['$event'])
  // @HostListener('touchend', ['$event'])
  onDragEnd(event: MouseEvent | TouchEvent) {
    this.isDragging = false;

    // Вычисляем новый индекс центра
    this.calculateIndexCenter();

    /*
        const observer = new MutationObserver((mutationsList) => {
          mutationsList.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
              const slide = mutation.target as HTMLElement;
              const transform = slide.style.transform;
    
              // Проверяем, есть ли трансформация rotate и извлекаем значение угла
              const match = transform.match(/rotate\(([-\d.]+)deg\)/);
              if (match) {
                const angle = parseFloat(match[1]);
    
                // Условие для проверки угла и изменения прозрачности
                if (Math.abs(angle) > 30) {
                  slide.style.opacity = '0';
                }
              }
            }
          });
        });
    
        const slides = document.querySelectorAll('.slide');
        slides.forEach(slide => {
          observer.observe(slide, { attributes: true });
        });
        // Возвращаем прозрачность после завершения перемещения
        setTimeout(() => {
          slides.forEach(slide => {
            const slideElement = slide as HTMLElement;
            slideElement.style.opacity = '1';
          });
    
          // Отключаем наблюдателя после завершения перемещения
          observer.disconnect();
        }, 300);
    */

    // Сбрасываем deltaX и обновляем слайдер
    this.updateSlidePosition();
    this.updateActiveSlide();
    this.deltaX.set(0);
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
    const totalSlides = this.slides.length;
    const visibleSlides = this.visibleSlidesCount() * 2 + 1; // Количество видимых слайдов

    // Ограничение deltaX
    if (Math.abs(this.deltaX()) > 600) {
      this.deltaX.set(this.deltaX() > 0 ? 650 : -600);
    } else {
      this.deltaX.set(this.deltaX());
    }

    const arcAngle = 12; // Угол между слайдами
    const distance = this.screenWidth() < 1024 ? 1000 : 2600; // Радиус (расстояние до центра вращения)

    slides.forEach((slide, index) => {
      let angle: number;

      if (totalSlides <= visibleSlides) {
        // Если количество слайдов меньше или равно видимым, распределяем слайды линейно от начала
        angle = arcAngle * index + this.deltaX() / 50; // Последовательное распределение углов от начала
      } else {
        // Стандартное распределение углов для большего количества слайдов
        const relativeIndex = (index - this.indexCenter() + totalSlides) % totalSlides;
        angle = arcAngle * (relativeIndex - Math.floor(totalSlides / 2)) + this.deltaX() / 50;
      }

      // Корректируем угол для перехода в отрицательную сторону при необходимости
      if (angle > 180) {
        angle -= 360;
      } else if (angle < -180) {
        angle += 360;
      }

      // Устанавливаем постоянный радиус через transform-origin и вращаем слайды
      slide.style.transformOrigin = `center ${distance}px`;
      slide.style.transform = `rotate(${angle}deg)`;

      // Добавляем плавность анимации
      slide.style.transition = noTransition ? 'none' : '500ms ease';
    });
  }

  getSlideTransform(index: number, deltaX: number): string {
    const slides = document.querySelectorAll('.slide') as NodeListOf<HTMLElement>;
    const totalSlides = this.slides.length;
    const visibleSlides = this.visibleSlidesCount() * 2 + 1;
    const arcAngle = 12; // Угол между слайдами
    const radius = this.screenWidth() < 1024 ? 1000 : 2600; // Радиус вращения

    let angle: number;
    if (totalSlides <= visibleSlides) {
      // Рассчитываем угол для малых количеств слайдов
      angle = arcAngle * index + deltaX / 50;
    } else {
      // Стандартный режим для большего количества слайдов
      const relativeIndex = (index - this.indexCenter() + totalSlides) % totalSlides;
      angle = arcAngle * (relativeIndex - Math.floor(totalSlides / 2)) + deltaX / 50;
    }

    // Корректируем угол для перехода в отрицательную сторону при необходимости
    if (angle > 180) {
      angle -= 360;
    } else if (angle < -180) {
      angle += 360;
    }
    slides.forEach((slide, index) => {
      slide.style.transformOrigin = `center ${radius}px`
    })

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
    this.updateSlidePosition();
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
    this.updateSlidePosition();
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

  toggleOpen(index: number, event?: MouseEvent): void {
    if (event) {
      event.preventDefault();
    }
    console.log('slide clicked');
    const slideElement = document.querySelector(`.slide:nth-child(${index + 1})`) as HTMLElement;
    const sliderContainer = document.querySelector('.slider-container') as HTMLElement;
    const imgWrapper = document.querySelector('.img-wrapper') as HTMLElement;
    const infoBlocks = document.querySelectorAll('.info-block') as NodeListOf<HTMLElement>;

    if (!slideElement || !sliderContainer || !imgWrapper) return;

    // Рассчитываем ширину info-block по умолчанию
    const sliderContainerParams = sliderContainer.getBoundingClientRect();
    const infoBlockWidth = sliderContainerParams.width - (sliderContainerParams.width / 2.2);

    // Устанавливаем ширину для всех info-block по умолчанию
    infoBlocks.forEach((block) => {
      block.style.width = `${Math.round(infoBlockWidth)}px`;
    });

    const toggleClass = (element: HTMLElement, className: string) => {
      element.classList.toggle(className);
    };

    const setSlideDimensions = (width: string, height: string, transform?: string) => {
      slideElement.style.setProperty('width', width);
      slideElement.style.setProperty('height', height);
      if (transform) {
        slideElement.style.setProperty('transform', transform);
      }
    };

    if (slideElement.classList.contains('opened')) {
      toggleClass(slideElement, 'opened');

      infoBlocks.forEach((block, i) => {
        if (i === index) {
          block.classList.remove('opened');
        }
      });

      setSlideDimensions(`${this.slideWidth()}px`, `${this.slideHeight()}px`);
    } else {
      toggleClass(slideElement, 'opened');

      infoBlocks.forEach((block, i) => {
        if (i === index) {
          block.classList.add('opened');
        }
      });

      setSlideDimensions(`${this.slideWidth()}px`, `${this.slideHeight()}px`, 'translate(0px,0px)');

      const transitionDuration = 500;
      const openedSlideWidth = sliderContainerParams.width / 2.2;
      setSlideDimensions(`${openedSlideWidth}px`, `${sliderContainerParams.height}px`);

      setTimeout(() => {
        const slideParams = slideElement.getBoundingClientRect();
        const transform = `translate(${Math.floor(sliderContainerParams.right - slideParams.right)}px, ${-sliderContainerParams.top}px)`;
        setSlideDimensions(`${Math.round(openedSlideWidth)}px`, `${Math.round(sliderContainerParams.height)}px`, transform);
      }, transitionDuration);
    }
  }
}
