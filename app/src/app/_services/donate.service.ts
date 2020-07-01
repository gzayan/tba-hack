import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Donation } from '../_models';

@Injectable({ providedIn: 'root' })
export class DonateService {
    private donationSubject: BehaviorSubject<Donation>;
    public donation: Observable<Donation>;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.donationSubject = new BehaviorSubject<Donation>(JSON.parse(localStorage.getItem('donation')));
        this.donation = this.donationSubject.asObservable();
    }

    public get donationValue(): Donation {
        return this.donationSubject.value;
    }

    makeDonation(donation: Donation) {
        return this.http.post(`${environment.apiUrl}/donation`, donation);
    }
}