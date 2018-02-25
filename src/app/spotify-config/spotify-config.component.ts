import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  moduleId: module.id,
  selector: 'app-spotify-config',
  templateUrl: './spotify-config.component.html',
  styleUrls: ['./spotify-config.component.css']
})
export class SpotifyConfigComponent implements OnInit {
  spotifySecret: String;
  spotifyId: String;
  spotifyUsername: String;

  constructor(
    private _electronService: ElectronService,
    private router: Router,
  ) { }

  public submitSpotifyConfig(form: NgForm) {
    this._electronService.ipcRenderer.send('setSpotifyConfig', form.value);
     this.router.navigate(['/']);
  }

  public getSpotifyConfig() {
    return JSON.parse(this._electronService.ipcRenderer.sendSync('getSpotifyConfig', ''));
  }

  ngOnInit() {
    let config = this.getSpotifyConfig();
    this.spotifyId = config.spotifyId;
    this.spotifySecret = config.spotifySecret;
    this.spotifyUsername = config.spotifyUsername;
  }

}
