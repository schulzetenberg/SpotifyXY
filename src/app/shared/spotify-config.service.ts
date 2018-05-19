import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';

@Injectable()
export class SpotifyConfigService {
  constructor(
    private _electronService: ElectronService,
  ) {
  }

  public getSpotifyConfig() {
    return JSON.parse(this._electronService.ipcRenderer.sendSync('getSpotifyConfig', ''));
  }

  public setSpotifyConfig(config) {
    this._electronService.ipcRenderer.send('setSpotifyConfig', config);
  }
}
