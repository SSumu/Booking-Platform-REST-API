import { Booking } from '../../bookings/entities/booking.entity';
export declare class Service {
    id: string;
    title: string;
    description: string;
    duration: number;
    price: number;
    isActive: boolean;
    bookings: Booking[];
    createdAt: Date;
    updatedAt: Date;
}
