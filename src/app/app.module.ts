import 'zone.js/dist/zone-mix';
import 'reflect-metadata';
import '../polyfills';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { NgxElectronModule } from 'ngx-electron';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { ElectronService } from './providers/electron.service';
import { WebviewDirective } from './directives/webview.directive';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MaterialCustomModule } from './material-custom/material-custom.module';
import { SpotifyConfigComponent } from './spotify-config/spotify-config.component';
import { MainComponent } from './main/main.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { AuthExpiredInterceptor } from './blocks/interceptor/auth-expired.interceptor';
import { AuthInterceptor } from './blocks/interceptor/auth.interceptor';
import { TokenService } from './shared/token.service';
import { DialogLogoutComponent } from './header/dialog-logout.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    WebviewDirective,
    AppComponent,
    SpotifyConfigComponent,
    MainComponent,
    HeaderComponent,
    DialogLogoutComponent,
    FooterComponent,
  ],
  imports: [
    HttpModule,
    NgxElectronModule,
    BrowserModule,
    BrowserAnimationsModule,
    MaterialCustomModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    ElectronService,
    TokenService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
      deps: []
    },
    {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthExpiredInterceptor,
        multi: true,
        deps: [Injector, TokenService]
    },
],
  bootstrap: [AppComponent ],
  entryComponents: [DialogLogoutComponent],
})
export class AppModule { }
