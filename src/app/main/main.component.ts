import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';

@Component({
  moduleId: module.id,
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  apiResponse: any;

  constructor(private _electronService: ElectronService) { }

  ngOnInit() {
  }

  public getPlaylists() {
    console.log('getPlaylists');
    this.apiResponse = this._electronService.ipcRenderer.sendSync('getPlaylists');
    console.log(this.apiResponse);
  }

}
