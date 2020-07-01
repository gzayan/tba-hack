import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { User, Charity } from '../_models';
import { CharityService, AccountService, AlertService , TransferService } from '../_services';

@Component({ templateUrl: 'transfer.component.html' })
export class TransferComponent {
    form: FormGroup;
    user: User;
    users = null;
    submitted = false;
    loading = false;

    constructor(
    	private accountService: AccountService,
    	private charityService: CharityService,
    	private transferService: TransferService,
    	private formBuilder: FormBuilder,
        private alertService: AlertService,
        private route: ActivatedRoute,
        private router: Router,
    ) {
        this.user = this.accountService.userValue;
    }

    ngOnInit() {
    	this.accountService.getAll()
            .pipe(first())
            .subscribe(users => this.users = users);

        this.form = this.formBuilder.group({
            email: ['', Validators.required],
            amount: ['', Validators.required],
            user: [this.user.id]
        });
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        this.transferService.makeTransfer(this.form.value)
            .pipe(first())
            .subscribe(
                data => {
                    this.alertService.success('Transfer successful', { keepAfterRouteChange: true });
                    this.router.navigate(['/']);
                },
                error => {
                    this.alertService.error(error);
                    this.loading = false;
                });
    }
}
