import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { CharityService, AlertService } from '../_services';

@Component({ templateUrl: 'add-edit.component.html' })
export class AddEditComponent implements OnInit {
    form: FormGroup;
    id: string;
    isAddMode: boolean;
    loading = false;
    submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private charityService: CharityService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.isAddMode = !this.id;

        this.form = this.formBuilder.group({
            charityName: ['', Validators.required],
            accountNumber: ['', Validators.required],
            description: ['', Validators.required],
            email: ['', Validators.required]
        });

        if (!this.isAddMode) {
            this.charityService.getById(this.id)
                .pipe(first())
                .subscribe(x => {
                    this.f.charityName.setValue(x.charityName);
                    this.f.accountNumber.setValue(x.accountNumber);
                    this.f.description.setValue(x.description);
                    this.f.email.setValue(x.email);
                });
        }
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        console.log("id after clear: ", this.id)

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        if (this.isAddMode) {
            this.createCharity();
        } else {
            this.updateCharity();
        }
    }

    private createCharity() {
        this.charityService.register(this.form.value)
            .pipe(first())
            .subscribe(
                data => {
                    this.alertService.success('Charity added successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['.', { relativeTo: this.route }]);
                },
                error => {
                    this.alertService.error(error);
                    this.loading = false;
                });
    }

    private updateCharity() {
        console.log("this.id ", this.id)
        console.log("this.form.value ", this.form.value)
        this.charityService.update(this.id, this.form.value)
            .pipe(first())
            .subscribe(
                data => {
                    this.alertService.success('Update successful', { keepAfterRouteChange: true });
                    this.router.navigate(['..', { relativeTo: this.route }]);
                },
                error => {
                    this.alertService.error(error);
                    this.loading = false;
                });
    }
}