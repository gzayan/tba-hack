import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginViewComponent } from './views/login/login.component';
import { HomeViewComponent } from './views/home/home.component';
import { TransferViewComponent } from './views/transfer/transfer.component';
import { DonateViewComponent } from './views/donate/donate.component';

const routes: Routes = [];

@NgModule({
  declarations: [ 
    LoginViewComponent, HomeViewComponent, TransferViewComponent, DonateViewComponent
  ],
  imports: [
    RouterModule.forRoot([
      { path: 'login', component: LoginViewComponent },
      { path: 'home', component: HomeViewComponent },
      { path: 'transfer', component: TransferViewComponent },
      { path: 'donate', component: DonateViewComponent },
      { path: '**', redirectTo: 'login' }
    ])
  ],
  exports: [
    RouterModule,
  ],
  providers: [],

})
export class AppRoutingModule { }
