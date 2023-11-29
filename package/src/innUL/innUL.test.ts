import { INN_UL_ERROR_INFO } from './constants';
import { innUL } from './innUL';

describe('innUL', () => {
  it.each<string>(['7728168971'])('Не возвращает ошибку для "%s"', (value) => {
    expect(innUL()(value)).toBeUndefined();
  });

  it('Возвращает ошибку, если ИНН ЮЛ состоит целиком из нулей', () => {
    const error = innUL()('0000000000');

    expect(error?.cause.code).toBe(INN_UL_ERROR_INFO.code);
  });

  it('Возвращает ошибку, если ИНН ЮЛ начинается с "00" ', () => {
    const error = innUL()('0008168971');

    expect(error?.cause.code).toBe(INN_UL_ERROR_INFO.code);
  });

  it.each<string>([
    'a',
    '123a',
    '        1      ',
    'undefined',
    'NaN',
    'number',
    '384212952720',
    '7728168911',
  ])('Возвращает ошибку для "%s"', (value) => {
    const error = innUL()(value);

    expect(error?.cause.code).toBe(INN_UL_ERROR_INFO.code);
  });

  it('Позволяет указать кастомный message ошибки', () => {
    const customMessage = 'CustomMessage';

    const error = innUL({ message: customMessage })('123');

    expect(error?.message).toBe(customMessage);
  });

  it('Не валидирует value, соответствующие условию в exclude', () => {
    const isExclude = (value: unknown) => {
      const excluded: unknown[] = ['exclude'];

      return excluded.includes(value);
    };

    expect(innUL({ exclude: isExclude })('exclude')).toBeUndefined();
  });
});
