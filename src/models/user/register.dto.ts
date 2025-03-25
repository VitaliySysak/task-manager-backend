import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsEmail,
  IsNumber,
} from '@nestjs/class-validator';

export class RegisterDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

export class RegisterResponseDto {
  @ApiProperty({ type: Number })
  @IsNumber()
  @IsNotEmpty()
  id: number

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  token: string;
}
