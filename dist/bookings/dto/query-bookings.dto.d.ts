import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { BookingStatus } from '../enums/booking-status.enum';
export declare class QueryBookingsDto extends PaginationQueryDto {
    status?: BookingStatus;
    search?: string;
}
