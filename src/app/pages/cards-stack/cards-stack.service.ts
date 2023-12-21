import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CardStackService {
  private activeIndexSubject = new BehaviorSubject<number | null>(null);

  setActiveIndex(index: number | null) {
    this.activeIndexSubject.next(index);
  }

  getActiveIndex$() {
    return this.activeIndexSubject.asObservable();
  }
}