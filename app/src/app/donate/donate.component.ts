import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { User, Charity } from '../_models';
import { CharityService, AccountService, AlertService , DonateService } from '../_services';

@Component({ templateUrl: 'donate.component.html' })
export class DonationComponent implements OnInit {
	form: FormGroup;
    user: User;
    charities = null;
    submitted = false;
    loading = false;


    constructor(
    	private accountService: AccountService,
    	private charityService: CharityService,
    	private donateService: DonateService,
    	private formBuilder: FormBuilder,
        private alertService: AlertService,
        private route: ActivatedRoute,
        private router: Router,
    ) {
        this.user = this.accountService.userValue;
    }

    ngOnInit() {
    	this.charityService.getAll()
            .pipe(first())
            .subscribe(charities => this.charities = charities);

        this.form = this.formBuilder.group({
            charityName: ['', Validators.required],
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
        this.donateService.makeDonation(this.form.value)
            .pipe(first())
            .subscribe(
                data => {
                    this.alertService.success('Donation successful', { keepAfterRouteChange: true });
                    this.router.navigate(['/']);
                },
                error => {
                    this.alertService.error(error);
                    this.loading = false;
                });
    }        
}
