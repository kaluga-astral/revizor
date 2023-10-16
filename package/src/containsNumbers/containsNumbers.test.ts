import { expect } from 'vitest';

import { containsNumbers } from './containsNumbers';
import { CONTAINS_NUMBERS_ERROR_CODE } from './constants';

describe('containsNumbers', () => {
  it.each<string>([
    '123',
    '0000000',
    '1',
    '0',
    '91999099',
    '-a123',
    'a123',
    '1a11aa',
    '1.23bb',
    '43.443.43',
    '43..32',
    '43..',
    '.43',
    '1,2',
    '10-122',
    '2+2',
    '12`/?*',
  ])('value:%s: valid', (value) => {
    const validate = containsNumbers();

    const result = validate(value);

    expect(result).toBeUndefined();
  });

  it.each<string>([
    'aaa',
    '-a',
    '+a',
    'aa.aa',
    'aa..aa',
    'aa..',
    '.aa',
    'a,a',
    'aa-aa',
    'a+a',
    'aa`/?*',
  ])('value:%s: invalid', (value) => {
    const validate = containsNumbers();

    const error = validate(value);

    expect(error?.cause.code).toEqual(CONTAINS_NUMBERS_ERROR_CODE);
  });

  it('params.message: позволяет переопределить message', () => {
    const validate = containsNumbers({ message: 'my message' });

    const error = validate('aa');

    expect(error?.message).toBe('my message');
  });
});