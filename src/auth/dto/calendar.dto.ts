import { IsEmail, IsNotEmpty, IsString } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CalendarDto {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  googleCalendarRefreshToken: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  googleCalendarAccessToken: string;
}
