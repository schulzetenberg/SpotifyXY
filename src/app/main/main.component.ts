import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { SpotifyService } from './spotify.service';

@Component({
  moduleId: module.id,
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],

  providers: [
    SpotifyService, {
    provide:
      "SpotifyConfig",
      useValue: {
        /*  We are not using the Spotify Service for auth so the only config
            we need is the auth token location. The auth token is obtained
            server side using electron OAUTH and passed back to the front end
            where it is saved in local storage.
        */
        authToken: localStorage.getItem('angular2-spotify-token')
      }
    }
  ]
})
export class MainComponent implements OnInit {
  apiResponse: any;

  constructor(private _electronService: ElectronService, private spotifyService: SpotifyService) { }


  ngOnInit() {
    const self = this;

    if(!localStorage.getItem('angular2-spotify-token')) {
      console.log('No OAUTH token. Send the request.')
      this._electronService.ipcRenderer.send('spotify-oauth');
    } else {
      console.log("Existing OAUTH token", localStorage.getItem('angular2-spotify-token'));
    }

    this._electronService.ipcRenderer.on('spotify-oauth-reply', function(event: any, arg: any) {
      localStorage.setItem('angular2-spotify-token', arg);
      console.log("Saved OAUTH token to local storage", localStorage.getItem('angular2-spotify-token'));
      self.spotifyService.config.authToken = arg;
    });
  }

  public seek() {
    console.log('seek');

    this.spotifyService.seek('60000').subscribe(data => {
      console.log(data);
    }
  }

  public removeToken() {
    localStorage.setItem('angular2-spotify-token', '');
    console.log('Removed Spotify API token');
  }
}
