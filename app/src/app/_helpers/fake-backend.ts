import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';

// array in local storage for registered users
let users = JSON.parse(localStorage.getItem('users')) || [];
// array in local storage for registered charities
let charities = JSON.parse(localStorage.getItem('charities')) || [];
// array in local storage for donations
let donations = JSON.parse(localStorage.getItem('donations')) || [];
// array in local storage for transfers
let transfers = JSON.parse(localStorage.getItem('transfers')) || [];

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url, method, headers, body } = request;

        // wrap in delayed observable to simulate server api call
        return of(null)
            .pipe(mergeMap(handleRoute))
            .pipe(materialize()) // call materialize and dematerialize to ensure delay even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648)
            .pipe(delay(500))
            .pipe(dematerialize());

        function handleRoute() {
            switch (true) {
                case url.endsWith('/users/authenticate') && method === 'POST':
                    return authenticate();
                case url.endsWith('/users/register') && method === 'POST':
                    return register();
                case url.endsWith('/users') && method === 'GET':
                    return getUsers();
                case url.match(/\/users\/\d+$/) && method === 'GET':
                    return getUserById();
                case url.match(/\/users\/\d+$/) && method === 'PUT':
                    return updateUser();
                case url.match(/\/users\/\d+$/) && method === 'DELETE':
                    return deleteUser();
                case url.endsWith('/charities/register') && method === 'POST':
                    return registerCharity();
                case url.endsWith('/charities') && method === 'GET':
                    return getCharities();
                case url.match(/\/charities\/\d+$/) && method === 'GET':
                    return getCharityById();
                case url.match(/\/charities\/\d+$/) && method === 'PUT':
                    return updateCharity();
                case url.match(/\/charities\/\d+$/) && method === 'DELETE':
                    return deleteCharity();
                case url.endsWith('/donation') && method === 'POST':
                    return makeDonation();
                case url.endsWith('/transfer') && method === 'POST':
                    return makeDonation();
                default:
                    // pass through any requests not handled above
                    return next.handle(request);
            }    
        }

        // route functions
        function makeTransfer() {
            const transfer = body;
            if (!users.find(x => x.email === transfer.email)) {
                return error('User email "' + transfer.email + '" is not registered')
            }
            console.log(transfer);
            transfers.push(transfer);
            localStorage.setItem('donations', JSON.stringify(transfers));
            return ok();
        }

        function makeDonation() {
            const donation = body;
            if (!charities.find(x => x.charity === donation.charity)) {
                return error('Charity "' + donation.charity + '" is not registered')
            }
            console.log(donation);
            donations.push(donation);
            localStorage.setItem('donations', JSON.stringify(donations));
            return ok();
        }

        function authenticate() {
            const { email, password } = body;
            const user = users.find(x => x.email === email && x.password === password);
            if (!user) return error('Email or password is incorrect');
            return ok({
                id: user.id,
                email: user.email,
                name: user.name,
                token: 'fake-jwt-token'
            })
        }

        function register() {
            const user = body

            if (users.find(x => x.email === user.email)) {
                return error('Email "' + user.email + '" is already registered')
            }

            user.id = users.length ? Math.max(...users.map(x => x.id)) + 1 : 1;
            users.push(user);
            localStorage.setItem('users', JSON.stringify(users));
            return ok();
        }

        function getUsers() {
            if (!isLoggedIn()) return unauthorized();
            return ok(users);
        }

        function getUserById() {
            if (!isLoggedIn()) return unauthorized();

            const user = users.find(x => x.id === idFromUrl());
            return ok(user);
        }

        function updateUser() {
            if (!isLoggedIn()) return unauthorized();

            let params = body;
            let user = users.find(x => x.id === idFromUrl());

            // only update password if entered
            if (!params.password) {
                delete params.password;
            }

            // update and save user
            Object.assign(user, params);
            localStorage.setItem('users', JSON.stringify(users));

            return ok();
        }

        function deleteUser() {
            if (!isLoggedIn()) return unauthorized();

            users = users.filter(x => x.id !== idFromUrl());
            localStorage.setItem('users', JSON.stringify(users));
            return ok();
        }


        function registerCharity() {
            const charity = body

            if (charities.find(x => x.charityName === charity.charityName)) {
                return error('Charity "' + charity.charityName + '" is already registered')
            }

            charity.id = charities.length ? Math.max(...charities.map(x => x.id)) + 1 : 1;
            charities.push(charity);
            localStorage.setItem('charities', JSON.stringify(charities));
            return ok();
        }

        function getCharities() {
            return ok(charities);
        }

        function getCharityById() {
            const charity = charities.find(x => x.id === idFromUrl());
            return ok(charity);
        }

        function updateCharity() {
            if (!isLoggedIn()) return unauthorized();

            let params = body;
            let charity = charities.find(x => x.id === idFromUrl());

            // update and save user
            Object.assign(charity, params);
            localStorage.setItem('charities', JSON.stringify(charities));

            return ok();
        }

        function deleteCharity() {
            if (!isLoggedIn()) return unauthorized();

            charities = charities.filter(x => x.id !== idFromUrl());
            localStorage.setItem('charities', JSON.stringify(charities));
            return ok();
        }

        // helper functions

        function ok(body?) {
            return of(new HttpResponse({ status: 200, body }))
        }

        function error(message) {
            return throwError({ error: { message } });
        }

        function unauthorized() {
            return throwError({ status: 401, error: { message: 'Unauthorised' } });
        }

        function isLoggedIn() {
            return headers.get('Authorization') === 'Bearer fake-jwt-token';
        }

        function idFromUrl() {
            const urlParts = url.split('/');
            return parseInt(urlParts[urlParts.length - 1]);
        }
    }
}

export const fakeBackendProvider = {
    // use fake backend in place of Http service for backend-less development
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};