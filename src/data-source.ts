import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { Course } from './entities/course.entity';
import { Slot } from './entities/slot.entity';
import { Booking } from './entities/booking.entity';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'data/database.sqlite',
  entities: [User, RefreshToken, Course, Slot, Booking],
  migrations: [
    __dirname + '/migrations/1731190000000-InitialSchema.ts',
    __dirname + '/migrations/1731200000000-AddUserRole.ts',
  ],
  synchronize: false,
});
