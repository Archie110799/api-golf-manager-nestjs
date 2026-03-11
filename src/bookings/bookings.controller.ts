import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../entities/user.entity';
import { GetUser } from './decorators/get-user.decorator';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingsService } from './bookings.service';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@GetUser() user: User, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(user, dto);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getMyBookings(@GetUser() user: User) {
    return this.bookingsService.getMyBookings(user);
  }

  @Delete(':bookingId')
  @UseGuards(AuthGuard('jwt'))
  cancel(@GetUser() user: User, @Param('bookingId') bookingId: string) {
    return this.bookingsService.cancel(user, bookingId);
  }
}
