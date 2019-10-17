import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ChatFormPage } from './chat-form.page';
import { SharedModule } from '../pickers/shared.module';
import { environment } from 'src/environments/environment';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireModule } from '@angular/fire';
import { AngularFireStorageModule } from '@angular/fire/storage';

const routes: Routes = [
  {
    path: '',
    component: ChatFormPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    SharedModule,
    AngularFireModule.initializeApp(environment.firebase, 'feedback=15900'),
    AngularFirestoreModule,
    AngularFireStorageModule
  ],
  declarations: [ChatFormPage]
})
export class ChatFormPageModule {}
