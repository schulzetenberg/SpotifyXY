import { Component, OnInit } from '@angular/core';

import { SpotifyService } from '../shared/spotify.service';
import { SpotifyConfigService } from '../shared/spotify-config.service';

@Component({
  moduleId: module.id,
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],

  providers: [
    SpotifyConfigService,
    SpotifyService, {
    provide:
      'SpotifyConfig',
      useValue: { }
    }
  ],
})
export class MainComponent implements OnInit {
  apiResponse: any;
  config: any;
  seekTime: number;

  constructor(
    private spotifyService: SpotifyService,
    private spotifyConfigService: SpotifyConfigService,
  ) {
  }

  ngOnInit() {
    this.config = this.spotifyConfigService.getSpotifyConfig();
    this.seekTime = this.config.seekSeconds || 30; // Default of 30 seconds
  }

  seek() {
    this.spotifyService.seek(this.seekTime).subscribe();
  }

  play() {
    this.spotifyService.startPlayback().subscribe();
  }

  pause() {
    this.spotifyService.pausePlayback().subscribe();
  }

  removeSongFromPlaylist(seek?: boolean) {
    this.spotifyService.getPlayStatus().subscribe(data => {
      const tracks = this.parseUri('track', data.item.uri);
      const context = data.context;

      if (tracks && context && context.type === 'playlist' && context.uri) {
        const playlistId = this.parseUri('playlist', context.uri);
        const userId = this.parseUri('user', context.uri);

        this.spotifyService.removePlaylistTracks(userId, playlistId, tracks).subscribe(removeData => {
          if (!removeData.snapshot_id) {
            return console.log('Error removing playlist track');
          }

          if (seek) {
            this.spotifyService.nextSong().subscribe(() => {
                this.spotifyService.seek(this.seekTime).subscribe(dataSeek => {
                  if (dataSeek.status !== 204) {
                    console.log(`Error seeking: ${dataSeek.statusText}`);
                  }
                });
            });
          }
        }, removeErr => {
          if (removeErr._body) {
            const body = JSON.parse(removeErr._body);
            console.log(`Error removing song from playlist. Status: ${body.error.status}. Message: ${body.error.message}`);
          }
        });
      } else {
        console.log('Could not get playlist data. Assuming we are not currently listening to a playlist.');
      }
    });
  }

  // example uri: 'spotify:user:sczo13au5tgxr1cnsttqasqz5:playlist:1MBIggvHjECvRqnxUa3LX2'
  private parseUri(property: string, uri: string) {
    // We need to add in the index length to only get data found after the index
    const start = uri.indexOf(property + ':') + property.length + 1;

    if (start > property.length) {
      const value = uri.substring(start, uri.length).split(':')[0];
      return value;
    } else {
      console.log(`Error! Property ${property} ID not found in the URI.`);
      return '';
    }
  }

  removeToken() {
    localStorage.setItem('angular2-spotify-token', '');
    console.log('Removed Spotify API token');
  }
}
