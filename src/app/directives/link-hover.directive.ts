import { Directive, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[appLinkHover]'
})
export class LinkHoverDirective {
  @HostBinding('style.background') background = 'transparent';

  @HostBinding('style.color') color = '#333';

  @HostListener('mouseenter') addBackgoound() {
    // console.log('mouseenter');
    this.background = '#333';
    this.color = '#fff';
  }

  @HostListener('mouseleave') removeBackgoound() {
    // console.log('mouseleave');
    this.background = 'transparent';
    this.color = '#333';
  }

  constructor() { }

}
