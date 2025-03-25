import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsEmail,
  IsNumber,
} from '@nestjs/class-validator';

export class CreateTaskDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  title: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  description?: string | null;
}
