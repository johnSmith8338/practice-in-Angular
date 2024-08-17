import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule, HammerModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { ParentComponent } from './test-hooks/parent/parent.component';
import { ChildComponent } from './test-hooks/parent/child/child.component';
import { LinkHoverDirective } from './directives/link-hover.directive';
import { LinkDirectiveTestComponent } from './pages/link-directive-test/link-directive-test.component';
import { AutoHeightTestComponent } from './pages/auto-height-test/auto-height-test.component';
import { BottomBlockComponent } from './pages/auto-height-test/bottom-block/bottom-block.component';
import { SlideBlockComponent } from './pages/auto-height-test/slide-block/slide-block.component';
import { RxjsTestComponent } from './pages/rxjs-test/rxjs-test.component';
import { RxjsTestClearComponent } from './pages/rxjs-test-clear/rxjs-test-clear.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GridCardLayoutComponent } from './grid-card-layout/grid-card-layout.component';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
// import function to register Swiper custom elements
import { register } from 'swiper/element/bundle';
import { CardsGalleryComponent } from './pages/cards-gallery/cards-gallery.component';
// import 'hammerjs';
import { CardsStackComponent } from './pages/cards-stack/cards-stack.component';
import { CardStackService } from './pages/cards-stack/cards-stack.service';
import { CatComponent } from './pages/cat/cat.component';
import { StackGalleryComponent } from './pages/stack-gallery/stack-gallery.component';
import { HttpClientModule } from '@angular/common/http';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { KaroGalleryComponent } from './pages/karo-gallery/karo-gallery.component';
import { KaroCircleGalleryComponent } from './pages/karo-circle-gallery/karo-circle-gallery.component';
// register Swiper custom elements
register();

@NgModule({
  declarations: [
    AppComponent,
    ParentComponent,
    ChildComponent,
    LinkHoverDirective,
    LinkDirectiveTestComponent,
    AutoHeightTestComponent,
    BottomBlockComponent,
    SlideBlockComponent,
    RxjsTestComponent,
    RxjsTestClearComponent,
    GridCardLayoutComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatGridListModule,
    MatIconModule,
    CardsGalleryComponent,
    CardsStackComponent,
    CatComponent,
    StackGalleryComponent,
    HttpClientModule,
    GalleryComponent,
    HammerModule,
    CarouselModule,
    KaroGalleryComponent,
    KaroCircleGalleryComponent,
  ],
  exports: [
    MatCardModule,
    MatGridListModule,
    MatIconModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
