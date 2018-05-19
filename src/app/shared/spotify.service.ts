// Original code from: https://raw.githubusercontent.com/carterwilliamson/angular2-spotify/master/angular2-spotify.ts
// This code has since been modifed to work with electron service

import { Injectable, Inject, Optional } from '@angular/core';
import { Http, Headers, Response, Request } from '@angular/http'
import { HttpModule } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ElectronService } from 'ngx-electron';
import 'rxjs/Rx';

export interface SpotifyConfig {
  clientId: string,
  redirectUri: string,
  scope: string,
  apiBase: string,
}

export interface SpotifyOptions {
  limit?: number,
  offset?: number,
  market?: string,
  album_type?: string,
  country?: string,
  type?: string,
  q?: string,
  timestamp?: string,
  locale?: string,
  public?: boolean,
  name?: string,
  time_range?: string,
  after?: string,
  before?: string,
}

interface HttpRequestOptions {
  method?: string,
  url: string,
  search?: Object,
  body?: Object,
  json?: Boolean,
}

@Injectable()
export class SpotifyService {
  constructor(
    @Inject('SpotifyConfig') public config: SpotifyConfig,
    private http: Http,
    private _electronService: ElectronService,
  ) {
    config.apiBase = 'https://api.spotify.com/v1';
  }


  //#region albums

  /**
* Gets an album
* Pass in album id or spotify uri
*/
  getAlbum(album: string) {
    album = this.getIdFromUri(album);
    return this.api({
      method: 'get',
      url: `/albums/${album}`
    }).map(res => res.json());
  }

  /**
* Gets albums
* Pass in comma separated string or array of album ids
*/
  getAlbums(albums: string | Array<string>) {
    const albumList = this.mountItemList(albums);
    return this.api({
      method: 'get',
      url: `/albums`,
      search: { ids: albumList.toString() }
    }).map(res => res.json());
  }

  /**
* Get Album Tracks
* Pass in album id or spotify uri
*/
  getAlbumTracks(album: string, options?: SpotifyOptions) {
    album = this.getIdFromUri(album);
    return this.api({
      method: 'get',
      url: `/albums/${album}/tracks`,
      search: options
    }).map(res => res.json());
  }

  //#endregion

  //#region artists

  /**
* Get an Artist
*/
  getArtist(artist: string) {
    artist = this.getIdFromUri(artist);
    return this.api({
      method: 'get',
      url: `/artists/${artist}`
    }).map(res => res.json());
  }

  /**
* Get multiple artists
*/
  getArtists(artists: string | Array<string>) {
    const artistList = this.mountItemList(artists);
    return this.api({
      method: 'get',
      url: `/artists/`,
      search: { ids: artists.toString() }
    }).map(res => res.json());
  }

  // Artist Albums
  getArtistAlbums(artist: string, options?: SpotifyOptions) {
    artist = this.getIdFromUri(artist);
    return this.api({
      method: 'get',
      url: `/artists/${artist}/albums`,
      search: options
    }).map(res => res.json());
  }

  /**
   * Get Artist Top Tracks
   * The country: an ISO 3166-1 alpha-2 country code.
   */
  getArtistTopTracks(artist: string, country: string) {
    artist = this.getIdFromUri(artist);
    return this.api({
      method: 'get',
      url: `/artists/${artist}/top-tracks`,
      search: { country: country }
    }).map(res => res.json());
  }

  getRelatedArtists(artist: string) {
    artist = this.getIdFromUri(artist);
    return this.api({
      method: 'get',
      url: `/artists/${artist}/related-artists`
    }).map(res => res.json());
  }



  //#endregion

  //#region browse

  getFeaturedPlaylists(options?: SpotifyOptions) {
    return this.api({
      method: 'get',
      url: `/browse/featured-playlists`,
      search: options,
    }).map(res => res.json());
  }

  getNewReleases(options?: SpotifyOptions) {
    return this.api({
      method: 'get',
      url: `/browse/new-releases`,
      search: options,
    }).map(res => res.json());
  }

  getCategories(options?: SpotifyOptions) {
    return this.api({
      method: 'get',
      url: `/browse/categories`,
      search: options,
    }).map(res => res.json());
  }

  getCategory(categoryId: string, options?: SpotifyOptions) {
    return this.api({
      method: 'get',
      url: `/browse/categories/${categoryId}`,
      search: options,
    }).map(res => res.json());
  }

  getCategoryPlaylists(categoryId: string, options?: SpotifyOptions) {
    return this.api({
      method: 'get',
      url: `/browse/categories/${categoryId}/playlists`,
      search: options,
    }).map(res => res.json());
  }

