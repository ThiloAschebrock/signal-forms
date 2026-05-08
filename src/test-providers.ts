import { provideZonelessChangeDetection } from '@angular/core';
import { provideLocaleDate } from './app/core/date.provider';

export default [provideZonelessChangeDetection(), provideLocaleDate()];
