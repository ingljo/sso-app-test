import { Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  isLoggedIn = false;
  name: string;

  constructor(private oauthService: OAuthService, private inappBrowser: InAppBrowser, private httpClient: HttpClient) {
  }

  ngOnInit(): void {
  }

  async login() {
    const baseUrl = 'http://tst-h-web03.nve.no/identityservertest';
    // this.oauthService.initImplicitFlow();
    const token = await new Promise(function (resolve, reject) {
      const open = (<any>window).cordova ? (<any>window).cordova.InAppBrowser.open : window.open;
      const redirectUrl = window.location.origin;
      const nonce = '123';
      const url = `${baseUrl}/connect/authorize?`
        + `client_id=phone&${encodeURI('scope=openid profile api1')}&`
        + `response_type=${encodeURI('id_token token')}&`
        + `redirect_uri=${encodeURI(redirectUrl)}&`
        + `state=abc&nonce=${nonce}`;
      console.log(url);
      const browserRef = open(url, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
      browserRef.addEventListener('loadstart', (event) => {
        if ((event.url).indexOf('http://localhost/#id_token') === 0) {
          console.log(event.url);
          browserRef.removeEventListener('exit', () => { });
          browserRef.close();
          const responseParameters = ((event.url).split('#')[1]).split('&');
          const parsedResponse = {};
          for (let i = 0; i < responseParameters.length; i++) {
            parsedResponse[responseParameters[i].split('=')[0]] = responseParameters[i].split('=')[1];
          }
          const expiresIn = parsedResponse['expires_in'];
          if (parsedResponse['access_token'] !== undefined && parsedResponse['access_token'] !== null) {
            resolve(parsedResponse);
          } else {
            reject('Problem authenticating with regobs identity server');
          }
        }
      });
      browserRef.addEventListener('exit', function (event) {
        reject('The regobs identity server sign in flow was canceled');
      });
    });

    const profle = await this.httpClient.get(`${baseUrl}/connect/userinfo`, {
      headers: { 'Authorization': `Bearer ${token['access_token']}` }
    }).toPromise();

    this.isLoggedIn = true;
    this.name = profle['name'];
  }

  logout() {
    // this.oauthService.logOut();
    this.isLoggedIn = false;
    // Log out from all sites?
    // https://github.com/IdentityServer/IdentityServer4/blob/master/docs/endpoints/endsession.rst
  }
}
