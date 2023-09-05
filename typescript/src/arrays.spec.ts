import * as arrays from './arrays';

describe('Contains Duplicates', () => {
  it('should detect duplicates', () => {
    expect(arrays.containsDuplicate([1, 2, 3, 1])).toEqual(true);
    expect(arrays.containsDuplicate([1, 1, 1, 3, 3, 4, 3, 2, 4, 2]))
      .toEqual(true);
    expect(arrays.containsDuplicate([1, 2, 3, 4])).toEqual(false);
  });
});
