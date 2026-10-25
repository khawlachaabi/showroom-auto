import { DntPipe } from './dnt-pipe';

describe('DntPipe', () => {
  const pipe = new DntPipe();

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('formats a price in thousands', () => {
    expect(pipe.transform(230)).toBe('230,000 DNT');
  });

  it('formats an amount already in DNT', () => {
    expect(pipe.transform(1234.6, false)).toBe('1,235 DNT');
  });
});
