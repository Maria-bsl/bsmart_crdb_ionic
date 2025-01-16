import { BooksPipe } from './books.pipe';

describe('BooksPipe', () => {
  it('create an instance', () => {
    const pipe = new BooksPipe();
    expect(pipe).toBeTruthy();
  });
});
