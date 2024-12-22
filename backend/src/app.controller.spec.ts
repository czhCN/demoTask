/*
 * @Author: C_Com 2632662477@qq.com
 * @Date: 2024-12-21 14:56:52
 * @LastEditors: C_Com 2632662477@qq.com
 * @LastEditTime: 2024-12-23 01:59:09
 * @FilePath: /demoTask/backend/src/app.controller.spec.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BaseDto, ScheduleDto, TodoDto } from './app.dto';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('todo', () => {
    it('should return todo list', () => {
      const result: BaseDto = {
        todoListId: 1,
        scheduleId: 1,
        todoList: [],
        scheduleTodoList: [],
      };
      jest.spyOn(appService, 'getTodos').mockImplementation(() => result);
      expect(appController.getTodos()).toBe(result);
    });

    it('should create a new todo', () => {
      const newTodo: TodoDto = {
        id: 1,
        description: 'Test todo',
        completed: false,
        hours: 2,
      };
      const result: BaseDto = {
        todoListId: 1,
        scheduleId: 1,
        todoList: [newTodo],
        scheduleTodoList: [],
      };
      jest.spyOn(appService, 'createTodo').mockImplementation(() => result);
      expect(appController.createTodo(newTodo)).toBe(result);
    });

    it('should update a todo', () => {
      const updatedTodo: TodoDto = {
        id: 1,
        description: 'Updated todo',
        completed: true,
        hours: 3,
      };
      const result: BaseDto = {
        todoListId: 1,
        scheduleId: 1,
        todoList: [updatedTodo],
        scheduleTodoList: [],
      };
      jest.spyOn(appService, 'updateTodo').mockImplementation(() => result);
      expect(appController.updateTodo(updatedTodo, '1')).toBe(result);
    });

    it('should delete a todo', () => {
      const result: BaseDto = {
        todoListId: 1,
        scheduleId: 1,
        todoList: [],
        scheduleTodoList: [],
      };
      jest.spyOn(appService, 'deleteTodo').mockImplementation(() => result);
      expect(appController.deleteTodo('1')).toBe(result);
    });
  });

  describe('schedule', () => {
    it('should return schedule data', () => {
      const result: BaseDto = {
        todoListId: 1,
        scheduleId: 1,
        todoList: [],
        scheduleTodoList: [],
      };
      jest.spyOn(appService, 'getSchedule').mockImplementation(() => result);
      expect(appController.getSchedule()).toBe(result);
    });

    it('should create a new schedule task', () => {
      const newTask: ScheduleDto = {
        id: 1,
        description: 'Test task',
        completed: false,
        hours: 2,
        date: new Date('2024-12-23'),
        order: 0,
      };
      const result: BaseDto = {
        todoListId: 1,
        scheduleId: 1,
        todoList: [],
        scheduleTodoList: [newTask],
      };
      jest.spyOn(appService, 'createSchedule').mockImplementation(() => result);
      expect(appController.createSchedule(newTask)).toBe(result);
    });

    it('should update a schedule task', () => {
      const updatedTask: ScheduleDto = {
        id: 1,
        description: 'Updated task',
        completed: true,
        hours: 3,
        date: new Date('2024-12-23'),
        order: 1,
      };
      const result: BaseDto = {
        todoListId: 1,
        scheduleId: 1,
        todoList: [],
        scheduleTodoList: [updatedTask],
      };
      jest.spyOn(appService, 'updateSchedule').mockImplementation(() => result);
      expect(appController.updateSchedule(updatedTask, '1')).toBe(result);
    });

    it('should delete a schedule task', () => {
      const result: BaseDto = {
        todoListId: 1,
        scheduleId: 1,
        todoList: [],
        scheduleTodoList: [],
      };
      jest.spyOn(appService, 'deleteSchedule').mockImplementation(() => result);
      expect(appController.deleteSchedule('1')).toBe(result);
    });
  });
});