  getRecommendations(options?: SpotifyOptions) {
      return this.api({
      method: 'get',
      url: `/recommendations`,
      search: options,
    }).map(res => res.json());
  }

  getAvailableGenreSeeds () {
      return this.api({
      method: 'get',
      url: `/recommendations/available-genre-seeds`,
    }).map(res => res.json());
  }

  //#endregion

  //#region following

  following(type: string, options?: SpotifyOptions) {
    options = options || {};
    options.type = type;
    return this.api({
      method: 'get',
      url: `/me/following`,
      search: options,
    }).map(res => res.json());
  }

  follow(type: string, ids: string | Array<string>) {
    return this.api({
      method: 'put',
      url: `/me/following`,
      search: { type: type, ids: ids.toString() },
    });
  }

  unfollow(type: string, ids: string | Array<string>) {
    return this.api({
      method: 'delete',
      url: `/me/following`,
      search: { type: type, ids: ids.toString() },
    });
  }

  userFollowingContains(type: string, ids: string | Array<string>) {
    return this.api({
      method: 'get',
      url: `/me/following/contains`,
      search: { type: type, ids: ids.toString() },
    }).map(res => res.json());
  }

  followPlaylist(userId: string, playlistId: string, isPublic?: boolean) {
    return this.api({
      method: 'put',
      url: `/users/${userId}/playlists/${playlistId}/followers`,
      body: { public: !!isPublic },
      json: true,
    });
  }

  unfollowPlaylist(userId: string, playlistId: string) {
    return this.api({
      method: 'delete',
      url: `/users/${userId}/playlists/${playlistId}/followers`,
    });
  }

  playlistFollowingContains(userId: string, playlistId: string, ids: string | Array<string>) {
    return this.api({
      method: 'get',
      url: `/users/${userId}/playlists/${playlistId}/followers/contains`,
      search: { ids: ids.toString() },
    }).map(res => res.json());
  }


  //#endregion

  //#region library

  getSavedUserTracks(options?: SpotifyOptions) {
    return this.api({
      method: 'get',
      url: `/me/tracks`,
      search: options
    }).map(res => res.json());
  }

  userTracksContains(tracks: string | Array<string>) {
    const trackList = this.mountItemList(tracks);
    return this.api({
      method: 'get',
      url: `/me/tracks/contains`,
      search: { ids: trackList.toString() }
    }).map(res => res.json());
  }

  saveUserTracks(tracks: string | Array<string>) {
    const trackList = this.mountItemList(tracks);

    return this.api({
      method: 'put',
      url: `/me/tracks`,
      search: { ids: trackList.toString() }
    });
  }

  removeUserTracks(tracks: string | Array<string>) {
    const trackList = this.mountItemList(tracks);

    return this.api({
      method: 'delete',
      url: `/me/tracks`,
      search: { ids: trackList.toString() }
    });
  }

  getSavedUserAlbums(options?: SpotifyOptions) {
    return this.api({
      method: 'get',
      url: `/me/albums`,
      search: options
    }).map(res => res.json());
  }

  saveUserAlbums(albums: string | Array<string>) {
    const albumList = this.mountItemList(albums);

    return this.api({
      method: 'put',
      url: `/me/albums`,
      search: { ids: albumList.toString() }
    });
  }

  removeUserAlbums(albums: string | Array<string>) {
    const albumList = this.mountItemList(albums);

    return this.api({
      method: 'delete',
      url: `/me/albums`,
      search: { ids: albumList.toString() }
    });
  }

  userAlbumsContains(albums: string | Array<string>) {
    const albumList = this.mountItemList(albums);

    return this.api({
      method: 'get',
      url: `/me/albums/contains`,
      search: { ids: albumList.toString() }
    }).map(res => res.json());
  }

  //#endregion

  //#region personalization

  getUserTopArtists(options?: SpotifyOptions) {
      return this.api({
      method: 'get',
      url: `/me/top/artists`,
      search: options,
    }).map(res => res.json());
  }

  getUserTopTracks(options?: SpotifyOptions) {
      return this.api({
      method: 'get',
      url: `/me/top/tracks`,
      search: options,
    }).map(res => res.json());
  }

  getUserRecentlyPlayed(options?: SpotifyOptions) {
      return this.api({
      method: 'get',
      url: `/me/player/recently-played`,
      search: options,
    }).map(res => res.json());
  }

  //#endregion

  //#region playlists

  getUserPlaylists(userId: string, options?: SpotifyOptions) {
    return this.api({
      method: 'get',
      url: `/users/${userId}/playlists`,
      search: options
    }).map(res => res.json());
  }

