import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    create(dto: CreateBookingDto): Promise<import("./entities/booking.entity").Booking>;
    findAll(query: QueryBookingsDto): Promise<{
        data: import("./entities/booking.entity").Booking[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<import("./entities/booking.entity").Booking>;
    updateStatus(id: string, dto: UpdateBookingStatusDto): Promise<import("./entities/booking.entity").Booking>;
    cancel(id: string): Promise<import("./entities/booking.entity").Booking>;
}
