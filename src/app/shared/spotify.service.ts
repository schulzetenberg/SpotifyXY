// Original code from: https://raw.githubusercontent.com/carterwilliamson/angular2-spotify/master/angular2-spotify.ts
// This code has since been modifed to work with electron service

import { Injectable, Inject, Optional } from '@angular/core';
import { HttpClient, HttpRequest, HttpHeaders, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ElectronService } from 'ngx-electron';
import { timeout } from 'rxjs/operators';
import 'rxjs/Rx';

import { TokenService } from './token.service';

export interface SpotifyConfig {
  clientId: string;
  redirectUri: string;
  scope: string;
  apiBase: string;
}

export interface SpotifyOptions {
  limit?: number;
  offset?: number;
  market?: string;
  album_type?: string;
  country?: string;
  type?: string;
  q?: string;
  timestamp?: string;
  locale?: string;
  public?: boolean;
  name?: string;
  time_range?: string;
  after?: string;
  before?: string;
}

interface HttpRequestOptions {
  method?: string;
  url: string;
  search?: Object;
  body?: Object;
}

@Injectable()
export class SpotifyService {
  constructor(
    @Inject('SpotifyConfig') public config: SpotifyConfig,
    private http: HttpClient,
    private _electronService: ElectronService,
    private tokenService: TokenService,
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
    }).map((res: HttpResponse<any>) => res.body);
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
    }).map((res: HttpResponse<any>) => res.body);
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
    }).map((res: HttpResponse<any>) => res.body);
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
    }).map((res: HttpResponse<any>) => res.body);
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
    }).map((res: HttpResponse<any>) => res.body);
  }

  // Artist Albums
  getArtistAlbums(artist: string, options?: SpotifyOptions) {
    artist = this.getIdFromUri(artist);
    return this.api({
      method: 'get',
      url: `/artists/${artist}/albums`,
      search: options
    }).map((res: HttpResponse<any>) => res.body);
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
    }).map((res: HttpResponse<any>) => res.body);
  }

  getRelatedArtists(artist: string) {
    artist = this.getIdFromUri(artist);
    return this.api({
      method: 'get',
      url: `/artists/${artist}/related-artists`
    }).map((res: HttpResponse<any>) => res.body);
  }



  //#endregion

  //#region browse

  getFeaturedPlaylists(options?: SpotifyOptions) {
    return this.api({
      method: 'get',
      url: `/browse/featured-playlists`,
      search: options,
    }).map((res: HttpResponse<any>) => res.body);
  }

  getNewReleases(options?: SpotifyOptions) {
    return this.api({
      method: 'get',
      url: `/browse/new-releases`,
      search: options,
    }).map((res: HttpResponse<any>) => res.body);
  }

  getCategories(options?: SpotifyOptions) {
    return this.api({
      method: 'get',
      url: `/browse/categories`,
      search: options,
    }).map((res: HttpResponse<any>) => res.body);
  }

  getCategory(categoryId: string, options?: SpotifyOptions) {
    return this.api({
      method: 'get',
      url: `/browse/categories/${categoryId}`,
      search: options,
    }).map((res: HttpResponse<any>) => res.body);
  }

  getCategoryPlaylists(categoryId: string, options?: SpotifyOptions) {
    return this.api({
      method: 'get',
      url: `/browse/categories/${categoryId}/playlists`,
      search: options,
    }).map((res: HttpResponse<any>) => res.body);
  }

  getRecommendations(options?: SpotifyOptions) {
      return this.api({
      method: 'get',
      url: `/recommendations`,
      search: options,
    }).map((res: HttpResponse<any>) => res.body);
  }

  getAvailableGenreSeeds () {
      return this.api({
      method: 'get',
      url: `/recommendations/available-genre-seeds`,
    }).map((res: HttpResponse<any>) => res.body);
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
    }).map((res: HttpResponse<any>) => res.body);
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
    }).map((res: HttpResponse<any>) => res.body);
  }

  followPlaylist(userId: string, playlistId: string, isPublic?: boolean) {
    return this.api({
      method: 'put',
      url: `/users/${userId}/playlists/${playlistId}/followers`,
      body: { public: !!isPublic },
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
    }).map((res: HttpResponse<any>) => res.body);
  }


  //#endregion

  //#region library

  getSavedUserTracks(options?: SpotifyOptions) {
    return this.api({
      method: 'get',
      url: `/me/tracks`,
      search: options
    }).map((res: HttpResponse<any>) => res.body);
  }

  userTracksContains(tracks: string | Array<string>) {
    const trackList = this.mountItemList(tracks);
    return this.api({
      method: 'get',
      url: `/me/tracks/contains`,
      search: { ids: trackList.toString() }
    }).map((res: HttpResponse<any>) => res.body);
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
    }).map((res: HttpResponse<any>) => res.body);
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
    }).map((res: HttpResponse<any>) => res.body);
  }

  //#endregion

  //#region personalization

  getUserTopArtists(options?: SpotifyOptions) {
      return this.api({
      method: 'get',
      url: `/me/top/artists`,
      search: options,
    }).map((res: HttpResponse<any>) => res.body);
  }

  getUserTopTracks(options?: SpotifyOptions) {
      return this.api({
      method: 'get',
      url: `/me/top/tracks`,
      search: options,
    }).map((res: HttpResponse<any>) => res.body);
  }

  getUserRecentlyPlayed(options?: SpotifyOptions) {
      return this.api({
      method: 'get',
      url: `/me/player/recently-played`,
      search: options,
    }).map((res: HttpResponse<any>) => res.body);
  }

  //#endregion

  //#region playlists

  getUserPlaylists(userId: string, options?: SpotifyOptions) {
    return this.api({
      method: 'get',
      url: `/users/${userId}/playlists`,
      search: options
    }).map((res: HttpResponse<any>) => res.body);
  }

  getCurrentUserPlaylists(options?: SpotifyOptions) {
      return this.api({
      method: 'get',
      url: `/me/playlists/`,
      search: options,
    }).map((res: HttpResponse<any>) => res.body);
  }

  getPlaylist(userId: string, playlistId: string, options?: { fields: string }) {
    return this.api({
      method: 'get',
      url: `/users/${userId}/playlists/${playlistId}`,
      search: options
    }).map((res: HttpResponse<any>) => res.body);
  }

  getPlaylistTracks(userId: string, playlistId: string, options?: SpotifyOptions) {
    return this.api({
      method: 'get',
      url: `/users/${userId}/playlists/${playlistId}/tracks`,
      search: options
    }).map((res: HttpResponse<any>) => res.body);
  }

  createPlaylist(userId: string, options: { name: string, public?: boolean }) {
    return this.api({
      method: 'post',
      url: `/users/${userId}/playlists`,
      body: options
    }).map((res: HttpResponse<any>) => res.body);
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
      search: search
    }).map((res: HttpResponse<any>) => res.body);
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
      body: { tracks: trackUris }
    }).map((res: HttpResponse<any>) => res.body);
  }

  reorderPlaylistTracks(userId: string, playlistId: string, options: { range_start: number, range_length?: number, insert_before: number, snapshot_id?: string }) {
    return this.api({
      method: 'put',
      url: `/users/${userId}/playlists/${playlistId}/tracks`,
      body: options
    }).map((res: HttpResponse<any>) => res.body);
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
    }).map((res: HttpResponse<any>) => res.body);
  }

  updatePlaylistDetails(userId: string, playlistId: string, options: Object) {
    return this.api({
      method: 'put',
      url: `/users/${userId}/playlists/${playlistId}`,
      body: options
    });
  }

  //#endregion

  //#region profiles

  getUser(userId: string) {
    return this.api({
      method: 'get',
      url: `/users/${userId}`
    }).map((res: HttpResponse<any>) => res.body);
  }

  getCurrentUser() {
    return this.api({
      method: 'get',
      url: `/me`,
    }).map((res: HttpResponse<any>) => res.body);
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
    }).map((res: HttpResponse<any>) => res.body);
  }

  //#endregion

  //#region tracks

  getTrack(track: string) {
    track = this.getIdFromUri(track);
    return this.api({
      method: 'get',
      url: `/tracks/${track}`
    }).map((res: HttpResponse<any>) => res.body);
  }

  getTracks(tracks: string | Array<string>) {
    const trackList = this.mountItemList(tracks);
    return this.api({
        method: 'get',
        url: `/tracks/`,
        search: { ids: trackList.toString() }
    }).map((res: HttpResponse<any>) => res.body);
  }

  getTrackAudioAnalysis(track: string) {
    track = this.getIdFromUri(track);
    return this.api({
      method: 'get',
      url: `/audio-analysis/${track}`,
    }).map((res: HttpResponse<any>) => res.body);
  }

  getTrackAudioFeatures(track: string) {
      track = this.getIdFromUri(track);
      return this.api({
        method: 'get',
        url: `/audio-features/${track}`,
      }).map((res: HttpResponse<any>) => res.body);
  }


  getTracksAudioFeatures(tracks: string | Array<string>) {
    const trackList = this.mountItemList(tracks);
    return this.api({
      method: 'get',
      url: `/audio-features/`,
      search: { ids: trackList.toString() },
    }).map((res: HttpResponse<any>) => res.body);
  }


  //#endregion

  //#region Player
  startPlayback() {
    return this.api({
      method: 'put',
      url: `/me/player/play`,
    }).map((res: HttpResponse<any>) => res.body);
  }

  playPlaylist(userId, playlistId) {
    return this.api({
      method: 'put',
      url: `/me/player/play`,
      body: {
        context_uri: `spotify:user:${userId}:playlist:${playlistId}`,
      },
    }).map((res: HttpResponse<any>) => res.body);
  }

  pausePlayback() {
    return this.api({
      method: 'put',
      url: `/me/player/pause`,
    }).map((res: HttpResponse<any>) => res.body);
  }

  // Default state of on. State=false turns off shuffle
  shuffle(state: boolean = true) {
    return this.api({
      method: 'put',
      url: `/me/player/shuffle?state=${state}`,
    }).map((res: HttpResponse<any>) => res.body);
  }

  previousSong() {
    return this.api({
      method: 'post',
      url: `/me/player/previous`,
    }).map((res: HttpResponse<any>) => res.body);
  }

  nextSong() {
    return this.api({
      method: 'post',
      url: `/me/player/next`,
    }).map((res: HttpResponse<any>) => res.body);
  }

  getPlayStatus() {
    return this.api({
      method: 'get',
      url: `/me/player`,
    }).map((res: HttpResponse<any>) => res.body);
  }

  getDeviceInfo() {
    return this.api({
      method: 'get',
      url: `/me/player/devices`,
    }).map((res: HttpResponse<any>) => res.body);
  }

  getCurrentPlaying() {
    return this.api({
      method: 'get',
      url: `/me/player/currently-playing`,
    }).map((res: HttpResponse<any>) => res.body);
  }

  seek(position_sec: number, device_id?: string) {
    return this.api({
      method: 'put',
      url: `/me/player/seek`,
      search: {
        position_ms: position_sec * 1000,
        ...(device_id ? { device_id: device_id } : {}) // Optional
      }
    });
  }

  //#endregion

  //#region utils

  private queryParams(obj: Object): HttpParams {
    let httpParams = new HttpParams();

    if (obj) {
      Object.keys(obj).forEach(function (key) {
           httpParams = httpParams.append(key, obj[key]);
      });
    }

    return httpParams;
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

    const req = new HttpRequest(
      requestOptions.method || 'get',
      self.config.apiBase + requestOptions.url,
      JSON.stringify(requestOptions.body),
      {
        params: self.queryParams(requestOptions.search)
      });

    // Before each HTTP request, call getToken function to verify we have a valid auth token
    return this.tokenService.getToken().flatMap(function() {
      return self.http.request(req);
   }).timeout(5000); // Timeout of 5 seconds
  }

  //#endregion

}
