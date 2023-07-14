import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { ParentComponent } from './test-hooks/parent/parent.component';
import { ChildComponent } from './test-hooks/parent/child/child.component';
import { LinkHoverDirective } from './directives/link-hover.directive';
import { LinkDirectiveTestComponent } from './pages/link-directive-test/link-directive-test.component';
import { AutoHeightTestComponent } from './pages/auto-height-test/auto-height-test.component';
import { BottomBlockComponent } from './pages/auto-height-test/bottom-block/bottom-block.component';
import { SlideBlockComponent } from './pages/auto-height-test/slide-block/slide-block.component';

@NgModule({
  declarations: [
    AppComponent,
    GalleryComponent,
    ParentComponent,
    ChildComponent,
    LinkHoverDirective,
    LinkDirectiveTestComponent,
    AutoHeightTestComponent,
    BottomBlockComponent,
    SlideBlockComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
