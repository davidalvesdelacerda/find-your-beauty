import { ViewsLabelPipe } from './views-label.pipe';

describe('ViewsLabelPipe', () => {
  const pipe = new ViewsLabelPipe();

  it('is singular for one visit, as a number or as text', () => {
    expect(pipe.transform(1)).toBe('visualização');
    expect(pipe.transform('1')).toBe('visualização');
  });

  it('is plural for none and for more than one', () => {
    expect(pipe.transform(0)).toBe('visualizações');
    expect(pipe.transform('0')).toBe('visualizações');
    expect(pipe.transform('2')).toBe('visualizações');
    expect(pipe.transform(undefined)).toBe('visualizações');
  });
});
