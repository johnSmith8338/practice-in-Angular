import { animate, group, keyframes, query, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, Renderer2 } from '@angular/core';
import { CardStackService } from './cards-stack.service';
import { Subject, takeUntil } from 'rxjs';

interface Item {
  srcUrl: string;
  index: number;
}
interface Dot {
  srcUrl: string;
  active: boolean;
}

@Component({
  selector: 'app-cards-stack',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './cards-stack.component.html',
  styleUrls: ['./cards-stack.component.scss'],
  animations: [
    trigger('slideAnimation', [
      state('out', style({border: '5px solid red'})),
      state('in', style({border: '5px solid green'})),
      transition('out <=> in', animate('1000ms'))
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardsStackComponent implements OnDestroy{
  state: 'out'|'in' = 'out'
  // updateItemAnimationState() {
  //   this.itemAnimationState = 'out';
  //   setTimeout(() => {
  //     this.itemAnimationState = 'in';
  //   }, 500); // Время анимации, согласованное с CSS
  // }
  
/*   clickSlide(event: MouseEvent) {
    const clickedItem = event.currentTarget as HTMLElement; //получаем элемент, по которому был клик

    const allItems = this.el.nativeElement.querySelectorAll('.cards-item'); //удаляем класс active у всех элементов
    allItems.forEach((item:HTMLElement) => this.renderer.removeClass(item, 'active'));

    this.renderer.addClass(clickedItem, 'active');  //добавляем active к текущему элементу

    // const activeItem = this.el.nativeElement.querySelector('.cards-item');
    // const addActiveClass =  this.renderer.addClass(activeItem, 'active');
    // const hasActiveClass = activeItem.classList.contains('active');
  } */

  data: Item[] = [
    {
      srcUrl: 'https://preview.ibb.co/jrsA6R/img12.jpg',
      index: 0,
    },
    {
      srcUrl: 'https://preview.ibb.co/kPE1D6/clouds.jpg',
      index: 1,
    },
    {
      srcUrl: 'https://preview.ibb.co/mwsA6R/img7.jpg',
      index: 2,
    },
    {
      srcUrl: 'https://preview.ibb.co/jrsA6R/img12.jpg',
      index: 3,
    },
    {
      srcUrl: 'https://preview.ibb.co/mwsA6R/img7.jpg',
      index: 4,
    },
  ];
  
  activeIndex:number|null = null;

  // dots: Dot[] = Array.from({ length: this.data.length }, (_, i) => ({ srcUrl: '', active: false }));
  get dots(): Dot[] {
    return this.data.map((_, i) => ({ srcUrl: '', active: i === this.activeIndex }));
  }
  /* get dots(): number[] {
    return Array.from({ length: this.data.length }, (_, i) => i);
    // return this.data.map(item => item.index);
  } */

  /* clickSlide(index: number) {
    if (index !== this.data.length - 1) {
      // Если кликнутый элемент не последний, удаляем его из текущей позиции и добавляем в конец
      const clickedItem = this.data.splice(index, 1)[0];
      this.data.push(clickedItem);
      this.activeIndex = index;
    }
  }

  clickDot(index: number) {
    this.activeIndex = index;
  } */

  constructor(
    private renderer:Renderer2,
    private el: ElementRef,
    private cdr: ChangeDetectorRef,
  ) {}

// первый смещается в конец, а нажатый наверх
  clickSlide(index: number) {
    // this.data.reverse();
    // const temp = this.data[index];  //меняем местами текущий элемент с первым
    // this.data[index] = this.data[0];
    // this.data[0] = temp; 
    /* if(this.data[index]) {
      const clickedItem = this.data[index];
      this.data.splice(index, 1);
      this.data.unshift(clickedItem);
      this.activeIndex = 0;
      this.updateDotActivity();
    } */
    /* if (this.data[index]) {
      this.data.forEach((item, i) => item.index = (item.index + 1) % this.data.length);
      this.activeIndex = index;
      this.updateDotActivity();
    } */
    // if (this.data[index]) {
    if (index > 0) {
      // перемещает слайды по одному вверх
      /* // Меняем местами элементы массива в обратном порядке
      const clickedItem = this.data[index];
      this.data[index] = this.data[(index - 1 + this.data.length) % this.data.length];
      this.data[(index - 1 + this.data.length) % this.data.length] = clickedItem; */
      
      // const clickedItem = this.data[index];
      // this.data.splice(index, 1);
      // this.data.unshift(clickedItem);

      // Перемещаем текущий элемент в самый верх массива
      const clickedItem = this.data.splice(index, 1)[0];
      this.data.unshift(clickedItem);

      // Перемещаем первый элемент вниз
      const firstItem = this.data.pop();
      if (firstItem) {
        this.data.splice(1, 0, firstItem);
        this.state = index===0?'out':'in';
      }
  
      // Обновляем индексы элементов
      this.data.forEach((item, i) => item.index = i);
  
      this.activeIndex = index;
      this.updateDotActivity();
    }
  }
  clickDot(index: number) {
    this.activeIndex = index;
    this.updateDotActivity();
  }
  private updateDotActivity() {
    this.dots.forEach((dot, i) => {
      dot.active = i === this.activeIndex;
    });
  }

  ngOnDestroy(): void {
  }
}
