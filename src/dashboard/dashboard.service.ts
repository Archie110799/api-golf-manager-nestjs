import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entities/course.entity';
import { Booking } from '../entities/booking.entity';

export type DashboardStats = {
  visitors: number;
  coursesCount: number;
  bookingsCount: number;
  videosCount: number;
  postsCount: number;
  revenueByMonth: Array<{ month: string; revenue: number }>;
};

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
  ) {}

  async getStats(): Promise<DashboardStats> {
    const [coursesCount, bookingsCount] = await Promise.all([
      this.courseRepo.count(),
      this.bookingRepo.count({ where: { status: 'confirmed' } }),
    ]);

    const revenueByMonth = this.getRevenueByMonth();

    return {
      visitors: 0,
      coursesCount,
      bookingsCount,
      videosCount: 0,
      postsCount: 0,
      revenueByMonth,
    };
  }

  private getRevenueByMonth(): Array<{ month: string; revenue: number }> {
    const result: Array<{ month: string; revenue: number }> = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push({
        month: d.toISOString().slice(0, 7),
        revenue: 0,
      });
    }
    return result;
  }
}
