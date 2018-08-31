import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import * as _ from 'lodash';

import { SpotifyConfigService } from '../shared/spotify-config.service';
import { SpotifyService } from '../shared/spotify.service';

@Component({
  moduleId: module.id,
  selector: 'app-spotify-config',
  templateUrl: './spotify-config.component.html',
  styleUrls: ['./spotify-config.component.scss'],
  providers: [
    SpotifyConfigService,
    SpotifyService, {
    provide:
      'SpotifyConfig',
      useValue: { }
    }
  ],
})
export class SpotifyConfigComponent implements OnInit {
  playlists = [];
  config: any;
  editablePlaylists = [];

  constructor(
    private router: Router,
    private spotifyConfigService: SpotifyConfigService,
    private spotifyService: SpotifyService,
  ) { }

  submitSpotifyConfig(form: NgForm) {
    const saveData = form.value;
    saveData.favoritePlaylists = this.playlists;
    this.spotifyConfigService.setSpotifyConfig(form.value);
    this.router.navigate(['/']);
  }

  compareFunc(c1: any, c2: any): boolean {
    return c1 && c2 ? c1.id === c2.id : false;
}

  getEditablePlaylists() {
    // Spotify API only allows 50 playlists at a time
    this.spotifyService.getCurrentUserPlaylists({ limit: 50 }).toPromise().then((data) => {
      const { spotifyUsername } = this.config;
      const editablePlaylists = [];

      data.items.forEach(function(playlist: any) {
        // We only care about playlists owned by us or collaborative playlists we can edit
        if ((playlist.owner.id === spotifyUsername) || (playlist.collaborative === true)) {
          editablePlaylists.push({ name: playlist.name, id: playlist.id });
        }
      });

      this.editablePlaylists = editablePlaylists;
    }).catch((err) => {
      // TODO: use HTTP Error Handler function
      console.log(err);
    });
  }

  viewUserSettingsFile() {
    this.spotifyConfigService.viewUserSettingsFile();
  }

  ngOnInit() {
    this.config = this.spotifyConfigService.getSpotifyConfig();
    this.playlists = this.config.favoritePlaylists;
    this.getEditablePlaylists();
  }

}
