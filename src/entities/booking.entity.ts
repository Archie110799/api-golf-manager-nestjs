import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Course } from './course.entity';
import { Slot } from './slot.entity';

@Entity('bookings')
export class Booking {
  @PrimaryColumn('text')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (u) => u.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'course_id' })
  courseId: string;

  @ManyToOne(() => Course, (c) => c.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({ name: 'slot_id' })
  slotId: string;

  @ManyToOne(() => Slot, (s) => s.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'slot_id' })
  slot: Slot;

  /** Booking date (YYYY-MM-DD) */
  @Column({ type: 'date' })
  date: string;

  @Column({ default: 'confirmed' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
