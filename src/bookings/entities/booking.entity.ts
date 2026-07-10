import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Service } from '../../services/entities/service.entity';
import { BookingStatus } from '../enums/booking-status.enum';

@Entity('bookings')
@Index(['serviceId', 'bookingDate', 'bookingTime'])
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  customerName!: string;

  @Column()
  customerEmail!: string;

  @Column()
  customerPhone!: string;

  @Column()
  serviceId!: string;

  @ManyToOne(() => Service, (service) => service.bookings, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'serviceId' })
  service!: Service;

  @Column({ type: 'date' })
  bookingDate!: string;

  /** Stored as HH:mm, validated at the DTO layer */
  @Column()
  bookingTime!: string;

  // Stored as varchar (not a native DB enum) so the same entity works
  // unmodified against both PostgreSQL and SQLite. Correctness is enforced
  // at the application layer via class-validator (@IsEnum) on the DTOs.
  @Column({ type: 'varchar', default: BookingStatus.PENDING })
  status!: BookingStatus;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
