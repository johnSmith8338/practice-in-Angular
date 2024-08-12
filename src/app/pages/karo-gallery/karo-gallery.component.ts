import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, Renderer2 } from '@angular/core';

export interface Card {
  id: number;
  srcUrl: string;
}
export interface CardsData {
  slides: Card[];
}

@Component({
  selector: 'app-karo-gallery',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
  ],
  templateUrl: './karo-gallery.component.html',
  styleUrls: ['./karo-gallery.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KaroGalleryComponent implements OnInit {
  cardsUrl = 'assets/slides.json';
  http = inject(HttpClient);
  cdr = inject(ChangeDetectorRef);
  renderer = inject(Renderer2);

  slides: Card[] = [];

  currentIndex = 0;
  startX = 0;
  currentTranslate = 0;
  isDragging = false;
  sliderWidth = 340;

  getCards() {
    return this.http.get<CardsData>(this.cardsUrl);
  }

  ngOnInit(): void {
    this.getCards().subscribe((data: { slides: Card[] }) => {
      this.slides = data.slides;
      const middleIndex = Math.floor(this.slides.length / 2);
      this.currentIndex = middleIndex;

      const sliderContainerWidth = window.innerWidth;
      const totalSlideWidth = this.sliderWidth + 80;

      const offset = (sliderContainerWidth / 2) - (this.sliderWidth / 2) - (middleIndex * totalSlideWidth);

      this.setSliderTransform(offset);
      this.cdr.markForCheck();
    });
  }

  prevSlide() {
    this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.slides.length - 1;
    this.updateSlidesPosition();
  }
  nextSlide() {
    this.currentIndex = this.currentIndex < this.slides.length - 1 ? this.currentIndex + 1 : 0;
    this.updateSlidesPosition();
  }
  updateSlidesPosition() {
    const offset = -this.currentIndex * this.sliderWidth;
    const slider = document.querySelector('.slides') as HTMLElement;
    slider.style.transform = `translateX(${offset}px)`;
  }

  onStart(event: MouseEvent | TouchEvent) {
    this.isDragging = true;
    this.startX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    this.currentTranslate = this.getCurrentTranslate();
    event.preventDefault();
  }
  onMove(event: MouseEvent | TouchEvent) {
    if (!this.isDragging) return;
    const currentX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const diff = currentX - this.startX;
    this.setSliderTransform(this.currentTranslate + diff);
  }
  onEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;

    const slider = document.querySelector('.slides') as HTMLElement;
    const currentTranslate = this.getCurrentTranslate();
    const offset = currentTranslate - (-this.currentIndex * this.sliderWidth);
    const threshold = this.sliderWidth / 3;

    if (offset < -threshold) {
      if (this.currentIndex < this.slides.length - 1) {
        this.currentIndex++;
      }
    } else if (offset > threshold) {
      if (this.currentIndex > 0) {
        this.currentIndex--;
      }
    }

    this.updateSlidesPosition();
  }
  onMouseLeave() {
    if (this.isDragging) this.onEnd();
  }
  setSliderTransform(value: number) {
    const slider = document.querySelector('.slides') as HTMLElement;
    slider.style.transform = `translateX(${value}px)`;
  }
  getCurrentTranslate(): number {
    const slider = document.querySelector('.slides') as HTMLElement;
    const transform = window.getComputedStyle(slider).transform;

    if (transform === 'none') return 0;

    const matrix = new DOMMatrix(transform);
    return matrix.m41;
  }
}
