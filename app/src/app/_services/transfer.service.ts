import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Transfer } from '../_models';

@Injectable({ providedIn: 'root' })
export class TransferService {
    private transferSubject: BehaviorSubject<Transfer>;
    public transfer: Observable<Transfer>;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.transferSubject = new BehaviorSubject<Transfer>(JSON.parse(localStorage.getItem('transfer')));
        this.transfer = this.transferSubject.asObservable();
    }

    public get transferValue(): Transfer {
        return this.transferSubject.value;
    }

    makeTransfer(transfer: Transfer) {
        return this.http.post(`${environment.apiUrl}/transfer`, transfer);
    }
}