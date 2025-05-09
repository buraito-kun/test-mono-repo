import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
      expect(appController.calculation(1, 2, '+')).toBe(3);
    });
    it('add -5 + 15 to equal 20', () => {
      expect(appController.calculation(-5, 15, '+')).toBe(10);
    });

    it('add 5 - 15 to equal -10', () => {
      expect(appController.calculation(5, 15, '-')).toBe(-10);
    });
    it('add 21 - 7 to equal 14', () => {
      expect(appController.calculation(21, 7, '-')).toBe(14);
    });

    it('add 2 * 3 to equal 6', () => {
      expect(appController.calculation(2, 3, '*')).toBe(6);
    });
    it('add -2 * 15 to equal -30', () => {
      expect(appController.calculation(-2, 15, '*')).toBe(-30);
    });

    it('add 21 / 7 to equal 3', () => {
      expect(appController.calculation(21, 7, '/')).toBe(3);
    });
    it('add 99 / -11 to equal -9', () => {
      expect(appController.calculation(99, -11, '/')).toBe(-9);
    });
  });
});
