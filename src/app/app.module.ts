import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxElectronModule } from 'ngx-electron';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { MaterialCustomModule } from './material-custom/material-custom.module';
import { SpotifyConfigComponent } from './spotify-config/spotify-config.component';
import { MainComponent } from './main/main.component';
import { AppRoutingModule } from './app-routing.module';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { SettingsComponent } from './settings/settings.component';

@NgModule({
  declarations: [
    AppComponent,
    SpotifyConfigComponent,
    MainComponent,
    HeaderComponent,
    FooterComponent,
    SettingsComponent
  ],
  imports: [
    NgxElectronModule,
    BrowserModule,
    BrowserAnimationsModule,
    MaterialCustomModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
