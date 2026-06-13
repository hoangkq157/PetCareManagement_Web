import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter }        from '@angular/router';
import { provideHttpClient,
         withInterceptors }     from '@angular/common/http';
import { provideClientHydration,
         withEventReplay }      from '@angular/platform-browser';
import { routes }               from './app.routes';
import { jwtInterceptor }       from './core/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),

    // ① Thêm HttpClient với interceptor gắn JWT token
    provideHttpClient(withInterceptors([jwtInterceptor])),
  ]
};