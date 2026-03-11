import { IsString, Matches } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  courseId: string;

  @IsString()
  slotId: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date phải là YYYY-MM-DD' })
  date: string;
}
