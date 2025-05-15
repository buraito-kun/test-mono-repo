import { ApiProperty } from "@nestjs/swagger";

export enum Operator {
  PLUS = '+',
  MINUS = '-',
  MULTIPLY = '*',
  DIVIDE = '/',
  EXPONENT = '^',
}

export class CreateCalculatorDto {
  @ApiProperty({
    required: true,
  })
  a: number;

  @ApiProperty({
    required: true,
  })
  b: number;

  @ApiProperty({
    required: true,
    enum: ['+', '-', '*', '/', '^'],
  })
  op: Operator;
}
