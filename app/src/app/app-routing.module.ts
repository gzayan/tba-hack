import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home';
import { TransferComponent } from './transfer';
import { DonationComponent } from './donate';
import { AuthGuard } from './_helpers';

const accountModule = () => import('./account/account.module').then(x => x.AccountModule);
const usersModule = () => import('./users/users.module').then(x => x.UsersModule);
const charitiesModule = () => import('./charities/charities.module').then(x => x.CharitiesModule);
const donateModule = () => import('./donate/donate.module').then(x => x.DonateModule);
const transferModule = () => import('./transfer/transfer.module').then(x => x.TransferModule);


const routes: Routes = [
    { path: '', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'users', loadChildren: usersModule, canActivate: [AuthGuard] },
    { path: 'account', loadChildren: accountModule },
    { path: 'charities', loadChildren: charitiesModule },
    { path: 'transfer', component: TransferComponent },
    { path: 'donate', component: DonationComponent },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }