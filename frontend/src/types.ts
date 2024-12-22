/*
 * @Author: C_Com 2632662477@qq.com
 * @Date: 2024-12-22 13:29:23
 * @LastEditors: C_Com 2632662477@qq.com
 * @LastEditTime: 2024-12-22 21:40:15
 * @FilePath: /demoTask/frontend/src/types.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export interface TodoItem {
  id: number;
  description: string;
  hours: number;
  completed: boolean;
  date?: string; // 添加日期字段
  order?: number; // 添加顺序字段
}

export interface ScheduleDay {
  title: string;
  date: string;
  todos: TodoItem[];
  totalHours: number;
}