  getCurrentUserPlaylists(options?: SpotifyOptions) {
      return this.api({
      method: 'get',
      url: `/me/playlists/`,
      search: options,
    }).map(res => res.json());
  }

  getPlaylist(userId: string, playlistId: string, options?: { fields: string }) {
    return this.api({
      method: 'get',
      url: `/users/${userId}/playlists/${playlistId}`,
      search: options
    }).map(res => res.json());
  }

  getPlaylistTracks(userId: string, playlistId: string, options?: SpotifyOptions) {
    return this.api({
      method: 'get',
      url: `/users/${userId}/playlists/${playlistId}/tracks`,
      search: options
    }).map(res => res.json());
  }

  createPlaylist(userId: string, options: { name: string, public?: boolean }) {
    return this.api({
      method: 'post',
      url: `/users/${userId}/playlists`,
      json: true,
      body: options
    }).map(res => res.json());
  }

  addPlaylistTracks(userId: string, playlistId: string, tracks: string | Array<string>, options?: { position: number }) {
    const trackList = Array.isArray(tracks) ? tracks : tracks.split(',');
    trackList.forEach((value, index) => {
      trackList[index] = value.indexOf('spotify:') === -1 ? 'spotify:track:' + value : value;
    });

    const search = { uris: trackList.toString() };
    if (!!options) {
      search['position'] = options.position;
    }

    return this.api({
      method: 'post',
      url: `/users/${userId}/playlists/${playlistId}/tracks`,
      json: true,
      search: search
    }).map(res => res.json());
  }

  removePlaylistTracks(userId: string, playlistId: string, tracks: string | Array<string>) {
    const trackList = Array.isArray(tracks) ? tracks : tracks.split(',');
    const trackUris = [];
    trackList.forEach((value, index) => {
      trackUris[index] = {
        uri: value.indexOf('spotify:') === -1 ? 'spotify:track:' + value : value
      };
    });
    return this.api({
      method: 'delete',
      url: `/users/${userId}/playlists/${playlistId}/tracks`,
      json: true,
      body: { tracks: trackUris }
    }).map(res => res.json());
  }

  reorderPlaylistTracks(userId: string, playlistId: string, options: { range_start: number, range_length?: number, insert_before: number, snapshot_id?: string }) {
    return this.api({
      method: 'put',
      url: `/users/${userId}/playlists/${playlistId}/tracks`,
      json: true,
      body: options
    }).map(res => res.json());
  }

  replacePlaylistTracks(userId: string, playlistId: string, tracks: string | Array<string>) {
    const trackList = Array.isArray(tracks) ? tracks : tracks.split(',');
    trackList.forEach((value, index) => {
      trackList[index] = value.indexOf('spotify:') === -1 ? 'spotify:track:' + value : value;
    });

    return this.api({
      method: 'put',
      url: `/users/${userId}/playlists/${playlistId}/tracks`,
      search: { uris: trackList.toString() }
    }).map(res => res.json());
  }

  updatePlaylistDetails(userId: string, playlistId: string, options: Object) {
    return this.api({
      method: 'put',
      url: `/users/${userId}/playlists/${playlistId}`,
      json: true,
      body: options
    });
  }

  //#endregion

  //#region profiles

  getUser(userId: string) {
    return this.api({
      method: 'get',
      url: `/users/${userId}`
    }).map(res => res.json());
  }

  getCurrentUser() {
    return this.api({
      method: 'get',
      url: `/me`,
    }).map(res => res.json());
  }

  //#endregion

  //#region search

  /**
* Search Spotify
* q = search query
* type = artist, album or track
*/
  search(q: string, type: string, options?: SpotifyOptions) {
    options = options || {};
    options.q = q;
    options.type = type;

    return this.api({
      method: 'get',
      url: `/search`,
      search: options
    }).map(res => res.json());
  }

  //#endregion

  //#region tracks

  getTrack(track: string) {
    track = this.getIdFromUri(track);
    return this.api({
      method: 'get',
      url: `/tracks/${track}`
    }).map(res => res.json());
  }

  getTracks(tracks: string | Array<string>) {
    const trackList = this.mountItemList(tracks);
    return this.api({
        method: 'get',
        url: `/tracks/`,
        search: { ids: trackList.toString() }
    }).map(res => res.json());
  }

  getTrackAudioAnalysis(track: string) {
    track = this.getIdFromUri(track);
    return this.api({
      method: 'get',
      url: `/audio-analysis/${track}`,
    }).map(res => res.json());
  }

