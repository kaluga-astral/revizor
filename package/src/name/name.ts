import {
  CommonRuleParams,
  createRule,
  fullNameLength,
  hasConsecutiveChars,
  isCheckValidCharacters,
  isStartsWithAndEndsWithLetter,
} from '../core';

import { NAME_ERROR_INFO } from './constants';

type NameParams = CommonRuleParams<string> & {
  /**
   * @description Замена стандартного сообщения ошибки.
   */
  message?: string;
};

/**
 * @description Проверяет валидно ли имя
 * @example
 * ```ts
 * const validate = string(name());
 * validate("Иван");
 * ```
 */
export const name = <TLastSchemaValues extends Record<string, unknown>>(
  params?: NameParams,
) =>
  createRule<string, TLastSchemaValues>(
    (value, ctx) => {
      const createNameError = () =>
        ctx.createError({
          message: params?.message || NAME_ERROR_INFO.message,
          code: NAME_ERROR_INFO.code,
        });

      // Проверка на длину имени (минимум 1 символ, максимум 200)
      if (fullNameLength(value)) {
        return createNameError();
      }

      // Разрешенные символы: прописные (большие) и строчные буквы (включая ё) русского алфавита,
      // прописные (большие) буквы I и V латинского алфавита, -, пробел, точка, апостроф, запятая, открывающая и закрывающая скобка
      if (isCheckValidCharacters(value)) {
        return createNameError();
      }

      // Начинается с буквы и заканчивается буквой
      if (isStartsWithAndEndsWithLetter(value)) {
        return createNameError();
      }

      // Не может содержать последовательно два спецсимвола/пробела
      if (hasConsecutiveChars(value)) {
        return createNameError();
      }

      // значение по умолчанию
      return undefined;
    },
    { exclude: params?.exclude },
  );