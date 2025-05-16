import { Injectable } from '@nestjs/common';
import { CreateCalculatorDto, Operator } from './create-calculator.dto';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  calculator(createCalculatorDto: CreateCalculatorDto): number {
    switch (createCalculatorDto.op) {
      case Operator.PLUS:
        return createCalculatorDto.a + createCalculatorDto.b;
      case Operator.MINUS:
        return createCalculatorDto.a - createCalculatorDto.b;
      case Operator.MULTIPLY:
        return createCalculatorDto.a * createCalculatorDto.b;
      case Operator.DIVIDE:
        return Number((createCalculatorDto.a / createCalculatorDto.b).toFixed(2));
      case Operator.EXPONENT:
        return Math.pow(createCalculatorDto.a, createCalculatorDto.b);
      default:
        return NaN;
    }
  }
}
