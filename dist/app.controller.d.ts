import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getWelcome(): {
        status: string;
        service: string;
        timestamp: string;
    };
}