  getTrackAudioFeatures(track: string) {
      track = this.getIdFromUri(track);
      return this.api({
        method: 'get',
        url: `/audio-features/${track}`,
      }).map(res => res.json());
  }


  getTracksAudioFeatures(tracks: string | Array<string>) {
    const trackList = this.mountItemList(tracks);
    return this.api({
      method: 'get',
      url: `/audio-features/`,
      search: { ids: trackList.toString() },
    }).map(res => res.json());
  }


  //#endregion

  //#region Player
  startPlayback() {
    return this.api({
      method: 'put',
      url: `/me/player/play`,
    }).map(res => res.json());
  }

  pausePlayback() {
    return this.api({
      method: 'put',
      url: `/me/player/pause`,
    }).map(res => res.json());
  }

  getPlayStatus() {
    return this.api({
      method: 'get',
      url: `/me/player`,
    }).map(res => res.json());
  }

  getDeviceInfo() {
    return this.api({
      method: 'get',
      url: `/me/player/devices`,
    }).map(res => res.json());
  }

  getCurrentPlaying() {
    return this.api({
      method: 'get',
      url: `/me/player/currently-playing`,
    }).map(res => res.json());
  }

  seek(position_ms: string, device_id?: string) {
    return this.api({
      method: 'put',
      url: `/me/player/seek`,
      search: {
        position_ms: position_ms,
        ...(device_id ? { device_id: device_id } : {}) // Optional
      }
    });
  }

  //#endregion

  //#region utils

  private toQueryString(obj: Object): string {
    const parts = [];
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
      }
    }
    return parts.join('&');
  }

  private auth(isJson?: boolean): Object {
    const auth = {
      'Authorization': 'Bearer ' + localStorage.getItem('angular2-spotify-token')
    };
    if (isJson) {
      auth['Content-Type'] = 'application/json';
    }
    return auth;
  }

  private getHeaders(isJson?: boolean): any {
    return new Headers(this.auth(isJson));
  }

  private getIdFromUri(uri: string) {
    return uri.indexOf('spotify:') === -1 ? uri : uri.split(':')[2];
  }

  private mountItemList(items: string | Array<string>): Array<string> {
    const itemList = Array.isArray(items) ? items : items.split(',');
    itemList.forEach((value, index) => {
      itemList[index] = this.getIdFromUri(value);
    });
    return itemList;
  }

  private api(requestOptions: HttpRequestOptions) {
    const self = this;

    return this.getToken().flatMap(function() {
      return self.http.request(new Request({
       url: self.config.apiBase + requestOptions.url,
       method: requestOptions.method || 'get',
       search: self.toQueryString(requestOptions.search),
       body: JSON.stringify(requestOptions.body),
       headers: self.getHeaders(requestOptions.json)
     }));
   });
  }

  // Before each HTTP request, call this function to verify we have a valid auth token
  private getToken() {
    const self = this;

    // TODO: Figure out how to use resolve in the context of a observable instead of converting from a promise
    return Observable.fromPromise(new Promise(
      function (resolve, reject) {
        // TODO: Add error handling and timeouts to the promise

        if (!localStorage.getItem('angular2-spotify-token')) {
          console.log('No OAUTH token. Send the request.');
          self._electronService.ipcRenderer.send('spotify-oauth');
        } else {
          const now = new Date().toString();
          const exp = localStorage.getItem('spotify-token-expiration');

          if (!exp || (exp < now)) {
            console.log('Token is expired. Get a new token.');
            self._electronService.ipcRenderer.send('spotify-oauth'); // TODO: Use refresh token to get new auth
          } else {
            console.log('Existing OAUTH token', localStorage.getItem('angular2-spotify-token'));
            resolve();
          }
        }

        // NOTE: This is a security risk having all the token data saved in localstorage. Change this for a production application
        self._electronService.ipcRenderer.on('spotify-oauth-reply', function(event: any, arg: any) {
          // Using the expires_in field, we can determine how long we have until we have to get a new token (Current value for Spotify API is 60 min.)
          const exp = new Date();
          exp.setSeconds(exp.getSeconds() + arg.expires_in - 30); // Set the expiration date 30 seconds before the token actually expires to have time to get a new token
          localStorage.setItem('spotify-token-expiration', exp.toString());
          console.log('Token EXP', localStorage.getItem('spotify-token-expiration'));


          localStorage.setItem('spotify-refresh-token', arg.refresh_token);
          localStorage.setItem('angular2-spotify-token', arg.access_token);
          console.log('Saved OAUTH token to local storage', localStorage.getItem('angular2-spotify-token'));

          resolve();
        });
      }
    ));
  }

  //#endregion

}
