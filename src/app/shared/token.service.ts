// tslint:disable ter-prefer-arrow-callback
import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx'; // tslint:disable-line import-blacklist

@Injectable()
export class TokenService {
  constructor(private _electronService: ElectronService) {}

  logout() {
    this._electronService.ipcRenderer.send('logout', '');
  }

  public getToken(replace?: boolean) {
    return new Observable((observer) => {
      // TODO: Add error handling and timeouts

      if (replace) {
        console.log('Replace token!');
        // Get a new token, even if we already have what appears to be a valid token
        this._electronService.ipcRenderer.send('spotify-oauth');
      } else if (!localStorage.getItem('angular2-spotify-token')) {
        console.log('No OAUTH token. Send the request.');
        this._electronService.ipcRenderer.send('spotify-oauth');
      } else {
        const now = new Date().toString();
        const exp = localStorage.getItem('spotify-token-expiration');

        console.log('Expiration:', exp);
        console.log('Now:', now);

        if (!exp || exp < now) {
          console.log('Token is expired. Get a new token.');
          this._electronService.ipcRenderer.send('spotify-oauth'); // TODO: Use refresh token to get new auth
        } else {
          console.log('Existing OAUTH token', localStorage.getItem('angular2-spotify-token'));
          observer.next();
        }
      }

      // NOTE: This is a security risk having all the token data saved in localstorage. Change this for a production application
      this._electronService.ipcRenderer.on('spotify-oauth-reply', function(event: any, arg: any) {
        // Using the expires_in field, we can determine how long we have until we have to get a new token
        // Current value for Spotify API is 60 min (3600 seconds).
        // Set the expiration date 30 seconds before the token actually expires to have time to get a new token
        const exp = new Date(new Date().getTime() + (arg.expires_in - 30) * 1000);
        localStorage.setItem('spotify-token-expiration', exp.toString());
        console.log('Token EXP', localStorage.getItem('spotify-token-expiration'));

        localStorage.setItem('spotify-refresh-token', arg.refresh_token);
        localStorage.setItem('angular2-spotify-token', arg.access_token);
        console.log('Saved OAUTH token to local storage', localStorage.getItem('angular2-spotify-token'));

        observer.next();
      });
    });
  }
}
