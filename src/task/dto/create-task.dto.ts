import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from '@nestjs/class-validator';
import { IsBoolean, IsOptional } from 'class-validator';

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
