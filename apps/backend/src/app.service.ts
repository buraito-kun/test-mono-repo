import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  calculator(a: number, b: number, op: string): number {
    switch (op) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '*':
        return a * b;
      case '/':
        return Number((a / b).toFixed(2));
      case '^':
        return Math.pow(a, b);
      default:
        return NaN;
    }
  }
}
