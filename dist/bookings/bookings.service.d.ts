import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { Service } from '../services/entities/service.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
export declare class BookingsService {
    private readonly bookingRepository;
    private readonly serviceRepository;
    constructor(bookingRepository: Repository<Booking>, serviceRepository: Repository<Service>);
    create(dto: CreateBookingDto): Promise<Booking>;
    findAll(query: QueryBookingsDto): Promise<{
        data: Booking[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<Booking>;
    updateStatus(id: string, dto: UpdateBookingStatusDto): Promise<Booking>;
    cancel(id: string): Promise<Booking>;
    private assertTransitionAllowed;
    private assertDateNotInPast;
}
