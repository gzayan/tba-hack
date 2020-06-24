import './polyfills';
import 'rxjs/Rx';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule).then(ref => {
  // Destroys itself on hot reloads.
  if (window['ngRef']) {
    window['ngRef'].destroy();
  }
  window['ngRef'] = ref;

  // If error, log the boot error
}).catch(err => console.error(err));