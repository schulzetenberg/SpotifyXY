import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-dialog-logout',
  templateUrl: 'dialog-logout.component.html',
})
export class DialogLogoutComponent {
  constructor(public dialogRef: MatDialogRef<DialogLogoutComponent>) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
