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
      useValue: { }
    }
  ]
})
export class MainComponent implements OnInit {
  apiResponse: any;

  constructor(private _electronService: ElectronService, private spotifyService: SpotifyService) { }


  ngOnInit() {

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
