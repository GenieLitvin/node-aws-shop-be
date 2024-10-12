import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('*')
  get(@Req() req: Request) {
    console.log(`${req.originalUrl}`);
    console.log(`${req.method}`);
    console.log(`${req.body}`);
    const recipient = req.originalUrl.split('/')[1];
    const recipientUrl = process.env[recipient];
    console.log(recipientUrl);
    if (recipientUrl) {
      return this.appService.get(
        `${recipientUrl}${req.originalUrl}`,
        req.method,
        req.body,
      );
    } else {
      return this.appService.getHello();
    }
  }
}
