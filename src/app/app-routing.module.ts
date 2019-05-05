import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainComponent } from './main/main.component';
import { SpotifyConfigComponent } from './spotify-config/spotify-config.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
  },
  {
    path: 'config',
    component: SpotifyConfigComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
