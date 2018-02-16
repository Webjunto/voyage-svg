import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { VoyageModule } from './voyage/voyage.module';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule, VoyageModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
