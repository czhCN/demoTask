/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { BaseDto, ScheduleDto, TodoDto } from './app.dto';
import * as fs from 'fs';
@Injectable()
export class AppService implements OnModuleInit {
  private todoList: BaseDto;

  constructor() {}

  onModuleInit() {
    // 读取/data/data.json文件
    const data = fs.readFileSync('./data/data.json', 'utf8');
    this.todoList = JSON.parse(data);
    console.log(data);
  }

  getTodos(): BaseDto {
    return this.todoList;
  }

  createTodo(todo: TodoDto): BaseDto {
    this.todoList.todoListId++;
    todo.id = this.todoList.todoListId;
    this.todoList.todoList.push(todo);
    return this.todoList;
  }

  updateTodo(id: number, todo: TodoDto): BaseDto {
    console.log(todo);
    console.log('--------');

    this.todoList.todoList.forEach((item) => {
      if (item.id === id) {
        item.hours = todo.hours;
        item.description = item.description;
        item.completed = todo.completed;
        console.log(item);
      }
    });
    return this.todoList;
  }

  deleteTodo(id: number): BaseDto {
    this.todoList.todoList = this.todoList.todoList.filter(
      (item) => item.id !== id,
    );
    console.log(this.todoList);

    return this.todoList;
  }

  getSchedule(): BaseDto {
    return this.todoList;
  }

  createSchedule(schedule: ScheduleDto): BaseDto {
    this.todoList.scheduleId++;
    schedule.id = this.todoList.scheduleId;
    this.todoList.scheduleTodoList.push(schedule);
    return this.todoList;
  }

  updateSchedule(id: number, schedule: ScheduleDto): BaseDto {
    console.log('-------');

    this.todoList.scheduleTodoList.forEach((item) => {
      if (item.id === id) {
        item.order = schedule.order ?? item.order;
        item.date = schedule.date ?? item.date;
        item.hours = schedule.hours ?? item.hours;
        item.description = schedule.description ?? item.description;
        item.completed = schedule.completed ?? item.completed;
        console.log(item);
      }
    });
    return this.todoList;
  }

  deleteSchedule(id: number): BaseDto {
    this.todoList.scheduleTodoList = this.todoList.scheduleTodoList.filter(
      (item) => item.id !== id,
    );
    return this.todoList;
  }
}
