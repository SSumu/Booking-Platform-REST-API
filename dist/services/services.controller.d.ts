import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
export declare class ServicesController {
    private readonly servicesService;
    constructor(servicesService: ServicesService);
    create(dto: CreateServiceDto): Promise<import("./entities/service.entity").Service>;
    findAll(query: PaginationQueryDto): Promise<{
        data: import("./entities/service.entity").Service[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<import("./entities/service.entity").Service>;
    update(id: string, dto: UpdateServiceDto): Promise<import("./entities/service.entity").Service>;
    remove(id: string): Promise<void>;
}
