import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getWelcome() {
    return {
      status: 'ok',
      service: 'EN2H Booking Platform API',
      timestamp: new Date().toISOString(),
    };
  }
}
