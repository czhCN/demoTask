/*
 * @Author: C_Com 2632662477@qq.com
 * @Date: 2024-12-21 14:56:52
 * @LastEditors: C_Com 2632662477@qq.com
 * @LastEditTime: 2024-12-22 21:13:25
 * @FilePath: /demoTask/backend/src/app.controller.ts
 */
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { BaseDto, TodoDto, ScheduleDto } from './app.dto';

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
  updateTodo(@Body() todo: TodoDto, @Param('id') id: string): BaseDto {
    return this.appService.updateTodo(Number(id), todo);
  }

  @Delete('todo/:id')
  deleteTodo(@Param('id') id: string): BaseDto {
    return this.appService.deleteTodo(Number(id));
  }

  @Get('schedule')
  getSchedule(): BaseDto {
    return this.appService.getSchedule();
  }

  @Post('schedule')
  createSchedule(@Body() todo: ScheduleDto): BaseDto {
    return this.appService.createSchedule(todo);
  }

  @Post('schedule/:id')
  updateSchedule(@Body() todo: ScheduleDto, @Param('id') id: string): BaseDto {
    return this.appService.updateSchedule(Number(id), todo);
  }

  @Delete('schedule/:id')
  deleteSchedule(@Param('id') id: string): BaseDto {
    return this.appService.deleteSchedule(Number(id));
  }
}
