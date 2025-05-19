import { Injectable } from '@nestjs/common';
import { CreateCalculatorDto, Operator } from './create-calculator.dto';
import { Span, trace } from '@opentelemetry/api';

const tracer = trace.getTracer('backend');

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  calculator(createCalculatorDto: CreateCalculatorDto): number {
    return tracer.startActiveSpan('calculate', (span: Span) => {
      switch (createCalculatorDto.op) {
        case Operator.PLUS:
          span.end()
          return createCalculatorDto.a + createCalculatorDto.b;
        case Operator.MINUS:
          span.end()
          return createCalculatorDto.a - createCalculatorDto.b;
        case Operator.MULTIPLY:
          span.end()
          return createCalculatorDto.a * createCalculatorDto.b;
        case Operator.DIVIDE:
          span.end()
          return Number(
            (createCalculatorDto.a / createCalculatorDto.b).toFixed(2),
          );
        case Operator.EXPONENT:
          span.end()
          return Math.pow(createCalculatorDto.a, createCalculatorDto.b);
        default:
          span.end()
          return NaN;
      }
    });
  }
}
