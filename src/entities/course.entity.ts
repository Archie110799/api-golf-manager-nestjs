import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Slot } from './slot.entity';
import { Booking } from './booking.entity';

@Entity('courses')
export class Course {
  @PrimaryColumn('text')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Slot, (s) => s.course)
  slots: Slot[];

  @OneToMany(() => Booking, (b) => b.course)
  bookings: Booking[];
}
