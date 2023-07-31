import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable, debounceTime, distinctUntilChanged, fromEvent, map } from 'rxjs';

@Component({
  selector: 'app-rxjs-test',
  templateUrl: './rxjs-test.component.html',
  styleUrls: ['./rxjs-test.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RxjsTestComponent implements OnInit {
  search$ = new Observable<Event>(observer => {  //subscribe:observer, создаем конструктор источника событий
    const search = document.getElementById('search'); //elementId:'search', получаем input по id

    if(!search) { //если search не найден, то observer выведет ошибку
      observer.error('No element here');
      return; //чтоб не производить подписку на null (не существующее событие)
    }
    search?.addEventListener('input', event => {  //type:'input', когда добавляется значение в input следим за его изменением. listener:event, событие 'input' принимает значение event
      observer.next(event); //метод next() позволяет передавать значения (сразу без задержек)
      /*
      observer.complete();  //если вдруг нужно послушать только первое значение и закончить слушать это событие вызываем метод complite()
      */
    })
  });

  /*
  const search$: Observable<Event> = fromEvent<Event>(document.getElementById('search'),'input'); //сокращенная запись кода сверху через rxjs
  */

  constructor() { }

  ngOnInit(): void {
    this.search$.pipe(
      map((event:any) => {  //project:event, позволяет извлечь не последний символ а всю строку из напечатанного
        return (event.target as HTMLInputElement).value;
      }),
      debounceTime(500),  //dueTime:500, pipe позволяет писать дополнительные методы к подписке. debounceTime задержка передачи значения на 500мс
      map(value => value.length > 3 ? value : ''),  //если значение меньше 3 символов то выводим пустую строку а если больше то выводим значение
      distinctUntilChanged()  //функция сохраняет предыдущее значение и проверяет если прошлое значение идентично следующему то выводится прошлое
      ).subscribe({  //observer: делаем подписку на observer
      next: value => {  //next:'value', каждый раз когда отрабатывает подписчик (.subscribe)
        console.log(value); //выводится значение value
      },
      error: err => console.log(err),  //выводим ошибку
      /*
      complete: () => {
        console.log('event ended');
      }
      */
    });
  }

}
