import { Injectable } from '@angular/core';

import * as Msal from 'msal';

declare var bootbox: '';
@Injectable({
    providedIn: 'root',
})
export class MsalService {

    B2CTodoAccessTokenKey = 'b2c.access.token';

    tenantConfig = {
        tenant: 'nveb2c.onmicrosoft.com',
        // Replace this with your client id
        clientID: '6a55a4d1-1c9f-457b-85a5-86d4315d9e96',
        signInPolicy: 'B2C_1_signupsignintest',
        signUpPolicy: 'B2C_1_signupsignintest',
        redirectUri: 'http://localhost:8101',
        b2cScopes: ['https://nveb2c.onmicrosoft.com/access-api/user_impersonation']
    };

    // Configure the authority for Azure AD B2C
    authority = 'https://nveb2c.b2clogin.com/tfp/' + this.tenantConfig.tenant + '/' + this.tenantConfig.signInPolicy;

    /*
     * B2C SignIn SignUp Policy Configuration
     */
    clientApplication = new Msal.UserAgentApplication(
        this.tenantConfig.clientID, this.authority,
        function (errorDesc: any, token: any, error: any, tokenType: any) {
            console.log('error: ', errorDesc);
        },
        {
            validateAuthority: false,
            redirectUri: this.tenantConfig.redirectUri,
        },
    );

    public login(): void {
        // tslint:disable-next-line:max-line-length
        this.clientApplication.authority = 'https://nveb2c.b2clogin.com/tfp/' + this.tenantConfig.tenant + '/' + this.tenantConfig.signInPolicy;
        this.authenticate();
    }

    public signup(): void {
        // tslint:disable-next-line:max-line-length
        this.clientApplication.authority = 'https://nveb2c.b2clogin.com/tfp/' + this.tenantConfig.tenant + '/' + this.tenantConfig.signUpPolicy;
        this.authenticate();
    }

    public authenticate(): void {
        const _this = this;
        this.clientApplication.loginPopup(this.tenantConfig.b2cScopes).then(function (idToken: any) {
            _this.clientApplication.acquireTokenSilent(_this.tenantConfig.b2cScopes).then(
                function (accessToken: any) {
                    _this.saveAccessTokenToCache(accessToken);
                }, function (error: any) {
                    _this.clientApplication.acquireTokenPopup(_this.tenantConfig.b2cScopes).then(
                        function (accessToken: any) {
                            _this.saveAccessTokenToCache(accessToken);
                            // tslint:disable-next-line:no-shadowed-variable
                        }, function (error: any) {
                            console.log('error: ', error);
                        });
                });
        }, function (error: any) {
            console.log('error: ', error);
        });
    }

    saveAccessTokenToCache(accessToken: string): void {
        sessionStorage.setItem(this.B2CTodoAccessTokenKey, accessToken);
    }

    logout(): void {
        this.clientApplication.logout();
    }

    isLoggedIn(): boolean {
        return this.clientApplication.getUser() != null;
    }

    getUserEmail(): string {
        return ''; // this.getUser().idToken['emails'][0];
    }

    getUser() {
        return this.clientApplication.getUser();
    }
}
