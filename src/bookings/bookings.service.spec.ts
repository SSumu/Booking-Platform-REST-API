import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { Booking } from './entities/booking.entity';
import { Service } from '../services/entities/service.entity';
import { BookingStatus } from './enums/booking-status.enum';

describe('BookingsService', () => {
  let service: BookingsService;
  let bookingRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let serviceRepo: { findOne: jest.Mock };

  const futureDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().slice(0, 10);
  };

  beforeEach(async () => {
    bookingRepo = {
      findOne: jest.fn(),
      create: jest.fn((dto: Partial<Booking>) => dto),
      save: jest.fn((entity: Partial<Booking>) =>
        Promise.resolve({ id: 'booking-1', ...entity } as Booking),
      ),
    };
    serviceRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: getRepositoryToken(Booking), useValue: bookingRepo },
        { provide: getRepositoryToken(Service), useValue: serviceRepo },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
  });

  describe('create', () => {
    it('throws NotFoundException when the service does not exist', async () => {
      serviceRepo.findOne.mockResolvedValue(null);

      await expect(
        service.create({
          customerName: 'John',
          customerEmail: 'john@example.com',
          customerPhone: '123',
          serviceId: 'missing-service',
          bookingDate: futureDate(),
          bookingTime: '10:00',
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws BadRequestException when the booking date is in the past', async () => {
      serviceRepo.findOne.mockResolvedValue({ id: 'service-1' });

      await expect(
        service.create({
          customerName: 'John',
          customerEmail: 'john@example.com',
          customerPhone: '123',
          serviceId: 'service-1',
          bookingDate: '2000-01-01',
          bookingTime: '10:00',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws ConflictException for a duplicate booking (same service/date/time)', async () => {
      serviceRepo.findOne.mockResolvedValue({ id: 'service-1' });
      bookingRepo.findOne.mockResolvedValue({ id: 'existing-booking' });

      await expect(
        service.create({
          customerName: 'John',
          customerEmail: 'john@example.com',
          customerPhone: '123',
          serviceId: 'service-1',
          bookingDate: futureDate(),
          bookingTime: '10:00',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('creates a booking with PENDING status when everything is valid', async () => {
      serviceRepo.findOne.mockResolvedValue({ id: 'service-1' });
      bookingRepo.findOne.mockResolvedValue(null);

      const result = await service.create({
        customerName: 'John',
        customerEmail: 'john@example.com',
        customerPhone: '123',
        serviceId: 'service-1',
        bookingDate: futureDate(),
        bookingTime: '10:00',
      });

      expect(result.status).toBe(BookingStatus.PENDING);
    });
  });

  describe('updateStatus', () => {
    it('does not allow a cancelled booking to become completed', async () => {
      bookingRepo.findOne.mockResolvedValue({
        id: 'booking-1',
        status: BookingStatus.CANCELLED,
      });

      await expect(
        service.updateStatus('booking-1', { status: BookingStatus.COMPLETED }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('allows a pending booking to be confirmed', async () => {
      bookingRepo.findOne.mockResolvedValue({
        id: 'booking-1',
        status: BookingStatus.PENDING,
      });

      const result = await service.updateStatus('booking-1', {
        status: BookingStatus.CONFIRMED,
      });
      expect(result.status).toBe(BookingStatus.CONFIRMED);
    });

    it('does not allow a completed booking to change status', async () => {
      bookingRepo.findOne.mockResolvedValue({
        id: 'booking-1',
        status: BookingStatus.COMPLETED,
      });

      await expect(
        service.updateStatus('booking-1', { status: BookingStatus.CANCELLED }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('cancel', () => {
    it('cancels a pending booking', async () => {
      bookingRepo.findOne.mockResolvedValue({
        id: 'booking-1',
        status: BookingStatus.PENDING,
      });

      const result = await service.cancel('booking-1');
      expect(result.status).toBe(BookingStatus.CANCELLED);
    });

    it('throws BadRequestException when cancelling an already-completed booking', async () => {
      bookingRepo.findOne.mockResolvedValue({
        id: 'booking-1',
        status: BookingStatus.COMPLETED,
      });

      await expect(service.cancel('booking-1')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });
});
