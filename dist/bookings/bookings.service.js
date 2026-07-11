"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const booking_entity_1 = require("./entities/booking.entity");
const service_entity_1 = require("../services/entities/service.entity");
const booking_status_enum_1 = require("./enums/booking-status.enum");
const ALLOWED_TRANSITIONS = {
    [booking_status_enum_1.BookingStatus.PENDING]: [booking_status_enum_1.BookingStatus.CONFIRMED, booking_status_enum_1.BookingStatus.CANCELLED],
    [booking_status_enum_1.BookingStatus.CONFIRMED]: [booking_status_enum_1.BookingStatus.COMPLETED, booking_status_enum_1.BookingStatus.CANCELLED],
    [booking_status_enum_1.BookingStatus.CANCELLED]: [],
    [booking_status_enum_1.BookingStatus.COMPLETED]: [],
};
let BookingsService = class BookingsService {
    bookingRepository;
    serviceRepository;
    constructor(bookingRepository, serviceRepository) {
        this.bookingRepository = bookingRepository;
        this.serviceRepository = serviceRepository;
    }
    async create(dto) {
        const service = await this.serviceRepository.findOne({
            where: { id: dto.serviceId },
        });
        if (!service) {
            throw new common_1.NotFoundException(`Service with id ${dto.serviceId} not found`);
        }
        this.assertDateNotInPast(dto.bookingDate);
        const duplicate = await this.bookingRepository.findOne({
            where: {
                serviceId: dto.serviceId,
                bookingDate: dto.bookingDate,
                bookingTime: dto.bookingTime,
                status: (0, typeorm_2.Not)(booking_status_enum_1.BookingStatus.CANCELLED),
            },
        });
        if (duplicate) {
            throw new common_1.ConflictException('A booking already exists for this service at the selected date and time');
        }
        const booking = this.bookingRepository.create({
            ...dto,
            status: booking_status_enum_1.BookingStatus.PENDING,
        });
        return this.bookingRepository.save(booking);
    }
    async findAll(query) {
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
            qb.andWhere('(LOWER(booking.customerName) LIKE LOWER(:search) OR LOWER(booking.customerEmail) LIKE LOWER(:search))', { search: `%${query.search}%` });
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
    async findOne(id) {
        const booking = await this.bookingRepository.findOne({
            where: { id },
            relations: { service: true },
        });
        if (!booking) {
            throw new common_1.NotFoundException(`Booking with id ${id} not found`);
        }
        return booking;
    }
    async updateStatus(id, dto) {
        const booking = await this.findOne(id);
        this.assertTransitionAllowed(booking.status, dto.status);
        booking.status = dto.status;
        return this.bookingRepository.save(booking);
    }
    async cancel(id) {
        const booking = await this.findOne(id);
        this.assertTransitionAllowed(booking.status, booking_status_enum_1.BookingStatus.CANCELLED);
        booking.status = booking_status_enum_1.BookingStatus.CANCELLED;
        return this.bookingRepository.save(booking);
    }
    assertTransitionAllowed(from, to) {
        if (from === to) {
            return;
        }
        const allowed = ALLOWED_TRANSITIONS[from] ?? [];
        if (!allowed.includes(to)) {
            throw new common_1.BadRequestException(`Booking cannot transition from ${from} to ${to}`);
        }
    }
    assertDateNotInPast(bookingDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const date = new Date(bookingDate);
        if (date < today) {
            throw new common_1.BadRequestException('bookingDate cannot be in the past');
        }
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __param(1, (0, typeorm_1.InjectRepository)(service_entity_1.Service)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map