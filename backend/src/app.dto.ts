/*
 * @Author: C_Com 2632662477@qq.com
 * @Date: 2024-12-22 01:00:43
 * @LastEditors: C_Com 2632662477@qq.com
 * @LastEditTime: 2024-12-23 02:13:38
 * @FilePath: /demoTask/backend/src/app.DTO.ts
 */

import {
  IsBoolean,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class BaseDto {
  todoListId: number;
  scheduleId: number;
  todoList: Array<TodoDto>;
  scheduleTodoList: Array<ScheduleDto>;
}

export class TodoDto {
  @IsOptional()
  @IsInt()
  id: number; // 添加id字段

  @IsInt()
  @Max(8)
  @Min(1)
  hours: number;

  @IsString()
  description: string;

  @IsBoolean()
  completed: boolean; // true: 完成，false: 未完成
}

export class ScheduleDto {
  @IsOptional()
  @IsInt()
  id: number; // 添加id字段

  @IsInt()
  @Max(8)
  @Min(1)
  hours: number;

  @IsString()
  description: string;

  @IsBoolean()
  completed: boolean; // true: 完成，false: 未完成

  @IsDate()
  date: Date;

  @IsOptional()
  @IsInt()
  order: number;
}
