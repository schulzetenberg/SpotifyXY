import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxElectronModule } from 'ngx-electron';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { MaterialCustomModule } from './material-custom/material-custom.module';
import { SpotifyConfigComponent } from './spotify-config/spotify-config.component';

@NgModule({
  declarations: [
    AppComponent,
    SpotifyConfigComponent
  ],
  imports: [
    NgxElectronModule,
    BrowserModule,
    BrowserAnimationsModule,
    MaterialCustomModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
