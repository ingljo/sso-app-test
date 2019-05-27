import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { OAuthService, AuthConfig, JwksValidationHandler } from 'angular-oauth2-oidc';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private oauthService: OAuthService,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      // this.configureLogin();
    });
  }

  // Well-known url: https://nveb2c.b2clogin.com/tfp/nveb2c.onmicrosoft.com/B2C_1_signupsignintest/v2.0/.well-known/openid-configuration

  // private configureLogin() {
  //   const config = new AuthConfig();
  //   config.redirectUri = 'http://localhost:8101';
  //   config.clientId = '6a55a4d1-1c9f-457b-85a5-86d4315d9e96';
  //   config.requireHttps = false; // This is only for test. In production, set to true
  //   config.scope = 'openid';
  //   config.responseType = 'id_token';
  //   config.loginUrl = 'https://nveb2c.b2clogin.com/nveb2c.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1_signupsignintest';
  //   config.issuer = 'https://nveb2c.b2clogin.com/tfp/nveb2c.onmicrosoft.com/B2C_1_signupsignintest/v2.0';
  //   this.oauthService.configure(config);
  //   this.oauthService.tokenValidationHandler = new JwksValidationHandler();

  //   // Load Discovery Document and then try to login the user
  //   // this.oauthService.loadDiscoveryDocumentAndTryLogin();
  // }
}
