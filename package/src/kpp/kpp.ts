import { CommonRuleParams, createRule, isStringOfZeros } from '../core';

import { INVALID_KPP_ERROR_INFO, KPP_REGEX } from './constants';

type KPPParams = CommonRuleParams<string> & {
  /**
   * @description Замена стандартного сообщения ошибки.
   */
  message?: string;
};

/**
 * @description Проверяет валидность кода КПП
 * @example
 * ```ts
 * const validate = string(kpp());
 * validate('770201001');
 * ```
 */
export const kpp = <TLastSchemaValues extends Record<string, unknown>>(
  params?: KPPParams,
) =>
  createRule<string, TLastSchemaValues>(
    (value, ctx) => {
      if (isStringOfZeros(value) || !KPP_REGEX.test(value)) {
        return ctx.createError({
          ...INVALID_KPP_ERROR_INFO,
          message: params?.message || INVALID_KPP_ERROR_INFO.message,
        });
      }

      return undefined;
    },
    { exclude: params?.exclude },
  );
