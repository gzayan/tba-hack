import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { TransferRoutingModule } from './transfer-routing.module';
import { LayoutComponent } from './layout.component';
import { TransferComponent } from './transfer.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TransferRoutingModule
    ],
    declarations: [
        LayoutComponent,
        TransferComponent
    ]
})
export class TransferModule { }