import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  describe('calculator', () => {
    it('add 1 + 2 to equal 3', () => {
      expect(service.calculator(1, 2, '+')).toBe(3);
    });
    it('add -5 + 15 to equal 20', () => {
      expect(service.calculator(-5, 15, '+')).toBe(10);
    });

    it('add 5 - 15 to equal -10', () => {
      expect(service.calculator(5, 15, '-')).toBe(-10);
    });
    it('add 21 - 7 to equal 14', () => {
      expect(service.calculator(21, 7, '-')).toBe(14);
    });

    it('add 2 * 3 to equal 6', () => {
      expect(service.calculator(2, 3, '*')).toBe(6);
    });
    it('add -2 * 15 to equal -30', () => {
      expect(service.calculator(-2, 15, '*')).toBe(-30);
    });

    it('add 21 / 7 to equal 3', () => {
      expect(service.calculator(21, 7, '/')).toBe(3);
    });
    it('add 99 / -11 to equal -9', () => {
      expect(service.calculator(99, -11, '/')).toBe(-9);
    });

    it('exponent 2 ^ 3 to equal 8', () => {
      expect(service.calculator(2, 3, '^')).toBe(8);
    });
    it('exponent 2 ^ -2 to equal 0.25', () => {
      expect(service.calculator(2, -2, '^')).toBe(0.25);
    });

    it('other op 2 ** 3 to equal NaN', () => {
      expect(service.calculator(2, 3, '**')).toBe(NaN);
    });
    it('other op 10 % 2 to equal NaN', () => {
      expect(service.calculator(10, 2, '%')).toBe(NaN);
    });
  });
});
