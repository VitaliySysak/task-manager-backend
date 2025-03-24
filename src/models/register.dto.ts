import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, IsEmail } from '@nestjs/class-validator';

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
  @MinLength(6)
  password: string;
}
