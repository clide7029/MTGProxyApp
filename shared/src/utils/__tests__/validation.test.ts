import { isValidDeckStatus, isValidProxyStatus, isValidRerollAspect } from '../validation';

describe('Validation Utils', () => {
  describe('isValidDeckStatus', () => {
    it('should return true for valid deck statuses', () => {
      expect(isValidDeckStatus('draft')).toBe(true);
      expect(isValidDeckStatus('processing')).toBe(true);
      expect(isValidDeckStatus('completed')).toBe(true);
      expect(isValidDeckStatus('error')).toBe(true);
    });

    it('should return false for invalid deck statuses', () => {
      expect(isValidDeckStatus('invalid')).toBe(false);
      expect(isValidDeckStatus('')).toBe(false);
      expect(isValidDeckStatus('DRAFT')).toBe(false);
    });
  });

  describe('isValidProxyStatus', () => {
    it('should return true for valid proxy statuses', () => {
      expect(isValidProxyStatus('pending')).toBe(true);
      expect(isValidProxyStatus('processing')).toBe(true);
      expect(isValidProxyStatus('completed')).toBe(true);
      expect(isValidProxyStatus('error')).toBe(true);
    });

    it('should return false for invalid proxy statuses', () => {
      expect(isValidProxyStatus('invalid')).toBe(false);
      expect(isValidProxyStatus('')).toBe(false);
      expect(isValidProxyStatus('PENDING')).toBe(false);
    });
  });

  describe('isValidRerollAspect', () => {
    it('should return true for valid reroll aspects', () => {
      expect(isValidRerollAspect('name')).toBe(true);
      expect(isValidRerollAspect('flavor')).toBe(true);
      expect(isValidRerollAspect('art')).toBe(true);
      expect(isValidRerollAspect('all')).toBe(true);
    });

    it('should return false for invalid reroll aspects', () => {
      expect(isValidRerollAspect('invalid')).toBe(false);
      expect(isValidRerollAspect('')).toBe(false);
      expect(isValidRerollAspect('NAME')).toBe(false);
    });
  });
});