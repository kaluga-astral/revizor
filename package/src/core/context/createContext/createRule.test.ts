import { ValidationSimpleError, createSimpleError } from '../../errors';

import { createContext } from './createContext';

describe('createContext', () => {
  it('Не создает новый контекст, если был старый', () => {
    const ctx = {
      values: undefined,
      isOptional: true,
      createError: createSimpleError,
    };

    const resultCtx = createContext(ctx, '');

    // ссылка на объект не меняется
    expect(resultCtx).toBe(ctx);
  });

  it('При создании контекста устанавливает isOptional в true', () => {
    const resultCtx = createContext(undefined, '');

    expect(resultCtx.isOptional).toBeTruthy();
  });

  it('При создании контекста в values устанавливается value', () => {
    const resultCtx = createContext(undefined, 'value');

    expect(resultCtx.values).toBe('value');
  });

  it('В контексте доступна фабрика для создания SimpleError валидации', () => {
    const ctx = createContext(undefined, 'value');

    const error = ctx.createError({ code: Symbol(), message: 'error' });

    expect(error instanceof ValidationSimpleError).toBeTruthy();
  });
});