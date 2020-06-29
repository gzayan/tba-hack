import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Charity } from '../_models';

@Injectable({ providedIn: 'root' })
export class CharityService {
    private charitySubject: BehaviorSubject<Charity>;
    public charity: Observable<Charity>;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.charitySubject = new BehaviorSubject<Charity>(JSON.parse(localStorage.getItem('charity')));
        this.charity = this.charitySubject.asObservable();
    }

    public get charityValue(): Charity {
        return this.charitySubject.value;
    }

    register(charity: Charity) {
        return this.http.post(`${environment.apiUrl}/charities/register`, charity);
    }

    getAll() {
        return this.http.get<Charity[]>(`${environment.apiUrl}/charities`);
    }

    getById(id: string) {
        return this.http.get<Charity>(`${environment.apiUrl}/charities/${id}`);
    }

    update(id, params) {
        return this.http.put(`${environment.apiUrl}/charities/${id}`, params)
            .pipe(map(x => {
                // update stored charity if the logged in charity updated their own record
                // if (id == this.charityValue.id) {
                    // update local storage
                   // const charity = { ...this.charityValue, ...params };
                   // localStorage.setItem('charity', JSON.stringify(charity));

                    // publish updated charity to subscribers
                   // this.charitySubject.next(charity);
                //}
                return x;
            }));
    }

    delete(id: string) {
        return this.http.delete(`${environment.apiUrl}/charities/${id}`)
            .pipe(map(x => {
                return x;
            }));
    }
}