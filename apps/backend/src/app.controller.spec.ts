import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Operator } from './create-calculator.dto';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('calculation', () => {
    it('add 1 + 2 to equal 3', () => {
      expect(appController.calculation({ a: 1, b: 2, op: Operator.PLUS })).toBe(
        3,
      );
    });
    it('add -5 + 15 to equal 20', () => {
      expect(
        appController.calculation({ a: -5, b: 15, op: Operator.PLUS }),
      ).toBe(10);
    });

    it('minus 5 - 15 to equal -10', () => {
      expect(
        appController.calculation({ a: 5, b: 15, op: Operator.MINUS }),
      ).toBe(-10);
    });
    it('minus 21 - 7 to equal 14', () => {
      expect(
        appController.calculation({ a: 21, b: 7, op: Operator.MINUS }),
      ).toBe(14);
    });

    it('multiply 2 * 3 to equal 6', () => {
      expect(
        appController.calculation({ a: 2, b: 3, op: Operator.MULTIPLY }),
      ).toBe(6);
    });
    it('multiply -2 * 15 to equal -30', () => {
      expect(
        appController.calculation({ a: -2, b: 15, op: Operator.MULTIPLY }),
      ).toBe(-30);
    });

    it('divide 21 / 7 to equal 3', () => {
      expect(
        appController.calculation({ a: 21, b: 7, op: Operator.DIVIDE }),
      ).toBe(3);
    });
    it('divide 99 / -11 to equal -9', () => {
      expect(
        appController.calculation({ a: 99, b: -11, op: Operator.DIVIDE }),
      ).toBe(-9);
    });

    it('exponent 2 ^ 3 to equal 8', () => {
      expect(
        appController.calculation({ a: 2, b: 3, op: Operator.EXPONENT }),
      ).toBe(8);
    });
    it('exponent 2 ^ -2 to equal 0.25', () => {
      expect(
        appController.calculation({ a: 2, b: -2, op: Operator.EXPONENT }),
      ).toBe(0.25);
    });

    it('other op 2 ** 3 to equal NaN', () => {
      expect(
        appController.calculation({ a: 2, b: 3, op: Operator.UNKNOWN }),
      ).toBe(NaN);
    });
    it('other op 10 % 2 to equal NaN', () => {
      expect(
        appController.calculation({ a: 10, b: 2, op: Operator.UNKNOWN }),
      ).toBe(NaN);
    });
  });
});
