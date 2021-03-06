import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

import { SpotifyService } from '../shared/spotify.service';
import { SpotifyConfigService } from '../shared/spotify-config.service';
import { EnvironmentService } from '../shared/environment.service';

@Component({
  moduleId: module.id,
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  providers: [
    SpotifyConfigService,
    SpotifyService,
    {
      provide: 'SpotifyConfig',
      useValue: {},
    },
  ],
})
export class MainComponent implements OnInit {
  apiResponse: any;
  config: any;
  seekTime: number;
  shuffleVal: boolean; // TODO: Currently we are assuming shuffle is off. Better implementation could check actual status
  isLocal: boolean;

  constructor(
    private spotifyService: SpotifyService,
    private spotifyConfigService: SpotifyConfigService,
    public snackBar: MatSnackBar,
    private envService: EnvironmentService
  ) {}

  ngOnInit() {
    this.isLocal = this.envService.isLocal();

    this.config = this.spotifyConfigService.getSpotifyConfig();
    if (!this.config.spotifyUsername) {
      this.getUsername();
    }
    this.seekTime = this.config.seekSeconds || 30; // Default of 30 seconds
  }

  async getUsername() {
    const username = await this.spotifyService
      .getPlayStatus()
      .toPromise()
      .catch((err) => {
        // TODO: Show dialog and ask user to retry
        this.httpErrorHandler(err);
      });

    if (username) {
      this.config.spotifyUsername = username;
      this.spotifyConfigService.setSpotifyConfig(this.config);
    } else {
      // TODO: Show dialog and ask user to retry
      // TODO: Throw error
    }
  }

  setWrongToken() {
    localStorage.setItem('angular2-spotify-token', '123wrongtoken');
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, '', {
      duration: 5000,
    });
  }

  seek(time: number) {
    this.spotifyService.seek(time).subscribe(
      () => {},
      (err) => {
        this.httpErrorHandler(err);
      }
    );
  }

  play() {
    this.spotifyService.startPlayback().subscribe(
      () => {},
      (err) => {
        this.httpErrorHandler(err);
      }
    );
  }

  previous() {
    this.spotifyService.previousSong().subscribe(
      () => {},
      (err) => {
        this.httpErrorHandler(err);
      }
    );
  }

  next() {
    this.spotifyService.nextSong().subscribe(
      () => {},
      (err) => {
        this.httpErrorHandler(err);
      }
    );
  }

  pause() {
    this.spotifyService.pausePlayback().subscribe(
      () => {},
      (err) => {
        this.httpErrorHandler(err);
      }
    );
  }

  async addToPlaylist(playlist: any) {
    let inError = false;

    const playStatusData = await this.spotifyService
      .getPlayStatus()
      .toPromise()
      .catch((err) => {
        this.httpErrorHandler(err);
        inError = true;
      });

    if (!inError) {
      const tracks = this.parseUri('track', playStatusData.item.uri);
      const userId = this.parseUri('user', playStatusData.context.uri);

      // TODO: Prevent duplicate songs
      this.spotifyService.addPlaylistTracks(userId, playlist.id, tracks).subscribe(
        () => {},
        (err) => {
          this.httpErrorHandler(err);
        }
      );
    }
  }

  shuffle() {
    this.shuffleVal = !this.shuffleVal; // Toggle value

    this.spotifyService.shuffle(this.shuffleVal).subscribe(
      () => {},
      (err) => {
        this.httpErrorHandler(err);
      }
    );
  }

  async playPlaylist(playlist: any) {
    let inError = false;

    // First turn on shuffle so we dont play the first song in the playlist as that is usually not desired behavior
    await this.spotifyService
      .shuffle(true)
      .toPromise()
      .catch((err) => {
        this.httpErrorHandler(err);
        inError = true;
      });

    if (!inError) {
      await this.spotifyService
        .playPlaylist(this.config.spotifyUsername, playlist.id)
        .toPromise()
        .catch((err) => {
          this.httpErrorHandler(err);
        });
    }
  }

  async removeSongFromPlaylist(seek?: boolean) {
    let inError = false;

    const playStatusData = await this.spotifyService
      .getPlayStatus()
      .toPromise()
      .catch((err) => {
        this.httpErrorHandler(err);
        inError = true;
      });

    if (!inError) {
      const tracks = this.parseUri('track', playStatusData.item.uri);
      const context = playStatusData.context;

      if (tracks && context && context.type === 'playlist' && context.uri) {
        const playlistId = this.parseUri('playlist', context.uri);
        const userId = this.parseUri('user', context.uri);

        const removePlaylistData = await this.spotifyService
          .removePlaylistTracks(userId, playlistId, tracks)
          .toPromise()
          .catch((err) => {
            this.httpErrorHandler(err);
            inError = true;
          });

        if (!inError && !removePlaylistData.snapshot_id) {
          this.openSnackBar('Error removing playlist track');
          console.log('Error removing playlist track');
          inError = true;
        }

        if (!inError && seek) {
          await this.spotifyService
            .nextSong()
            .toPromise()
            .catch((err) => {
              this.httpErrorHandler(err);
              inError = true;
            });

          if (!inError) {
            this.spotifyService
              .seek(this.seekTime)
              .toPromise()
              .then(() => {})
              .catch((err) => {
                this.httpErrorHandler(err);
                inError = true;
              });
          }
        }
      } else {
        this.openSnackBar('Could not get playlist data. Assuming we are not currently listening to a playlist.');
        console.log('Could not get playlist data. Assuming we are not currently listening to a playlist.');
      }
    }
  }

  httpErrorHandler(err: HttpErrorResponse) {
    if (err.error && err.error.error) {
      this.openSnackBar(`${err.error.error.message}`);
      console.log(`Spotify Error! Status: ${err.error.error.status}. Message: ${err.error.error.message}`);
    } else {
      this.openSnackBar('Error contacting Spotify API');
      console.log('Error contacting Spotify API', err);
    }
  }

  // example uri: 'spotify:user:sczo13au5tgxr1cnsttqasqz5:playlist:1MBIggvHjECvRqnxUa3LX2'
  private parseUri(property: string, uri: string) {
    // We need to add in the index length to only get data found after the index
    const start = uri.indexOf(`${property}:`) + property.length + 1;

    if (start > property.length) {
      const value = uri.substring(start, uri.length).split(':')[0];
      return value;
    }

    console.log(`Error! Property ${property} ID not found in the URI.`);
    return '';
  }

  removeToken() {
    localStorage.setItem('angular2-spotify-token', '');
    console.log('Removed Spotify API token');
  }
}
