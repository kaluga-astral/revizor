/**
 * @description Проверяет, что текст не может содержать последовательно два спецсимвола/пробела
 */

export const isHasConsecutiveChars = (value: string): boolean =>
  /([`~!@#$%^&*()\-_=+[{\]}\|;:'",<.>/?])\1|\s{2}/.test(value);
