import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '../entities/course.entity';
import { Booking } from '../entities/booking.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Booking])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
