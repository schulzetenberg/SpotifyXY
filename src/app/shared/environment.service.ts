import { Injectable } from '@angular/core';

import { AppConfig } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {

  constructor() { }

  isLocal(): boolean {
    return (AppConfig.environment === 'LOCAL') ? true : false;
  }
}
