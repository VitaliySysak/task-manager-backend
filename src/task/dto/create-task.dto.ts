import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, ValidateNested, IsDate } from '@nestjs/class-validator';
import { IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTaskDto {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
}

export class CreateGoogleTaskDto {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;

  @ApiProperty({ type: Date })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startEventTime?: Date;

  @ApiProperty({ type: Date })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endEventTime?: Date;
}

export class CreateGoogleTaskDataDto {
  @ApiProperty({ type: () => CreateGoogleTaskDto })
  @ValidateNested()
  @Type(() => CreateGoogleTaskDto)
  newTask: CreateGoogleTaskDto;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  googleAccessToken: string;
}
