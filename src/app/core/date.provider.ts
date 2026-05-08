import { NX_DATE_LOCALE } from '@allianz/ng-aquila/datefield';
import { NxIsoDateModule } from '@allianz/ng-aquila/iso-date-adapter';
import { DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';
import { importProvidersFrom, makeEnvironmentProviders } from '@angular/core';
import dayjs from 'dayjs';
import 'dayjs/locale/en-au.js';

dayjs.locale('en-au');

export const provideLocaleDate = () => {
  return makeEnvironmentProviders([
    importProvidersFrom(NxIsoDateModule),
    { provide: NX_DATE_LOCALE, useValue: 'en-AU' },
    { provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: { dateFormat: 'dd/MM/yyyy' } },
  ]);
};
