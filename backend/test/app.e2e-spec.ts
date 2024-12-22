/*
 * @Author: C_Com 2632662477@qq.com
 * @Date: 2024-12-21 14:56:52
 * @LastEditors: C_Com 2632662477@qq.com
 * @LastEditTime: 2024-12-23 02:07:08
 * @FilePath: /demoTask/backend/test/app.e2e-spec.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ScheduleDto, TodoDto } from '../src/app.dto';
import * as fs from 'fs';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const dataPath = './data/data.json';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // 配置 ValidationPipe
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // 清理测试数据
    const initialData = {
      todoListId: 0,
      scheduleId: 0,
      todoList: [],
      scheduleTodoList: [],
    };

    // 确保目录存在
    const dir = './data';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2));

    await app.init();
  });

  describe('Todo', () => {
    it('/todos (GET)', () => {
      return request(app.getHttpServer())
        .get('/todos')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('todoListId');
          expect(res.body).toHaveProperty('scheduleId');
          expect(res.body).toHaveProperty('todoList');
          expect(res.body).toHaveProperty('scheduleTodoList');
        });
    });

    it('/todo (POST)', () => {
      const newTodo: Partial<TodoDto> = {
        description: 'Test todo',
        completed: false,
        hours: 2,
      };

      return request(app.getHttpServer())
        .post('/todo')
        .send(newTodo)
        .expect(201)
        .expect((res) => {
          const createdTodo = res.body.todoList[res.body.todoList.length - 1];
          expect(createdTodo).toMatchObject({
            description: newTodo.description,
            completed: newTodo.completed,
            hours: newTodo.hours,
          });
        });
    });

    it('/todo/:id (POST)', async () => {
      // 先创建一个待办事项
      const newTodo: Partial<TodoDto> = {
        description: 'Test todo',
        completed: false,
        hours: 2,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/todo')
        .send(newTodo)
        .expect(201);

      const todoId = createResponse.body.todoList[0].id;

      // 然后更新这个待办事项
      const updatedTodo: Partial<TodoDto> = {
        description: 'Updated todo',
        completed: true,
        hours: 3,
      };

      return request(app.getHttpServer())
        .post(`/todo/${todoId}`)
        .send(updatedTodo)
        .expect(200)
        .expect((res) => {
          const todo = res.body.todoList.find((t) => t.id === todoId);
          expect(todo).toBeDefined();
          expect(todo).toMatchObject(updatedTodo);
        });
    });

    it('/todo/:id (DELETE)', async () => {
      // 先创建一个待办事项
      const newTodo: Partial<TodoDto> = {
        description: 'Test todo',
        completed: false,
        hours: 2,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/todo')
        .send(newTodo)
        .expect(201);

      const todoId = createResponse.body.todoList[0].id;

      // 然后删除这个待办事项
      return request(app.getHttpServer())
        .delete(`/todo/${todoId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.todoList).not.toContainEqual(
            expect.objectContaining({ id: todoId }),
          );
        });
    });
  });

  describe('Schedule', () => {
    it('/schedule (GET)', () => {
      return request(app.getHttpServer())
        .get('/schedule')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('todoListId');
          expect(res.body).toHaveProperty('scheduleId');
          expect(res.body).toHaveProperty('todoList');
          expect(res.body).toHaveProperty('scheduleTodoList');
        });
    });

    it('/schedule (POST)', () => {
      const newTask: Partial<ScheduleDto> = {
        description: 'Test task',
        completed: false,
        hours: 2,
        date: new Date('2024-12-23'),
        order: 0,
      };

      return request(app.getHttpServer())
        .post('/schedule')
        .send(newTask)
        .expect(201)
        .expect((res) => {
          const createdTask =
            res.body.scheduleTodoList[res.body.scheduleTodoList.length - 1];
          expect(createdTask).toMatchObject({
            description: newTask.description,
            completed: newTask.completed,
            hours: newTask.hours,
            order: newTask.order,
          });
          expect(new Date(createdTask.date)).toEqual(newTask.date);
        });
    });

    it('/schedule/:id (POST)', async () => {
      // 先创建一个任务
      const newTask: Partial<ScheduleDto> = {
        description: 'Test task',
        completed: false,
        hours: 2,
        date: new Date('2024-12-23'),
        order: 0,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/schedule')
        .send(newTask)
        .expect(201);

      const taskId = createResponse.body.scheduleTodoList[0].id;

      // 然后更新这个任务
      const updatedTask: Partial<ScheduleDto> = {
        description: 'Updated task',
        completed: true,
        hours: 3,
        date: new Date('2024-12-24'),
        order: 1,
      };

      return request(app.getHttpServer())
        .post(`/schedule/${taskId}`)
        .send(updatedTask)
        .expect(200)
        .expect((res) => {
          const task = res.body.scheduleTodoList.find((t) => t.id === taskId);
          expect(task).toBeDefined();
          expect(task).toMatchObject({
            ...updatedTask,
            date: updatedTask.date.toISOString(),
          });
        });
    });

    it('/schedule/:id (DELETE)', async () => {
      // 先创建一个任务
      const newTask: Partial<ScheduleDto> = {
        description: 'Test task',
        completed: false,
        hours: 2,
        date: new Date('2024-12-23'),
        order: 0,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/schedule')
        .send(newTask)
        .expect(201);

      const taskId = createResponse.body.scheduleTodoList[0].id;

      // 然后删除这个任务
      return request(app.getHttpServer())
        .delete(`/schedule/${taskId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.scheduleTodoList).not.toContainEqual(
            expect.objectContaining({ id: taskId }),
          );
        });
    });

    it('should handle task order updates', async () => {
      // 创建两个任务
      const task1: Partial<ScheduleDto> = {
        description: 'Task 1',
        completed: false,
        hours: 2,
        date: new Date('2024-12-23'),
        order: 0,
      };

      const task2: Partial<ScheduleDto> = {
        description: 'Task 2',
        completed: false,
        hours: 3,
        date: new Date('2024-12-23'),
        order: 1,
      };

      await request(app.getHttpServer())
        .post('/schedule')
        .send(task1)
        .expect(201);

      const createResponse = await request(app.getHttpServer())
        .post('/schedule')
        .send(task2)
        .expect(201);

      const tasks = createResponse.body.scheduleTodoList;
      const task1Id = tasks[0].id;
      const task2Id = tasks[1].id;

      // 交换任务顺序
      await request(app.getHttpServer())
        .post(`/schedule/${task1Id}`)
        .send({ ...tasks[0], order: 1 })
        .expect(200);

      return request(app.getHttpServer())
        .post(`/schedule/${task2Id}`)
        .send({ ...tasks[1], order: 0 })
        .expect(200)
        .expect((res) => {
          const updatedTasks = res.body.scheduleTodoList;
          const updatedTask1 = updatedTasks.find((t) => t.id === task1Id);
          const updatedTask2 = updatedTasks.find((t) => t.id === task2Id);
          expect(updatedTask1.order).toBe(1);
          expect(updatedTask2.order).toBe(0);
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
