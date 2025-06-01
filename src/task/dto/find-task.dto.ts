import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '@prisma/client';

export class FindTasksQueryDto {
  @ApiPropertyOptional({ enum: TaskStatus, enumName: 'TaskStatus' })
  @IsEnum(TaskStatus, { message: 'Status must be either "DONE" or "TODO"' })
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  description?: string;
}
