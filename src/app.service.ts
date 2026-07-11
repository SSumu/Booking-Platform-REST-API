import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // getHello(): string {
  //   return 'Hello World!';
  // }
  getWelcome() {
    return {
      status: 'ok',
      service: 'EN2H Booking Platform API',
      timestamp: new Date().toISOString(),
    };
  }
}
