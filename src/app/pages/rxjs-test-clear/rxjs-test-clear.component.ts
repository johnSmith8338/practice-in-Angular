import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable, debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs';

@Component({
  selector: 'app-rxjs-test-clear',
  templateUrl: './rxjs-test-clear.component.html',
  styleUrls: ['./rxjs-test-clear.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RxjsTestClearComponent implements OnInit {
  search$ = new Observable<Event>(observer => {  //subscribe:observer, создаем конструктор источника событий
    const search = document.getElementById('search'); //elementId:'search', получаем input по id
    const stop = document.getElementById('stop'); //elementId:'stop', получаем button по id

    if(!search || !stop) { //если search или stop не найден, то observer выведет ошибку
      observer.error('No element here');
      return; //чтоб не производить подписку на null (не существующее событие)
    }

    const onSearch = (event: any) => {
      console.log('123');
      checkSubscription();  //проверяем отписались мы или нет
      observer.next(event); //метод next() позволяет передавать значения (сразу без задержек)
    }

    const checkSubscription = () => { //проверяем если отписались от события то свойство closed у Subscription будет true
      if(observer.closed) { //если отписка завершена то вызываем функции clearAll
        clearAll();  //очищаем EventListener
      }
    };

    const onStop = (event:any) => { //событие которое будет вызываться при нажатии на кнопку Stop
      checkSubscription();  //проверяем отписались мы или нет
      observer.complete();  //если вдруг нужно послушать только первое значение и закончить слушать это событие вызываем метод complite()
      clearAll();  //очищаем EventListener
    }

    search?.addEventListener('input', onSearch);  //type:'input', когда добавляется значение в input следим за его изменением. listener:event, событие 'input' принимает значение event
    stop?.addEventListener('click', onStop);  //каждый раз когда мы нажимаем на кнопку срабатывает метод onStop

    const clearAll = () => {
      search.removeEventListener('input', onSearch);  //метод для очистки от слежения
      stop.removeEventListener('click', onStop);  //метод для очистки от слежения
    }
  });

  /*
  //используя rxjs получаем input по id 'search' и следим за изменениями события input через event
  const search$: Observable<Event> = fromEvent<Event>(document.getElementById('search'),'input');
  */
  /*
  // используя rxjs получаем кнопку по id 'stop' и следим за тем когда на нее нажмут через event
  const stop$: Observable<Event> = fromEvent<Event>(document.getElementById('stop'),'click');
  */

  constructor() { }

  ngOnInit(): void {
    const searchSubscription = this.search$.pipe(  //pipe позволяет писать дополнительные методы к подписке
      map((event:any) => {  //project:event, позволяет извлечь не последний символ а всю строку из напечатанного
        return (event.target as HTMLInputElement).value;
      }),
      debounceTime(500),  //dueTime:500, debounceTime задержка передачи значения на 500мс
      map(value => value.length > 3 ? value : ''),  //если значение меньше 3 символов то выводим пустую строку а если больше то выводим значение
      distinctUntilChanged(),  //функция сохраняет предыдущее значение и проверяет если прошлое значение идентично следующему то выводится прошлое
      // takeUntil(stop$), //тоже самое что и stopSubscription только средствами rxjs
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

    /*
    const stopSubscription = stop$.subscribe( () => { //подписываемся на событие нажатия на кнопку
      searchSubscription.unsubscribe(); //отписываемся от подписки на input после нажатия на кнопку
      stopSubscription.unsubscribe(); //отписываемся от подписки на кнопку после нажатия на кнопку
    });
    */

    /*
    setTimeout(() => {  //устанавливаем таймер на 10 секунд
      console.log('unsubscribed');
      searchSubscription.unsubscribe(); //вызываем метод для отписки от observer
    }, 10000);
    */
  }

}
