import { provideLocaleDate } from './app/core/date.provider';
import { provideMask } from './app/core/mask.provider';

export default [provideLocaleDate(), provideMask()];
