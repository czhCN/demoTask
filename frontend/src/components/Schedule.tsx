/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { TodoItem } from '../types';
import './Schedule.css';

interface ScheduleDay {
  title: string;
  date: string;
  todos: TodoItem[];
  totalHours: number;
}

interface BaseDto {
  todoListId: number;
  scheduleId: number;
  todoList: TodoItem[];
  scheduleTodoList: TodoItem[];
}

export const Schedule: React.FC = () => {
  const [days, setDays] = useState<ScheduleDay[]>([]);
  const [editingTask, setEditingTask] = useState<{id: number, value: string} | null>(null);
  const [newTaskDesc, setNewTaskDesc] = useState("Add task");
  const [newTaskHours, setNewTaskHours] = useState(1);
  const [isEditing, setIsEditing] = useState(false);

  // 格式化显示日期
  const formatDate = (date: Date): string => {
    const day = date.getDate();
    const suffix = ['th', 'st', 'nd', 'rd'][day % 10] || 'th';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).replace(/(\d+)/, `$1${suffix}`);
  };

  // 格式化日期为 YYYY-MM-DD 格式
  const formatDateForApi = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // 获取日程数据
  const fetchSchedule = async () => {
    try {
      const response = await fetch('http://localhost:3000/schedule', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data: BaseDto = await response.json();
      
      // 从数据中获取所有不重复的日期
      const uniqueDates = Array.from(new Set(
        (data.scheduleTodoList || [])
          .map(todo => todo.date)
          .filter((date): date is string => date !== undefined)
      )).sort();

      // 如果没有数据，至少显示今天和明天
      if (uniqueDates.length === 0) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        uniqueDates.push(formatDateForApi(today), formatDateForApi(tomorrow));
      }

      // 生成日期标题
      const newDays: ScheduleDay[] = uniqueDates.map(date => {
        const dateObj = new Date(date);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        let title;
        if (formatDateForApi(today) === date) {
          title = 'Today';
        } else if (formatDateForApi(tomorrow) === date) {
          title = 'Tomorrow';
        } else {
          title = formatDate(dateObj);
        }

        return {
          title,
          date,
          todos: [],
          totalHours: 0
        };
      });

      setDays(newDays);
      updateDaysWithTodos(data.scheduleTodoList || []);
    } catch (error) {
      console.error('获取日程失败:', error);
    }
  };

  // 初始化日期数据
  useEffect(() => {
    fetchSchedule();
  }, []);

  // 更新任务描述
  const handleUpdateTask = async (todoId: number, newDescription: string) => {
    try {
      const response = await fetch(`http://localhost:3000/schedule/${todoId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: newDescription }),
      });
      const data: BaseDto = await response.json();
      updateDaysWithTodos(data.scheduleTodoList);
      setEditingTask(null);
    } catch (error) {
      console.error('更新任务失败:', error);
    }
  };

  // 更新天数据
  const updateDaysWithTodos = (todos: TodoItem[]) => {
    setDays(prevDays => prevDays.map(day => {
      const dayTodos = todos.filter(todo => todo.date === day.date);
      // 按 order 排序，如果 order 相同则保持原顺序
      const sortedTodos = dayTodos.sort((a, b) => {
        const orderA = (a as any).order ?? 0;
        const orderB = (b as any).order ?? 0;
        if (orderA === orderB) {
          return dayTodos.indexOf(a) - dayTodos.indexOf(b);
        }
        return orderA - orderB;
      });

      return {
        ...day,
        todos: sortedTodos,
        totalHours: sortedTodos.reduce((sum, todo) => sum + todo.hours, 0)
      };
    }));
  };

  // 处理拖拽结束
  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const sourceDay = days.find(day => day.date === result.source.droppableId);
    const destDay = days.find(day => day.date === result.destination.droppableId);
    
    if (!sourceDay || !destDay) return;

    // 如果是在同一天内拖拽，只需要更新顺序
    if (sourceDay.date === destDay.date) {
      const newTodos = Array.from(sourceDay.todos);
      const [removed] = newTodos.splice(result.source.index, 1);
      newTodos.splice(result.destination.index, 0, removed);

      // 计算新的 order 值
      const targetOrder = result.destination.index;
      const updatedTodos = newTodos.map((todo, index) => ({
        ...todo,
        order: index >= targetOrder ? index + 1 : index
      }));

      try {
        // 更新所有受影响的任务的顺序
        const updates = updatedTodos.map(todo => 
          fetch(`http://localhost:3000/schedule/${todo.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...todo,
              order: todo.order
            }),
          })
        );
        
        // 等待所有更新完成
        const responses = await Promise.all(updates);
        const lastResponse = await responses[responses.length - 1].json();
        updateDaysWithTodos(lastResponse.scheduleTodoList);
      } catch (error) {
        console.error('更新任务顺序失败:', error);
        await fetchSchedule();
      }
      return;
    }

    // 跨天拖拽的逻辑
    const taskToMove = {...sourceDay.todos[result.source.index]};
    const newDestTotalHours = destDay.totalHours + taskToMove.hours;

    if (newDestTotalHours > 8) {
      return;
    }

    // 计算目标日期的新 order
    const targetOrder = result.destination.index;
    const destTodos = [...destDay.todos];
    destTodos.forEach(todo => {
      if ((todo as any).order >= targetOrder) {
        (todo as any).order += 1;
      }
    });

    try {
      // 更新移动的任务
      const response = await fetch(`http://localhost:3000/schedule/${taskToMove.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskToMove,
          date: destDay.date,
          order: targetOrder
        }),
      });
      
      const data = await response.json();
      updateDaysWithTodos(data.scheduleTodoList);
    } catch (error) {
      console.error('移动任务失败:', error);
      await fetchSchedule();
    }
  };

  // 更新完成状态
  const handleToggleComplete = async (todo: TodoItem) => {
    try {
      const response = await fetch(`http://localhost:3000/schedule/${todo.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...todo,
          completed: !todo.completed
        }),
      });
      const data: BaseDto = await response.json();
      updateDaysWithTodos(data.scheduleTodoList);
    } catch (error) {
      console.error('更新任务状态失败:', error);
    }
  };

  // 更新小时数
  const handleUpdateHours = async (todo: TodoItem, change: number) => {
    const newHours = todo.hours + change;
    if (newHours < 1 || newHours > 8) return;

    const dayTodos = days.find(day => day.date === todo.date)?.todos || [];
    const dayTotal = dayTodos.reduce((sum, t) => sum + (t.id === todo.id ? newHours : t.hours), 0);
    if (dayTotal > 8) return;

    try {
      const response = await fetch(`http://localhost:3000/schedule/${todo.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...todo,
          hours: newHours
        }),
      });
      const data: BaseDto = await response.json();
      updateDaysWithTodos(data.scheduleTodoList);
    } catch (error) {
      console.error('更新小时数失败:', error);
    }
  };

  // 处理新任务小时数
  const handleNewTaskHours = (change: number) => {
    const newHours = newTaskHours + change;
    if (newHours >= 1 && newHours <= 8) {
      setNewTaskHours(newHours);
    }
  };

  // 处理添加任务
  const handleAddTask = async (date: string) => {
    const dayTodos = days.find(day => day.date === date)?.todos || [];
    const dayTotal = dayTodos.reduce((sum, todo) => sum + todo.hours, 0);
    if (dayTotal + newTaskHours > 8) return;

    try {
      const response = await fetch('http://localhost:3000/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: newTaskDesc,
          hours: newTaskHours,
          completed: false,
          date: date,
          order: dayTodos.length
        }),
      });
      const data: BaseDto = await response.json();
      updateDaysWithTodos(data.scheduleTodoList);
      setNewTaskDesc("Add task");
      setNewTaskHours(1);
      setIsEditing(false);
    } catch (error) {
      console.error('添加任务失败:', error);
    }
  };

  // 处理删除任务
  const handleDeleteTask = async (todoId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/schedule/${todoId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      const data: BaseDto = await response.json();
      updateDaysWithTodos(data.scheduleTodoList);
    } catch (error) {
      console.error('删除任务失败:', error);
    }
  };

  return (
    <div className="schedule-content">
      <h1>Schedule</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        {days.map((day, index) => (
          <div key={day.date} className="schedule-day">
            <h2>{day.title}</h2>
            <Droppable droppableId={day.date}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="schedule-tasks"
                >
                  {day.todos.map((todo, index) => (
                    <Draggable
                      key={todo.id}
                      draggableId={String(todo.id)}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="schedule-task"
                        >
                          <div className="task-left">
                            <div 
                              className={`checkbox ${todo.completed ? 'checked' : ''}`}
                              onClick={() => handleToggleComplete(todo)}
                            >
                              {todo.completed && <span>✓</span>}
                            </div>
                            {editingTask?.id === todo.id ? (
                              <input
                                value={editingTask.value}
                                onChange={(e) => setEditingTask({...editingTask, value: e.target.value})}
                                onBlur={() => handleUpdateTask(todo.id, editingTask.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleUpdateTask(todo.id, editingTask.value);
                                  }
                                }}
                                autoFocus
                              />
                            ) : (
                              <span onDoubleClick={() => setEditingTask({id: todo.id, value: todo.description})}>
                                {todo.description}
                              </span>
                            )}
                          </div>
                          <div className="task-right">
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
                              onClick={() => handleDeleteTask(todo.id)}
                            >›</button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            <div className="day-total">Total: {day.totalHours}h</div>
            {index === days.length - 1 && (
              <div className="schedule-task add-task">
                <div className="task-left">
                  <div 
                    className="checkbox add"
                    onClick={() => handleAddTask(day.date)}
                  >
                    <span>+</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={newTaskDesc}
                      onChange={(e) => setNewTaskDesc(e.target.value)}
                      onBlur={() => {
                        if (newTaskDesc.trim() === "") {
                          setNewTaskDesc("Add task");
                        }
                        setIsEditing(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddTask(day.date);
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="description"
                      onDoubleClick={() => setIsEditing(true)}
                    >
                      {newTaskDesc}
                    </span>
                  )}
                </div>
                <div className="task-right">
                  <button 
                    className="hour-btn"
                    onClick={() => handleNewTaskHours(-1)}
                  >-</button>
                  <span className="hours">{newTaskHours}</span>
                  <button 
                    className="hour-btn"
                    onClick={() => handleNewTaskHours(1)}
                  >+</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </DragDropContext>
    </div>
  );
};