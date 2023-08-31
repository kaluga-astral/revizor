import { DeepPartial } from 'utility-types';

import { ValidationResult } from '../../types';
import { REQUIRED_ERROR_INFO, required } from '../../rule';
import { ValidationContext, createContext } from '../../context';
import { compose } from '../../compose';

type DefOptions<AddDefOptions extends Record<string, unknown>> =
  Partial<AddDefOptions> & {
    /**
     * @description Переопределяет дефолтное сообщения ошибки для required
     * @example string.define({ requiredMessage: 'ИНН не может быть пустым' })(inn())
     */
    requiredErrorMessage?: string;
    /**
     * @description Переопределяет сообщение об ошибке типа
     * @example string.define({ typeErrorMessage: 'ИНН не может быть числом' })(inn())
     */
    typeErrorMessage?: string;
    /**
     * @description Позволяет выключать проверку на required
     * @default false
     */
    isOptional?: boolean;
  };

type GuardValue = unknown;

/**
 * @description Интерфейс функции guard, которая в прототипе содержит метод define
 */
export interface Guard<
  TLastSchemaValues extends Record<string, unknown> = {},
  AddDefOptions extends Record<string, unknown> = {},
> {
  (
    value: GuardValue,
    ctx?: ValidationContext<TLastSchemaValues>,
  ): ValidationResult;
  /**
   * @description Функция для создания нового guard с переопределенными дефолтными параметрами. Возвращает новый guard
   * @param options - параметры, позволяющие переопределить дефолтные настройки guard
   * @example string.define({ requiredMessage: 'ИНН не может быть пустым' })(inn())
   */
  define(
    options: DefOptions<AddDefOptions>,
  ): Guard<TLastSchemaValues, AddDefOptions>;
}

/**
 * @description Функция, которая позволяет определять частную логику для guard
 */
type GuardExecutor<
  TLastSchemaValues extends Record<string, unknown>,
  AddDefOptions extends Record<string, unknown>,
> = (
  value: unknown,
  ctx: ValidationContext<TLastSchemaValues>,
  defOptions: DefOptions<AddDefOptions>,
) => ValidationResult;

/**
 * @description Создает guard. Guard - функция, проверяющая тип значения
 * По-дефолту проверяет value на required. Для выключения required необходимо использовать optional().
 * После первого вызова guard в прототипу функции становится доступен метод define, который позволяет переопределить дефолтное поведение guard (например, изменить текст для required правила)
 * @example
 * ```ts
 * const string = <TLastSchemaValues extends Record<string, unknown>>(...rules: ValidationRule<string, TValues>[]) =>
 *   createGuard<string, TValues>((value, ctx) => {
 *     if (typeof value !== 'string') {
 *       return ctx.createError({ code: 'custom error', message: 'Не строка' });
 *     }
 *
 *     return compose<string, TValues>(...rules)(value, ctx);
 *   });
 * ```
 */
export const createGuard = <
  TLastSchemaValues extends Record<string, unknown>,
  AddDefOptions extends Record<string, unknown> = {},
>(
  executeGuard: GuardExecutor<TLastSchemaValues, AddDefOptions>,
) => {
  // выделено в отдельную именованную функцию для того, чтобы ее можно было рекурсивно вызывать в define
  const createInnerGuard = (defOptions: DefOptions<AddDefOptions> = {}) => {
    const guard = (
      value: unknown,
      prevCtx?: ValidationContext<TLastSchemaValues>,
    ) => {
      const actualDefOptions: DefOptions<AddDefOptions> = {
        ...defOptions,
        isOptional: prevCtx?.isOptional || defOptions.isOptional,
      };

      // пересоздается контекст. При этом isOptional сбрасывается, чтобы дальше по цепочке он не утек
      const ctx = createContext<unknown, TLastSchemaValues>(
        prevCtx,
        // при создании контекста сейчас не имеет значение какого типа будет ctx.values
        value,
        {
          lastSchemaValue: value as DeepPartial<TLastSchemaValues>,
          isOptional: false,
        },
      );

      const validationResult = compose<unknown, TLastSchemaValues>(
        // возможность переопределить дефолтный message для required
        required({ message: actualDefOptions?.requiredErrorMessage }),
        (interValue: unknown, interCtx: ValidationContext<TLastSchemaValues>) =>
          executeGuard(interValue, interCtx, actualDefOptions),
      )(value, ctx as ValidationContext<TLastSchemaValues>);

      // если включен isOptional режим и required упал с ошибкой, то необходимо проигнорировать ошибку
      if (
        actualDefOptions?.isOptional &&
        validationResult?.cause.code === REQUIRED_ERROR_INFO.code
      ) {
        return undefined;
      }

      return validationResult;
    };

    guard.define = (overridesDefOptions: DefOptions<AddDefOptions>) =>
      createInnerGuard(overridesDefOptions);

    return guard;
  };

  return createInnerGuard();
};
