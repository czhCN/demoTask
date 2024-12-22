/*
 * @Author: C_Com 2632662477@qq.com
 * @Date: 2024-12-21 14:56:52
 * @LastEditors: C_Com 2632662477@qq.com
 * @LastEditTime: 2024-12-22 14:45:18
 * @FilePath: /demoTask/backend/src/app.controller.ts
 */
import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { BaseDto, TodoDto } from './app.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  //Inside the code, if need to call API, please create a TodoAPI class to call the below API
  // Index Todo's GET /todos
  // Create todo: POST /todo
  // Update todo: POST /todo/:id
  // Update schedule POST /schedule

  @Get('todos')
  getTodos(): BaseDto {
    return this.appService.getTodos();
  }

  @Post('todo')
  createTodo(@Body() todo: TodoDto): BaseDto {
    return this.appService.createTodo(todo);
  }

  @Post('todo/:id')
  updateTodo(@Body() todo: TodoDto): BaseDto {
    return this.appService.updateTodo(todo);
  }

  @Post('schedule')
  createSchedule(@Body() schedule: any): string {
    return this.appService.createSchedule(schedule);
  }

  @Post('schedule/:id')
  updateScheduleById(@Body() schedule: any): string {
    return this.appService.updateScheduleById(schedule);
  }
}
