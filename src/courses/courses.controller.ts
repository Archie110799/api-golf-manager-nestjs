import { Controller, Get, Param, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  getCourses() {
    return this.coursesService.getCourses();
  }

  @Get(':courseId/slots')
  getSlots(
    @Param('courseId') courseId: string,
    @Query('date') date?: string,
  ) {
    return this.coursesService.getSlots(courseId, date);
  }
}
