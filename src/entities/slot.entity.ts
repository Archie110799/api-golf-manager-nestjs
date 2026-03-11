import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Course } from './course.entity';
import { Booking } from './booking.entity';

@Entity('slots')
export class Slot {
  @PrimaryColumn('text')
  id: string;

  @Column({ name: 'course_id' })
  courseId: string;

  @ManyToOne(() => Course, (c) => c.slots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  /** Date of slot (YYYY-MM-DD) */
  @Column({ type: 'date' })
  date: string;

  @Column({ name: 'start_time', type: 'text' })
  startTime: string;

  @Column({ name: 'end_time', type: 'text' })
  endTime: string;

  @Column({ default: true })
  available: boolean;

  @OneToMany(() => Booking, (b) => b.slot)
  bookings: Booking[];
}
