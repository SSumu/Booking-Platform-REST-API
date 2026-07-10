import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { Service } from '../services/entities/service.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import { BookingStatus } from './enums/booking-status.enum';

// Defines which status transitions are legal. CANCELLED and COMPLETED are
// terminal states — in particular this is what enforces the business rule
// "Cancelled bookings cannot be marked as completed".
const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
  [BookingStatus.CONFIRMED]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
  [BookingStatus.CANCELLED]: [],
  [BookingStatus.COMPLETED]: [],
};

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async create(dto: CreateBookingDto): Promise<Booking> {
    // Business rule: a booking must belong to an existing service.
    const service = await this.serviceRepository.findOne({
      where: { id: dto.serviceId },
    });
    if (!service) {
      throw new NotFoundException(`Service with id ${dto.serviceId} not found`);
    }

    // Business rule: booking dates cannot be in the past.
    this.assertDateNotInPast(dto.bookingDate);

    // Bonus: prevent duplicate bookings for the same service, date, and time
    // (cancelled bookings don't count as a conflict).
    const duplicate = await this.bookingRepository.findOne({
      where: {
        serviceId: dto.serviceId,
        bookingDate: dto.bookingDate,
        bookingTime: dto.bookingTime,
        status: Not(BookingStatus.CANCELLED),
      },
    });
    if (duplicate) {
      throw new ConflictException(
        'A booking already exists for this service at the selected date and time',
      );
    }

    const booking = this.bookingRepository.create({
      ...dto,
      status: BookingStatus.PENDING,
    });
    return this.bookingRepository.save(booking);
  }

  async findAll(query: QueryBookingsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const qb = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.service', 'service')
      .orderBy('booking.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.status) {
      qb.andWhere('booking.status = :status', { status: query.status });
    }

    if (query.search) {
      // LOWER(...) LIKE keeps this portable across Postgres and SQLite
      // (Postgres-only ILIKE would break the SQLite dev path).
      qb.andWhere(
        '(LOWER(booking.customerName) LIKE LOWER(:search) OR LOWER(booking.customerEmail) LIKE LOWER(:search))',
        { search: `%${query.search}%` },
      );
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: { service: true },
    });
    if (!booking) {
      throw new NotFoundException(`Booking with id ${id} not found`);
    }
    return booking;
  }

  async updateStatus(
    id: string,
    dto: UpdateBookingStatusDto,
  ): Promise<Booking> {
    const booking = await this.findOne(id);
    this.assertTransitionAllowed(booking.status, dto.status);
    booking.status = dto.status;
    return this.bookingRepository.save(booking);
  }

  async cancel(id: string): Promise<Booking> {
    const booking = await this.findOne(id);
    this.assertTransitionAllowed(booking.status, BookingStatus.CANCELLED);
    booking.status = BookingStatus.CANCELLED;
    return this.bookingRepository.save(booking);
  }

  private assertTransitionAllowed(from: BookingStatus, to: BookingStatus) {
    if (from === to) {
      return;
    }
    const allowed = ALLOWED_TRANSITIONS[from] ?? [];
    if (!allowed.includes(to)) {
      throw new BadRequestException(
        `Booking cannot transition from ${from} to ${to}`,
      );
    }
  }

  private assertDateNotInPast(bookingDate: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(bookingDate);
    if (date < today) {
      throw new BadRequestException('bookingDate cannot be in the past');
    }
  }
}
