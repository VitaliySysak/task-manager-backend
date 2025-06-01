import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from '@nestjs/class-validator';
import { IsEnum, IsOptional } from 'class-validator';
import { TaskStatus } from '@prisma/client';

export class UpdateTaskDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  title: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: TaskStatus, enumName: 'TaskStatus' })
  @IsEnum(TaskStatus, { message: 'Status must be TODO or DONE' })
  @IsOptional()
  status?: TaskStatus;
}
