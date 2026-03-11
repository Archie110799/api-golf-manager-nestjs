import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entities/course.entity';
import { Slot } from '../entities/slot.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
    @InjectRepository(Slot)
    private slotRepo: Repository<Slot>,
  ) {}

  async getCourses() {
    return this.courseRepo.find({
      order: { name: 'ASC' },
    });
  }

  async getSlots(courseId: string, date?: string) {
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException('Không tìm thấy sân');
    }
    const qb = this.slotRepo
      .createQueryBuilder('slot')
      .where('slot.courseId = :courseId', { courseId })
      .andWhere('slot.available = :available', { available: true });
    if (date) {
      qb.andWhere('slot.date = :date', { date });
    }
    const slots = await qb.orderBy('slot.date').addOrderBy('slot.startTime').getMany();
    return slots;
  }
}
