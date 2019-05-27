import { Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { HttpClient } from '@angular/common/http';
import { MsalService } from '../services/msal.service';
import { Router } from '@angular/router';
import * as JWT from 'jwt-decode';
import { Platform } from '@ionic/angular';
import * as Msal from 'msal';

const urlTag = 'id_token=';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  isLoggedIn = false;
  name: string;

  constructor(
    private oauthService: OAuthService,
    private platform: Platform,
    private inappBrowser: InAppBrowser,
    private httpClient: HttpClient,
    private router: Router,
    private msalService: MsalService) {
  }

  ngOnInit(): void {
    const user = this.msalService.getUser();
    console.log(user);
    if (user) {
      this.isLoggedIn = true;
      this.name = user.name;
    }
  }

  async login() {
    if (!this.platform.is('cordova')) {
      this.loginBrowser();
    } else if (this.platform.is('ios')) {
      // tslint:disable-next-line:max-line-length
      this.loginIos('https://nveb2c.b2clogin.com/nveb2c.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1_signupsignintest&client_id=6a55a4d1-1c9f-457b-85a5-86d4315d9e96&nonce=defaultNonce&redirect_uri=http%3A%2F%2Flocalhost%3A8101&scope=openid&response_type=id_token&prompt=login');
    } else {
      const baseUrl = 'https://nveb2c.b2clogin.com/nveb2c.onmicrosoft.com/oauth2/v2.0';
      const token = await new Promise<string>(function (resolve, reject) {
        const open = (<any>window).cordova ? (<any>window).cordova.InAppBrowser.open : window.open;
        const redirectUrl = (<any>window).cordova ? 'http://localhost:8080' : 'http://localhost:8101';
        const url = `${baseUrl}/authorize?`
          + `p=B2C_1_signupsignintest&`
          + `client_id=6a55a4d1-1c9f-457b-85a5-86d4315d9e96&`
          + `nonce=defaultNonce&`
          + `redirect_uri=${encodeURI(redirectUrl)}&`
          + `scope=openid&`
          + `response_type=id_token&`
          + `response_mode=query&`
          + `prompt=login`;
        // tslint:disable-next-line:max-line-length
        // const url = 'https://nveb2c.b2clogin.com/nveb2c.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1_signupsignintest&client_id=6a55a4d1-1c9f-457b-85a5-86d4315d9e96&nonce=defaultNonce&redirect_uri=http%3A%2F%2Flocalhost%3A8101&scope=openid&response_type=id_token&prompt=login';
        console.log(url);

        // const browserRef = this.inappBrowser.create(url, '_blank')
        const browserRef = open(url, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
        browserRef.addEventListener('loadstart', (event) => {
          console.log(event.url);
          if ((event.url).indexOf(urlTag) > 0) {
            browserRef.removeEventListener('exit', () => { });
            browserRef.close();

            const idToken = (<string>event.url).substring(((<string>event.url).indexOf(urlTag) + urlTag.length));
            console.log(idToken);
            resolve(idToken);

            // const responseParameters = ((event.url).split('#')[1]).split('&');
            // const parsedResponse = {};
            // for (let i = 0; i < responseParameters.length; i++) {
            //   parsedResponse[responseParameters[i].split('=')[0]] = responseParameters[i].split('=')[1];
            // }
            // const expiresIn = parsedResponse['expires_in'];
            // if (parsedResponse['access_token'] !== undefined && parsedResponse['access_token'] !== null) {
            //   resolve(parsedResponse);
            // } else {
            //   reject('Problem authenticating with regobs identity server');
            // }
          }
        });
        browserRef.addEventListener('exit', function (event) {
          reject('The regobs identity server sign in flow was canceled');
        });
      });

      // const profle = await this.httpClient.get(`${baseUrl}/connect/userinfo`, {
      //   headers: { 'Authorization': `Bearer ${token['access_token']}` }
      // }).toPromise();

      this.isLoggedIn = true;
      const decodedToken = JWT(token);
      console.log(decodedToken);
      this.name = (<any>decodedToken).name;
    }
  }

  openLoginInAppCordovaBrowser(url: string, target?: string, options?: string) {
    return new Promise((resolve, reject) => {
      const subscriptions = [];
      const clearSubscriptions = () => {
        for (const s of subscriptions) {
          s.unsibscribe();
        }
      };
      const iab = this.inappBrowser.create(url, target, options);
      subscriptions.push(iab.on('exit').subscribe(() => {
        clearSubscriptions();
        reject('The regobs identity server sign in flow was canceled');
      }));
      subscriptions.push(iab.on('redirect').subscribe((val) => {
        if (this.hasIdToken(val.url)) {
          clearSubscriptions();
          const idToken = this.getIdTokenFromUrl(val.url);
          resolve(idToken);
        }
      }));
    });
  }

  loginIos(url: string) {
    // TODO: Implement ASWebAuthSession
    (<any>window).plugins.ASWebAuthSession.start('ionic://localhost:8080/home', url,
      function (msg) {
        console.log('Success ', msg);
      }, function (err) {
        console.log('Error ' + err);
      });
  }

  loginBrowser() {
    this.msalService.login();
  }

  hasIdToken(url: string) {
    return url.indexOf(urlTag) >= 0;
  }

  getIdTokenFromUrl(url: string) {
    const idToken = url.substring((url.indexOf(urlTag) + urlTag.length));
    return idToken;
  }

  // async login() {
  //   this.msalService.login();
  // }

  logout() {
    // this.oauthService.logOut();
    this.msalService.logout();
    this.isLoggedIn = false;
    // Log out from all sites?
    // https://github.com/IdentityServer/IdentityServer4/blob/master/docs/endpoints/endsession.rst
  }
}
