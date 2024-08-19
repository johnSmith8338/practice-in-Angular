import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { HAMMER_GESTURE_CONFIG, HammerGestureConfig } from '@angular/platform-browser';
import * as Hammer from 'hammerjs'

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

  slides: Card[] = [];

  @ViewChild('sliderContainer', { static: false }) sliderContainer!: ElementRef<HTMLDivElement>;
  slideWidth = 340;
  visibleSlidesCount = 2;

  trackById(index: number, item: Card) {
    return item.id;
  }

  getCards() {
    return this.http.get<CardsData>(this.cardsUrl);
  }

  ngOnInit(): void {
    this.getCards().subscribe((data: { slides: Card[] }) => {
      this.slides = data.slides;
      this.cdr.markForCheck();
      this.updateActiveSlide();
    });
  }

  onPan(event: Event) {
    console.log("onPAN");
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    console.log('resized', window.innerWidth);
  }

  currentIndex = 0;

  getSlideTransform(index: number): string {
    const totalSlides = this.slides.length;
    const arcAngle = 10; // Угол между слайдами
    const middleIndex = Math.floor(totalSlides / 2);
    const startAngle = -arcAngle * middleIndex; // Центрируем дугу
    const angle = startAngle + ((index - this.currentIndex + totalSlides) % totalSlides) * arcAngle; // Угол для каждого слайда

    const distance = 2400; // Расстояние между слайдами
    const translateX = distance * Math.sin(angle * (Math.PI / 180)); // Смещение по X
    const translateY = -distance * Math.cos(angle * (Math.PI / 180)); // Смещение по Y
    const additionalY = distance - 150; // Дополнительное смещение вниз

    return `translate(${translateX}px, ${translateY + additionalY}px) rotate(${angle}deg)`;

    /*
    простой круговой слайдер

    const offset = (index - this.currentIndex) * this.slideWidth;
    return `translateX(${offset}px)`;
    */
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    this.updateActiveSlide();
    this.cdr.detectChanges();
  }

  previousSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.updateActiveSlide();
    this.cdr.detectChanges();
  }

  updateActiveSlide() {
    const totalSlides = this.slides.length;
    const middleIndex = Math.floor(totalSlides / 2);

    this.slides.forEach((slide, index) => {
      slide.isActive = index === (this.currentIndex + middleIndex) % totalSlides;
    });
  }

  getSlideState(index: number): string {
    const totalSlides = this.slides.length;
    const middleIndex = Math.floor(totalSlides / 2);
    const lowerBound = (this.currentIndex + middleIndex - this.visibleSlidesCount + totalSlides) % totalSlides;
    const upperBound = (this.currentIndex + middleIndex + this.visibleSlidesCount + totalSlides) % totalSlides;
    const isVisible = (index >= lowerBound && index <= upperBound) || (lowerBound > upperBound && (index >= lowerBound || index <= upperBound));
    return isVisible ? 'visible' : 'hidden';
  }
}
