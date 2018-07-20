// Import all mat modules for easier dev -> TODO: Add only used modules
import { NgModule } from '@angular/core';
import * as MATERIAL_MODULES from '@angular/material';

export function mapMaterialModules() {
  return Object.keys(MATERIAL_MODULES).filter((k) => {
    const asset = MATERIAL_MODULES[k];
    return typeof asset === 'function' && asset.name.startsWith('Mat') && asset.name.includes('Module');
  }).map((k) => MATERIAL_MODULES[k]);
}

const modules = mapMaterialModules();

@NgModule({
    imports: modules,
    exports: modules
})
export class MaterialCustomModule { }

/*
import { NgModule } from '@angular/core';
import {
  MatButtonModule,
  MatMenuModule,
  MatToolbarModule,
  MatIconModule,
  MatCardModule,
  MatInputModule,
  MatSelectModule,
} from '@angular/material';

@NgModule({
  imports: [
    MatButtonModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
  ],
    exports: [
      MatButtonModule,
      MatMenuModule,
      MatToolbarModule,
      MatIconModule,
      MatCardModule,
      MatInputModule,
      MatSelectModule,
    ],
  declarations: []
})
export class MaterialCustomModule { }
*/
