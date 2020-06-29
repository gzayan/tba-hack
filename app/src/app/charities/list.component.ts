import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { CharityService } from '../_services';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
    charities = null;

    constructor(private charityService: CharityService) {}

    ngOnInit() {
        this.charityService.getAll()
            .pipe(first())
            .subscribe(charities => this.charities = charities);
    }

    deleteCharity(id: string) {
        const charity = this.charities.find(x => x.id === id);
        charity.isDeleting = true;
        this.charityService.delete(id)
            .pipe(first())
            .subscribe(() => {
                this.charities = this.charities.filter(x => x.id !== id) 
            });
    }
}