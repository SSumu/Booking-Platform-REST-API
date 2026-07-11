import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
export declare class ServicesService {
    private readonly serviceRepository;
    constructor(serviceRepository: Repository<Service>);
    create(dto: CreateServiceDto): Promise<Service>;
    findAll(query: PaginationQueryDto): Promise<{
        data: Service[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<Service>;
    update(id: string, dto: UpdateServiceDto): Promise<Service>;
    remove(id: string): Promise<void>;
}
