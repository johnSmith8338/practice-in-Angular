import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-cat',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './cat.component.html',
  styleUrls: ['./cat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatComponent { }
