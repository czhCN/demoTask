/*
 * @Author: C_Com 2632662477@qq.com
 * @Date: 2024-12-22 13:39:33
 * @LastEditors: C_Com 2632662477@qq.com
 * @LastEditTime: 2024-12-22 19:59:20
 * @FilePath: /demoTask/frontend/src/components/TodoList.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useEffect, useState } from 'react';
import './TodoList.css';
import { TodoItem } from '../types';

interface BaseDto {
  todoListId: number;
  todoList: TodoItem[];
  scheduleTodoList: unknown[];
}

export const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTaskHours, setNewTaskHours] = useState(1);
  const [newTaskDesc, setNewTaskDesc] = useState("Add task");
  const [isEditing, setIsEditing] = useState(false);

  // 获取待办事项列表
  const fetchTodos = async () => {
    try {
      const response = await fetch('http://localhost:3000/todos', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      const data: BaseDto = await response.json();
      console.log('Response data:', data); // 查看完整响应
      
      if (data && Array.isArray(data.todoList)) {
        setTodos(data.todoList);
      } else {
        console.error('Invalid response format:', data);
      }
    } catch (error) {
      console.error('获取待办事项失败:', error);
    }
  };

  // 更新待办事项状态
  const handleToggleComplete = async (todo: TodoItem) => {
    try {
      const response = await fetch(`http://localhost:3000/todo/${todo.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...todo,
          completed: !todo.completed
        }),
      });
      const data: BaseDto = await response.json();
      setTodos(data.todoList);
    } catch (error) {
      console.error('更新待办事项失败:', error);
    }
  };

  // 添加新待办事项
  const handleAddTask = async () => {
    
    try {
      const response = await fetch('http://localhost:3000/todo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hours: newTaskHours,
          description: newTaskDesc,
          completed: false
        }),
      });
      const data: BaseDto = await response.json();
      setTodos(data.todoList);
      setNewTaskHours(1);
      setNewTaskDesc("Add task");
      setIsEditing(false);
    } catch (error) {
      console.error('添加待办事项失败:', error);
    }
  };

  // 更新小时数
  const handleUpdateHours = async (todo: TodoItem, change: number) => {
    try {
      const newHours = todo.hours + change;
      if (newHours >= 1 && newHours <= 8) {
        const response = await fetch(`http://localhost:3000/todo/${todo.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...todo,
            hours: newHours
          }),
        });
        const data: BaseDto = await response.json();
        setTodos(data.todoList);
      }
    } catch (error) {
      console.error('更新小时数失败:', error);
    }
  };

  // 添新的处理函数
  const handleNewTaskHours = (change: number) => {
    const newHours = newTaskHours + change;
    if (newHours >= 1 && newHours <= 8) {
      setNewTaskHours(newHours);
    }
  };

  // 处理描述的点击事件
  const handleDescClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  // 处理描述的变化
  const handleDescChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTaskDesc(e.target.value);
  };

  // 处理按键事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setNewTaskDesc("Add task");
    }
  };

  // 添加删除任务的处理函数
  const handleDeleteTodo = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3000/todo/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data: BaseDto = await response.json();
      setTodos(data.todoList);
    } catch (error) {
      console.error('删除待办事项失败:', error);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div className="todo-container">
      <nav className="nav-tabs">
        <div className="tab active">To-do</div>
        <div className="tab">Schedule</div>
      </nav>
      
      <h1>To-do list</h1>
      
      <div className="todos">
        {todos.map(todo => (
          <div key={todo.id} className="todo-item">
            <div className="todo-left">
              <div 
                className={`checkbox ${todo.completed ? 'checked' : ''}`}
                onClick={() => handleToggleComplete(todo)}
              >
                {todo.completed && <span>✓</span>}
              </div>
              <span className="description">{todo.description}</span>
            </div>
            <div className="todo-right">
              <button 
                className="hour-btn"
                onClick={() => handleUpdateHours(todo, -1)}
              >-</button>
              <span className="hours">{todo.hours}</span>
              <button 
                className="hour-btn"
                onClick={() => handleUpdateHours(todo, 1)}
              >+</button>
              <button 
                className="more-btn"
                onClick={() => handleDeleteTodo(todo.id)}
              >›</button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="total">
        <div className="line"></div>
        <div className="total-hours">{todos.reduce((sum, todo) => sum + todo.hours, 1)}</div>
      </div>

      <div className="todo-item add-task">
        <div className="todo-left">
          <div 
            className="checkbox add" 
            onClick={handleAddTask}
          >
            <span>+</span>
          </div>
          {isEditing ? (
            <input
              type="text"
              className="description-input"
              value={newTaskDesc}
              onChange={handleDescChange}
              onKeyDown={handleKeyPress}
              onBlur={() => {
                if (newTaskDesc.trim() === "") {
                  setNewTaskDesc("Add task");
                }
                setIsEditing(false);
              }}
              autoFocus
            />
          ) : (
            <span 
              className="description"
              onDoubleClick={handleDescClick}
            >
              {newTaskDesc}
            </span>
          )}
        </div>
        <div className="todo-right">
          <button 
            className="hour-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleNewTaskHours(-1);
            }}
          >-</button>
          <span className="hours">{newTaskHours}</span>
          <button 
            className="hour-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleNewTaskHours(1);
            }}
          >+</button>
        </div>
      </div>
    </div>
  );
};
