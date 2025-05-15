import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiBody } from '@nestjs/swagger';
import { CreateCalculatorDto } from './create-calculator.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post()
  @ApiBody({ type: CreateCalculatorDto })
  calculation(@Body() body: CreateCalculatorDto): number {
    return this.appService.calculator(body);
  }
}
