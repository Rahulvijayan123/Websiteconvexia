import { calcCAGR, calcPeakPatients, calcPipelineDensity, calcStrategicFit } from '@/lib/crossFieldCalculator';

describe('crossFieldCalculator', () => {
  describe('calcCAGR', () => {
    test('calculates CAGR correctly for known values', () => {
      expect(calcCAGR(4500, 830, 6)).toBeCloseTo(0.33, 2);
    });

    test('handles edge case where peak equals current market', () => {
      expect(calcCAGR(1000, 1000, 5)).toBeCloseTo(0, 4);
    });

    test('throws error for invalid inputs', () => {
      expect(() => calcCAGR(1000, 0, 5)).toThrow('Invalid inputs for CAGR calculation');
      expect(() => calcCAGR(1000, 500, 0)).toThrow('Invalid inputs for CAGR calculation');
      expect(() => calcCAGR(1000, -500, 5)).toThrow('Invalid inputs for CAGR calculation');
    });
  });

  describe('calcPeakPatients', () => {
    test('calculates peak patients correctly', () => {
      expect(calcPeakPatients(1000, 50, 0.8)).toBe(16); // (1000 / 50) * 0.8 = 16
    });

    test('handles zero persistence rate', () => {
      expect(calcPeakPatients(1000, 50, 0)).toBe(0);
    });

    test('throws error for invalid inputs', () => {
      expect(() => calcPeakPatients(1000, 0, 0.8)).toThrow('Invalid input for peak patients calculation');
      expect(() => calcPeakPatients(1000, 50, 1.5)).toThrow('Invalid input for peak patients calculation');
      expect(() => calcPeakPatients(1000, 50, -0.1)).toThrow('Invalid input for peak patients calculation');
    });
  });

  describe('calcPipelineDensity', () => {
    test('calculates pipeline density correctly', () => {
      expect(calcPipelineDensity(25, 100)).toBe(25); // (25 / 100) * 100 = 25
    });

    test('handles zero same target assets', () => {
      expect(calcPipelineDensity(0, 100)).toBe(0);
    });

    test('throws error for invalid inputs', () => {
      expect(() => calcPipelineDensity(25, 0)).toThrow('Invalid input for pipeline density calculation');
      expect(() => calcPipelineDensity(-5, 100)).toThrow('Invalid input for pipeline density calculation');
    });
  });

  describe('calcStrategicFit', () => {
    test('calculates cosine similarity correctly', () => {
      const vectorA = [1, 0, 0];
      const vectorB = [1, 0, 0];
      expect(calcStrategicFit(vectorA, vectorB)).toBeCloseTo(1, 4); // Perfect similarity
    });

    test('handles orthogonal vectors', () => {
      const vectorA = [1, 0];
      const vectorB = [0, 1];
      expect(calcStrategicFit(vectorA, vectorB)).toBeCloseTo(0, 4); // No similarity
    });

    test('handles zero vectors', () => {
      const vectorA = [0, 0, 0];
      const vectorB = [1, 1, 1];
      expect(calcStrategicFit(vectorA, vectorB)).toBe(0);
    });

    test('throws error for mismatched vector lengths', () => {
      expect(() => calcStrategicFit([1, 2], [1, 2, 3])).toThrow('Vectors must have the same length for similarity calculation');
    });

    test('throws error for empty vectors', () => {
      expect(() => calcStrategicFit([], [])).toThrow('Vectors cannot be empty');
    });
  });
}); 