import { Service } from '../../services/entities/service.entity';
import { BookingStatus } from '../enums/booking-status.enum';
export declare class Booking {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    serviceId: string;
    service: Service;
    bookingDate: string;
    bookingTime: string;
    status: BookingStatus;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}
