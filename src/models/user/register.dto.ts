import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsEmail,
  IsNumber,
} from '@nestjs/class-validator';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

export class RegisterResponseDto {
  @ApiProperty({ type: Number, required: true })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  role: UserRole;
  
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  accessToken: string;

}
