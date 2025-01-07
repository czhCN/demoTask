/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { BaseDto, ScheduleDto, TodoDto } from './app.dto';
import * as fs from 'fs';
@Injectable()
export class AppService implements OnModuleInit {
  private todoList: BaseDto;
  private readonly dataPathInit = './data/dataInit.json';
  private readonly dataPath = './data/data.json';

  constructor() {}

  onModuleInit() {
    // 读取/data/data.json文件
    try {
      const data = fs.readFileSync(this.dataPathInit, 'utf8');
      this.todoList = JSON.parse(data);
      this.saveData();

      console.log('数据加载成功:', this.todoList);
    } catch (error) {
      console.error('读取数据文件失败:', error);
      // 初始化默认数据
      this.todoList = {
        todoListId: 0,
        scheduleId: 0,
        todoList: [],
        scheduleTodoList: [],
      };
      // 创建数据文件
      this.saveData();
    }
  }

  private saveData() {
    try {
      // 确保目录存在
      const dir = './data';
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      // 保存数据
      fs.writeFileSync(this.dataPath, JSON.stringify(this.todoList, null, 2));
      console.log('数据保存成功');
    } catch (error) {
      console.error('保存数据失败:', error);
    }
  }

  getTodos(): BaseDto {
    return this.todoList;
  }

  createTodo(todo: TodoDto): BaseDto {
    this.todoList.todoListId++;
    todo.id = this.todoList.todoListId;
    this.todoList.todoList.push(todo);
    this.saveData();
    return this.todoList;
  }

  updateTodo(id: number, todo: TodoDto): BaseDto {
    this.todoList.todoList = this.todoList.todoList.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          hours: todo.hours ?? item.hours,
          description: todo.description ?? item.description,
          completed: todo.completed ?? item.completed,
        };
      }
      return item;
    });
    this.saveData();
    return this.todoList;
  }

  deleteTodo(id: number): BaseDto {
    this.todoList.todoList = this.todoList.todoList.filter(
      (item) => item.id !== id,
    );
    this.saveData();
    return this.todoList;
  }

  handleSchedule() {
    const list = this.todoList.scheduleTodoList;
    const timeList = this.todoList.scheduleTodoList.map((item) => item.date);

    for (const date of timeList) {
      let h = 0;
      for (const item of list) {
        if (new Date(item.date).getTime() >= new Date(date).getTime()) {
          const b = h + item.hours;
          if (b <= 8) {
            h = b;
            item.date = date;
          }
        }
      }
    }

    this.todoList.scheduleTodoList = this.todoList.scheduleTodoList.sort(
      (a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      },
    );

    // if (list[0].date > list[2].date) {
    //   console.log('test');
    // } else {
    //   console.log('test2');
    // }

    // for (let index = 0; index < list.length - 1; index++) {
    //   let b = index;
    //   for (let j = index + 1; j < list.length; j++) {
    //     if (list[j].date < list[b].date) {
    //       b = j;
    //     }
    //   }
    // }
  }

  getSchedule(): BaseDto {
    this.handleSchedule();
    return this.todoList;
  }

  createSchedule(schedule: ScheduleDto): BaseDto {
    this.todoList.scheduleId++;
    schedule.id = this.todoList.scheduleId;
    this.todoList.scheduleTodoList.push(schedule);
    this.handleSchedule();
    this.saveData();
    return this.todoList;
  }

  updateSchedule(id: number, schedule: ScheduleDto): BaseDto {
    this.todoList.scheduleTodoList = this.todoList.scheduleTodoList.map(
      (item) => {
        if (item.id === id) {
          return {
            ...item,
            order: schedule.order ?? item.order,
            date: schedule.date ?? item.date,
            hours: schedule.hours ?? item.hours,
            description: schedule.description ?? item.description,
            completed: schedule.completed ?? item.completed,
          };
        }
        return item;
      },
    );
    this.handleSchedule();

    this.saveData();
    return this.todoList;
  }

  deleteSchedule(id: number): BaseDto {
    this.todoList.scheduleTodoList = this.todoList.scheduleTodoList.filter(
      (item) => item.id !== id,
    );
    this.saveData();
    return this.todoList;
  }
}
