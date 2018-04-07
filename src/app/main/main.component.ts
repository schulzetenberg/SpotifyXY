import { Component, OnInit } from '@angular/core';
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

  constructor(private spotifyService: SpotifyService) { }


  ngOnInit() {

  }

  public seek() {
    this.spotifyService.seek('60000').subscribe();
  }

  public play() {
    this.spotifyService.startPlayback().subscribe();
  }

  public pause() {
    this.spotifyService.pausePlayback().subscribe();
  }

  public removeSongFromPlaylist() {
    this.spotifyService.getPlayStatus().subscribe(data => {
      let tracks = this.parseUri('track', data.item.uri);
      let context = data.context;

      if (tracks && context && context.type === 'playlist' && context.uri) {
        let playlistId = this.parseUri('playlist', context.uri);
        let userId = this.parseUri('user', context.uri);

        this.spotifyService.removePlaylistTracks(userId, playlistId, tracks).subscribe();
      } else {
        console.log('Could not get playlist data. Assuming we are not currently listening to a playlist.');
      }
    });
  }

  // example uri: "spotify:user:sczo13au5tgxr1cnsttqasqz5:playlist:1MBIggvHjECvRqnxUa3LX2"
  private parseUri(property: string, uri: string) {
    let start = uri.indexOf(property + ':') + property.length + 1; // We need to add in the index length to only get data found after the index
    if (start > property.length) {
      let value = uri.substring(start, uri.length).split(':')[0];
      return value;
    } else {
      console.log(`Error! Property ${property} ID not found in the URI.`);
      return '';
    }
  }

  public removeToken() {
    localStorage.setItem('angular2-spotify-token', '');
    console.log('Removed Spotify API token');
  }
}
