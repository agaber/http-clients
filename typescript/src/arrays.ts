export function containsDuplicate(nums: number[]): boolean {
  const seen = new Set<Number>()
  for (const num of nums) {
    if (seen.has(num)) {
      return true;
    }
    seen.add(num);
  }
  return false;
}
