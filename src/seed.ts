/**
 * Seed script: tạo user, courses, slots mẫu.
 * Chạy: npm run seed
 */
import * as fs from 'fs';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from './entities/user.entity';
import { Course } from './entities/course.entity';
import { Slot } from './entities/slot.entity';
import { AppDataSource } from './data-source';

async function seed() {
  fs.mkdirSync('data', { recursive: true });
  const ds = await AppDataSource.initialize();
  try {
    const userRepo = ds.getRepository(User);
    const courseRepo = ds.getRepository(Course);
    const slotRepo = ds.getRepository(Slot);

    const existingUser = await userRepo.findOne({ where: { email: 'demo@golf.dev' } });
    if (!existingUser) {
      const user = userRepo.create({
        id: uuidv4(),
        email: 'demo@golf.dev',
        passwordHash: await bcrypt.hash('demo123', 10),
        fullName: 'Demo User',
        phone: null,
        role: 'user',
      });
      await userRepo.save(user);
      console.log('Created user demo@golf.dev / demo123');
    } else {
      console.log('User demo@golf.dev already exists');
    }

    const existingAdmin = await userRepo.findOne({ where: { email: 'admin@golf.dev' } });
    if (!existingAdmin) {
      const admin = userRepo.create({
        id: uuidv4(),
        email: 'admin@golf.dev',
        passwordHash: await bcrypt.hash('admin123', 10),
        fullName: 'Admin',
        phone: null,
        role: 'admin',
      });
      await userRepo.save(admin);
      console.log('Created admin admin@golf.dev / admin123');
    } else {
      console.log('Admin admin@golf.dev already exists');
    }

    let course = await courseRepo.findOne({ where: { name: 'Sân Golf Long Thành' } });
    if (!course) {
      course = courseRepo.create({
        id: uuidv4(),
        name: 'Sân Golf Long Thành',
        description: 'Sân 18 hố tiêu chuẩn',
        address: 'Long Thành, Đồng Nai',
      });
      await courseRepo.save(course);
      console.log('Created course:', course.name);
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().slice(0, 10);
    const existingSlot = await slotRepo.findOne({
      where: { courseId: course.id, date: dateStr },
    });
    if (!existingSlot) {
      const slots = [
        { start: '07:00', end: '08:00' },
        { start: '08:00', end: '09:00' },
        { start: '09:00', end: '10:00' },
        { start: '10:00', end: '11:00' },
      ];
      for (const s of slots) {
        const slot = slotRepo.create({
          id: uuidv4(),
          courseId: course.id,
          date: dateStr,
          startTime: s.start,
          endTime: s.end,
          available: true,
        });
        await slotRepo.save(slot);
      }
      console.log('Created 4 slots for', dateStr);
    }

    console.log('Seed done.');
  } finally {
    await ds.destroy();
  }
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
