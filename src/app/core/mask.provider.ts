import { provideEnvironmentNgxMask } from 'ngx-mask';

export const provideMask = () =>
  provideEnvironmentNgxMask({
    outputTransformFn: (value) => (value === '' ? null : value),
  });
