import { Injectable } from '@angular/core';
import { HammerGestureConfig } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class HammerConfigService extends HammerGestureConfig {
  override = {
    'pan': { direction: 6 },
    'swipe': { direction: 6 },
  };

}
