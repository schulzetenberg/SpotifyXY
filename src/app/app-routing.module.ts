import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main/main.component'
import { SpotifyConfigComponent } from './spotify-config/spotify-config.component'
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
  },
  {
    path: 'spotify-config',
    component: SpotifyConfigComponent,
  },
  {
    path: 'settings',
    component: SettingsComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {useHash: true})
  ],
  exports: [
    RouterModule
  ],
  declarations: []
})
export class AppRoutingModule { }
