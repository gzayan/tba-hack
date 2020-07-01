import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DonateRoutingModule } from './donate-routing.module';
import { LayoutComponent } from './layout.component';


@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DonateRoutingModule
    ],
    declarations: [
        LayoutComponent
    ]
})
export class DonateModule { }