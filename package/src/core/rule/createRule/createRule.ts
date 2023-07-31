import { ValidationResult, ValidationTypes } from '../../types';
import { ValidationContext, createContext } from '../../context';
import { IndependentValidationRule } from '../types';

/**
 * @description Единые параметры для всех правил
 */
export type CommonRuleParams<ValidationType extends ValidationTypes> = {
  /**
   * @description Функция, позволяющая для каждого правила указать исключение
   */
  exclude?: (value: ValidationType, ctx: ValidationContext) => boolean;
};

/**
 * @description Функция, которая позволяет определять частную логику для guard
 */
type RuleExecutor<
  ValidationType extends ValidationTypes,
  TLastSchemeValues extends Record<string, unknown>,
> = (
  value: ValidationType,
  ctx: ValidationContext<TLastSchemeValues>,
) => ValidationResult;

/**
 * @description Создает правила валидации, которые можно использовать внутри guard или по отдельности
 * @param executor - функция, которая позволяет определять частную логику для guard
 * @param commonParams - единые параметры для всех rule
 * @example
 * ```ts
 * const inn = (params: CommonRuleParams<string> & { message?: string }) =>
 *   createRule<string>((value, ctx) => {
 *     if (!isInn(value)) {
 *       return ctx.createError({ code: 'custom error', message: params?.message || 'Неверный ИНН' });
 *     }
 *
 *     return undefined;
 *   }, params);
 * ```
 */
export const createRule =
  <
    ValidationType extends ValidationTypes,
    TLastSchemeValues extends Record<string, unknown> = {},
  >(
    executor: RuleExecutor<ValidationType, TLastSchemeValues>,
    commonParams?: CommonRuleParams<ValidationType>,
  ) =>
  (
    value: Parameters<
      IndependentValidationRule<ValidationType, TLastSchemeValues>
    >[0],
    prevCtx?: Parameters<
      IndependentValidationRule<ValidationType, TLastSchemeValues>
    >[1],
  ): ReturnType<
    IndependentValidationRule<ValidationType, TLastSchemeValues>
  > => {
    // контекст создается, если он не был создан раннее
    const ctx = createContext<unknown>(prevCtx, value);

    // если value попало под исключения из правил, то дальше валидацию не продолжаем
    if (commonParams?.exclude?.(value, ctx)) {
      return undefined;
    }

    return executor(value, ctx as ValidationContext<TLastSchemeValues>);
  };
