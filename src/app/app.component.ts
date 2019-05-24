import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';

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
      this.configureInappBrowser();
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      // this.configureLogin();
    });
  }

  private configureLogin() {
    const config = new AuthConfig();
    config.redirectUri = window.location.origin;
    config.clientId = 'phone';
    config.requireHttps = false; // This is only for test. In production, set to true
    config.scope = 'openid profile api1';
    config.issuer = 'http://tst-h-web03.nve.no/identityservertest';
    config.redirectUri = window.location.origin;
    // config.tokenValidationHandler = new JwksValidationHandler();

    this.oauthService.configure(config);

    // Load Discovery Document and then try to login the user
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }

  private configureInappBrowser() {
    if (this.platform.is('cordova')) {
      // window.open = (<any>cordova).InAppBrowser.open;
      window.open = (url, target, features, replace) => {
        const ref = (<any>cordova).InAppBrowser.open(url, target, features, replace);
        return ref;
      };
    }
  }
}
