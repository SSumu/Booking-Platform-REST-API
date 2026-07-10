import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 'John Smith' })
  @IsString()
  customerName!: string;

  @ApiProperty({ example: 'john.smith@example.com' })
  @IsEmail()
  customerEmail!: string;

  @ApiProperty({ example: '+1 555 123 4567' })
  @IsString()
  customerPhone!: string;

  @ApiProperty({ example: 'b3f1c9d2-1234-4a56-9abc-1234567890ab' })
  @IsUUID()
  serviceId!: string;

  @ApiProperty({ example: '2026-08-01', description: 'YYYY-MM-DD' })
  @IsDateString()
  bookingDate!: string;

  @ApiProperty({ example: '14:30', description: 'HH:mm, 24 hour clock' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'bookingTime must be in HH:mm format',
  })
  bookingTime!: string;

  @ApiProperty({ example: 'Please use the side entrance', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
