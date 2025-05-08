import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post()
  calculation(@Body("a") a: number, @Body("b") b: number, @Body("op") op: string): number {
    return this.appService.calculator(a, b, op);
  }
}
