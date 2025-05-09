//todoContext.tsx
"use client";
import { nanoid } from "nanoid";
import { createContext, useContext, useState, useEffect } from "react";
import { ItemInterface } from "react-sortablejs";
import { DEFAULT_TODOS, DEFAULT_TODO_ID } from "@/constants/defaultTodos";
const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Todo 아이템의 타입 정의
export interface Todo extends ItemInterface {
  id: string;
  text: string; //내용용
  author: string; //작성자
  isChecked: boolean; 
  status: string;    // 'todo', 'progress', 'done'
  priority: string;  // 'low', 'medium', 'high'
  // Sortable.js에서 사용하는 선택적 필드들
  chosen?: boolean;
  selected?: boolean;
  filtered?: boolean;
}

// TodoContext에서 사용할 타입 정의
interface TodoContextType {
  todos: Todo[]; // 할일 목록을 저장할 배열
  addTodo: (text: string, status: string, priority: string) => void; // 할일을 추가하는 함수
  toggleTodo: (id: string) => void; // 할일의 체크 상태를 토글하는 함수
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
  deleteTodo: (id: string) => void;
  deleteSelected: () => void; // 선택된 항목들 삭제 함수  
  toggleStatus: (id: string) => void; // 진행도 토글
}

// TodoContext 생성 (초기값은 undefined)
const TodoContext = createContext<TodoContextType | undefined>(undefined);

// TodoProvider 컴포넌트 정의
export function TodoProvider({ children }: { children: React.ReactNode }) {
  // todos 상태와 setter 함수 정의
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    const loadTodos = async () => {
      try {
        const response = await fetch(`${baseURL}/data/todos.json`);
        const data = await response.json();
  
        if (!data.todos || data.todos.length === 0) {
          setTodos(DEFAULT_TODOS);
        } else {
          // 디폴트 항목이 아닌 실제 할일만 필터링
          const realTodos = data.todos.filter((todo: Todo) => todo.id !== DEFAULT_TODO_ID);
          
          // 실제 할일이 있는 경우에만 해당 할일들을 설정
          setTodos(realTodos.length > 0 ? realTodos : DEFAULT_TODOS);
        }
      } catch (error) {
        console.error("할일 목록을 불러오는데 실패했습니다:", error);
        setTodos(DEFAULT_TODOS);
      }
    };
  
    loadTodos();
  }, []);

  const addTodo = async (text: string, priority: string, status:string) => {
    const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");

    const newTodo: Todo = {
      id: nanoid(),
      text,
      author: userProfile.nickname || "익명", // 닉네임이 없을 경우 "익명"으로 표시
      isChecked: false,
      priority,
      status,
      timestamp: Date.now()
    };

    try {
    
      const response = await fetch(`${baseURL}/api/todos`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          action: 'add',
          newTodo 
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      // 성공적으로 API 호출이 완료된 후에 상태 업데이트
      
      setTodos(prev => {
        const newTodos = prev.length === 1 && prev[0].id === DEFAULT_TODO_ID 
          ? [newTodo] 
          : [...prev, newTodo];
        return newTodos;
      });

    } catch (error) {
      console.error('할일 추가 중 에러 발생:', error);
      // 에러 발생 시 사용자에게 알림을 표시하거나 다른 에러 처리를 수행할 수 있습니다.
    }
  };

  const toggleStatus = async (id: string) => {
    // 현재 todo 찾기
    const currentTodo = todos.find(todo => todo.id === id);
    if (!currentTodo) return;
  
    // 상태 변경 로직
    let newStatus;
    if (currentTodo.status === "todo") {
      newStatus = "Progress";
    } else if (currentTodo.status === "Progress") {
      newStatus = "Done";
    } else {
      newStatus = "todo";
    }

    // 즉시 상태 업데이트
    setTodos(prev => 
      prev.map(todo => 
        todo.id === id ? { ...todo, status: newStatus } : todo
      )
    );

    try {
      const response = await fetch(`${baseURL}/api/todos`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'updateStatus',
          id,
          newStatus
        })
      });
  
      if (!response.ok) {
        throw new Error('상태 업데이트 실패');
      }

    } catch (error) {
      console.error('상태 업데이트 중 에러 발생:', error);
      // API 호출 실패 시 원래 상태로 되돌리기
      setTodos(prev => 
        prev.map(todo => 
          todo.id === id ? { ...todo, status: currentTodo.status } : todo
        )
      );
    }
};


  const deleteTodo = async (id: string) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    // 모든 실제 할일이 삭제된 경우 디폴트 항목 추가
    if (updatedTodos.length === 0) {
      setTodos(DEFAULT_TODOS);
    } else {
      setTodos(updatedTodos);
    }

    try {
      const response = await fetch(`${baseURL}/api/todos`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "delete",
          id,
        }),
      });

      if (!response.ok) throw new Error("삭제 실패");
    } catch (error) {
      console.error("삭제 중 에러 발생:", error);
    }
  };

  const deleteSelected = () => {
    setTodos((prev) => prev.filter((todo) => !todo.isChecked));
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, isChecked: !todo.isChecked } : todo
      )
    );
  };



  // Context Provider로 자식 컴포넌트들을 감싸서 todos와 addTodo를 전달
  return (
    <TodoContext.Provider
      value={{
        todos,
        addTodo,
        toggleTodo,
        setTodos,
        deleteSelected,
        deleteTodo,
        toggleStatus,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}

// TodoContext를 사용하기 위한 커스텀 훅
export function useTodo() {
  // TodoContext의 값을 가져옴
  const context = useContext(TodoContext);
  // Provider 없이 사용되었을 경우 에러 발생
  if (context === undefined) {
    throw new Error("useTodo must be used within a TodoProvider");
  }
  return context;
}
