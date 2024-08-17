import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, inject, OnInit, ViewChild } from '@angular/core';

export interface Card {
  id: number;
  srcUrl: string;
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
  templateUrl: './karo-circle-gallery.component.html',
  styleUrls: ['./karo-circle-gallery.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KaroCircleGalleryComponent implements OnInit {
  cardsUrl = 'assets/slides.json';
  http = inject(HttpClient);
  cdr = inject(ChangeDetectorRef);

  slides: Card[] = [];

  @ViewChild('sliderContainer', { static: false }) sliderContainer!: ElementRef<HTMLDivElement>;
  slideWidth = 340;

  getCards() {
    return this.http.get<CardsData>(this.cardsUrl);
  }

  ngOnInit(): void {
    this.getCards().subscribe((data: { slides: Card[] }) => {
      this.slides = data.slides;
      this.cdr.markForCheck();
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    console.log('resized');
  }

  currentIndex = 0;

  getSlideTransform(index: number): string {
    const totalSlides = this.slides.length;
    const arcAngle = 10; // Угол между слайдами
    const startAngle = -arcAngle * (totalSlides - 1) / 2; // Центрируем дугу
    const angle = startAngle + (index * arcAngle); // Угол для каждого слайда

    const distance = 2400; // Расстояние между слайдами
    const translateX = distance * Math.sin(angle * (Math.PI / 180)); // Смещение по X
    const translateY = -distance * Math.cos(angle * (Math.PI / 180)); // Смещение по Y
    const additionalY = distance - 150; // Дополнительное смещение вниз

    return `translate(${translateX}px, ${translateY + additionalY}px) rotate(${angle}deg)`;
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
  }

  previousSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
  }
}
