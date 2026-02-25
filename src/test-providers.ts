import { provideZonelessChangeDetection } from '@angular/core';
import { provideLocaleDate } from './app/date.provider';

export default [provideZonelessChangeDetection(), provideLocaleDate()];
