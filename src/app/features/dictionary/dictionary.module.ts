import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { DictionaryPage } from './dictionary.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild([{ path: '', component: DictionaryPage }]),
  ],
  declarations: [DictionaryPage],
})
export class DictionaryModule {}
