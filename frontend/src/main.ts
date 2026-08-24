import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { AppRoutingModule } from './app/app-routing-module';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';

bootstrapApplication(App, {
  providers: [
    importProvidersFrom(AppRoutingModule),
    provideHttpClient()
  ]
}).catch(err => console.error(err));
