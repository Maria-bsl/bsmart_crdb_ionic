import { IsExpiredPackagePipe } from './is-expired-package.pipe';

describe('IsExpiredPackagePipe', () => {
  it('create an instance', () => {
    const pipe = new IsExpiredPackagePipe();
    expect(pipe).toBeTruthy();
  });
});
