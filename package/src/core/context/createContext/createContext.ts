import { ValidationContext } from '../types';
import { ValidationTypes } from '../../types';

/**
 * @description Создает context валидации. Используется внутри фабрик guard и rule
 * @default по-дефолту сбрасывает все флаги в false
 */
export function createContext<Value extends ValidationTypes>(
  prevCtx: ValidationContext<Value> | undefined,
  value: Value,
): ValidationContext<Value>;

export function createContext<Value extends ValidationTypes, Values>(
  prevCtx: ValidationContext<Values> | undefined,
  value: Value,
): ValidationContext<Values>;

export function createContext<Value extends ValidationTypes, Values>(
  prevCtx: ValidationContext<Values> | undefined,
  value: Value,
): ValidationContext<Values | Value> {
  if (prevCtx) {
    return prevCtx;
  }

  return {
    global: {
      values: value,
      overrides: {
        objectIsPartial: false,
      },
    },
  };
}
