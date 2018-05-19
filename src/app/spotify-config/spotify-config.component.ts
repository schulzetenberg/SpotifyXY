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
  styleUrls: ['./spotify-config.component.css'],
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
  config: {};
  editablePlaylists: [];

  constructor(
    private router: Router,
    private spotifyConfigService: SpotifyConfigService,
    private spotifyService: SpotifyService,
  ) { }

  public submitSpotifyConfig(form: NgForm) {
    const saveData = form.value;
    saveData.favoritePlaylists = this.playlists;
    console.log(this.playlists)
    console.log(form.value);
    this.spotifyConfigService.setSpotifyConfig(form.value);
    this.router.navigate(['/']);
  }

  public getEditablePlaylists() {
    const self = this;
    // Spotify API only allows 50 playlists at a time
    this.spotifyService.getCurrentUserPlaylists({ limit: 50 }).subscribe(data => {
      const { spotifyUsername } = this.config;
      const { favoritePlaylists } = this.config;
      const editablePlaylists = [];

      data.items.forEach(function(playlist) {
        let prevFavorite = false;

        // We only care about playlists owned by us or collaborative playlists we can edit
        if ((playlist.owner.id === spotifyUsername) || (playlist.collaborative === true)) {
          const found = _.find(favoritePlaylists, { id: playlist.id });

          if (found) {
            console.log('found');
            prevFavorite = true;
          }

          // TODO: How can I use active to default the option as checked?
          editablePlaylists.push({ name: playlist.name, id: playlist.id, active: prevFavorite });
        }
      });

      this.editablePlaylists = editablePlaylists;
      console.log(editablePlaylists);
    });
  }

  ngOnInit() {
    this.config = this.spotifyConfigService.getSpotifyConfig();
    this.getEditablePlaylists();
  }

}
