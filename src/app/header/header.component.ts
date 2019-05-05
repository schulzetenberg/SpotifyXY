import { Component, OnInit } from '@angular/core';
import { TokenService } from '../shared/token.service';
import { MatDialog } from '@angular/material';
import { DialogLogoutComponent } from './dialog-logout.component';

@Component({
  moduleId: module.id,
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  title = 'SpotifyXY';

  constructor(private tokenService: TokenService, public dialog: MatDialog) {}

  ngOnInit() {}

  logout() {
    // Call a dialog to verify the user really wants to clear all app data
    const dialogRef = this.dialog.open(DialogLogoutComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.tokenService.logout();
      }
    });
  }
}
