import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { Operator } from './create-calculator.dto';

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
      expect(service.calculator({ a: 1, b: 2, op: Operator.PLUS })).toBe(3);
    });
    it('add -5 + 15 to equal 20', () => {
      expect(
        service.calculator({ a: -5, b: 15, op: Operator.PLUS }),
      ).toBe(10);
    });

    it('minus 5 - 15 to equal -10', () => {
      expect(
        service.calculator({ a: 5, b: 15, op: Operator.MINUS }),
      ).toBe(-10);
    });
    it('minus 21 - 7 to equal 14', () => {
      expect(
        service.calculator({ a: 21, b: 7, op: Operator.MINUS }),
      ).toBe(14);
    });

    it('multiply 2 * 3 to equal 6', () => {
      expect(
        service.calculator({ a: 2, b: 3, op: Operator.MULTIPLY }),
      ).toBe(6);
    });
    it('multiply -2 * 15 to equal -30', () => {
      expect(
        service.calculator({ a: -2, b: 15, op: Operator.MULTIPLY }),
      ).toBe(-30);
    });

    it('divide 21 / 7 to equal 3', () => {
      expect(
        service.calculator({ a: 21, b: 7, op: Operator.DIVIDE }),
      ).toBe(3);
    });
    it('divide 99 / -11 to equal -9', () => {
      expect(
        service.calculator({ a: 99, b: -11, op: Operator.DIVIDE }),
      ).toBe(-9);
    });

    it('exponent 2 ^ 3 to equal 8', () => {
      expect(
        service.calculator({ a: 2, b: 3, op: Operator.EXPONENT }),
      ).toBe(8);
    });
    it('exponent 2 ^ -2 to equal 0.25', () => {
      expect(
        service.calculator({ a: 2, b: -2, op: Operator.EXPONENT }),
      ).toBe(0.25);
    });

    it('other op 2 ** 3 to equal NaN', () => {
      expect(
        service.calculator({ a: 2, b: 3, op: Operator.UNKNOWN }),
      ).toBe(NaN);
    });
    it('other op 10 % 2 to equal NaN', () => {
      expect(
        service.calculator({ a: 10, b: 2, op: Operator.UNKNOWN }),
      ).toBe(NaN);
    });
  });
});
