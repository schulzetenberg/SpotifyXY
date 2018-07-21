import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';

@Injectable()
export class SpotifyConfigService {
  constructor(
    private _electronService: ElectronService,
  ) {
  }

  public getSpotifyConfig() {
    return this._electronService.ipcRenderer.sendSync('getSpotifyConfig', '');
  }

  public setSpotifyConfig(config) {
    this._electronService.ipcRenderer.send('setSpotifyConfig', config);
  }

  public viewUserSettingsFile() {
    this._electronService.ipcRenderer.send('viewUserSettingsFile', '');
  }
}
