import { HasFormControlErrorPipe } from './has-form-control-error.pipe';

describe('HasFormControlErrorPipe', () => {
  it('create an instance', () => {
    const pipe = new HasFormControlErrorPipe();
    expect(pipe).toBeTruthy();
  });
});
