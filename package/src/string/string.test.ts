import { string } from './string';
import { STRING_TYPE_ERROR_INFO } from './constants';

describe('string', () => {
  it.each<unknown>([Symbol(), {}, [], 12, new Date()])(
    'Возвращает ошибку типа, если value не строка - %j',
    (value) => {
      const validate = string();

      const result = validate(value);

      expect(result?.code).toBe(STRING_TYPE_ERROR_INFO.code);
    },
  );

  it('Не возвращает ошибку типа, если value строка', () => {
    const validate = string();

    const result = validate('string');

    expect(result).toBeUndefined();
  });

  it('Вызывает переданные rules', () => {
    const validate = string(
      () => undefined,
      () => ({ message: 'stringerror', code: 'error' }),
    );

    const result = validate('string');

    expect(result?.message).toBe('stringerror');
  });
});
