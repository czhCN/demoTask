/*
 * @Author: C_Com 2632662477@qq.com
 * @Date: 2024-12-21 14:56:52
 * @LastEditors: C_Com 2632662477@qq.com
 * @LastEditTime: 2024-12-23 02:13:48
 * @FilePath: /demoTask/backend/src/main.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE;
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 配置 CORS
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
