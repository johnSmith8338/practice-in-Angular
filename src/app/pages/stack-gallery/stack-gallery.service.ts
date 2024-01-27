import { Injectable, inject, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface ServerSlide {
  srcUrl: string;
}
export interface Slide extends ServerSlide {
  index: number;
  // zIndex: number;
}

@Injectable({
  providedIn: 'root'
})
export class StackGalleryService {
  getSlidesData():Observable<{slides:ServerSlide[]}> {
    return this.http.get<{slides:ServerSlide[]}>('assets/slides.json');
  }

  currentIndex = signal<number>(0);
  updateCurrentIndex(index: number) {
    this.currentIndex.set(index);
  }

  constructor(
    private http: HttpClient,
  ) {}
}
