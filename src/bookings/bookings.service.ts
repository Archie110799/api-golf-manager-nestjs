import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../entities/user.entity';
import { Booking } from '../entities/booking.entity';
import { Slot } from '../entities/slot.entity';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
    @InjectRepository(Slot)
    private slotRepo: Repository<Slot>,
  ) {}

  async create(user: User, dto: CreateBookingDto) {
    const slot = await this.slotRepo.findOne({
      where: { id: dto.slotId, courseId: dto.courseId, date: dto.date },
      relations: ['course'],
    });
    if (!slot) {
      throw new NotFoundException('Không tìm thấy slot');
    }
    if (!slot.available) {
      throw new BadRequestException('Slot không còn trống');
    }
    const existing = await this.bookingRepo.findOne({
      where: { slotId: dto.slotId, date: dto.date, status: 'confirmed' },
    });
    if (existing) {
      throw new BadRequestException('Slot đã được đặt');
    }
    const booking = this.bookingRepo.create({
      id: uuidv4(),
      userId: user.id,
      courseId: dto.courseId,
      slotId: dto.slotId,
      date: dto.date,
      status: 'confirmed',
    });
    await this.bookingRepo.save(booking);
    return booking;
  }

  async getMyBookings(user: User) {
    return this.bookingRepo.find({
      where: { userId: user.id },
      relations: ['course', 'slot'],
      order: { date: 'ASC', createdAt: 'DESC' },
    });
  }

  async cancel(user: User, bookingId: string) {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
    });
    if (!booking) {
      throw new NotFoundException('Không tìm thấy đặt chỗ');
    }
    if (booking.userId !== user.id) {
      throw new ForbiddenException('Bạn không thể hủy đặt chỗ này');
    }
    booking.status = 'cancelled';
    await this.bookingRepo.save(booking);
    return { message: 'Đã hủy đặt chỗ' };
  }
}
