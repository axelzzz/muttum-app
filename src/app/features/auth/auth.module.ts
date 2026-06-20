import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { LoginPage } from './login/login.page';
import { RegisterPage } from './register/register.page';
import { GuestGuard } from '../../core/guards/guest.guard';

const routes: Routes = [
  { path: 'login', component: LoginPage, canActivate: [GuestGuard] },
  { path: 'register', component: RegisterPage, canActivate: [GuestGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [LoginPage, RegisterPage],
})
export class AuthModule {}
