//todoContext.tsx
'use client' // Next.js에서 클라이언트 컴포넌트임을 명시
import { nanoid } from 'nanoid';
import { createContext, useContext, useState } from 'react';
import { ItemInterface } from "react-sortablejs";

// Todo 아이템의 타입 정의
export interface Todo extends ItemInterface {
    id: string;
    text: string; 
    isChecked: boolean;
    // Sortable.js에서 사용하는 선택적 필드들
    chosen?: boolean;
    selected?: boolean;
    filtered?: boolean;
}

// TodoContext에서 사용할 타입 정의
interface TodoContextType {
    todos: Todo[]; // 할일 목록을 저장할 배열
    addTodo: (text: string) => void; // 할일을 추가하는 함수
    toggleTodo: (id: string) => void; // 할일의 체크 상태를 토글하는 함수
    setTodos: React.Dispatch<React.SetStateAction<Todo[]>>; // 추가된 부분
}

// TodoContext 생성 (초기값은 undefined)
const TodoContext = createContext<TodoContextType | undefined>(undefined);

// TodoProvider 컴포넌트 정의
export function TodoProvider({ children }: { children: React.ReactNode }) {
    // todos 상태와 setter 함수 정의
    const [todos, setTodos] = useState<Todo[]>([
        { id: '1', text: '할일', isChecked: false },
        { id: '2', text: '할일2', isChecked: false },
        { id: '3', text: '할일3', isChecked: false },
    ]);

    // 새로운 할일을 추가하는 함수
    const addTodo = (text: string) => {
        setTodos(prev => [...prev, {
            id: nanoid(), // nanoid를 사용하여 고유한 ID 생성
            text,
            isChecked: false
        }]);
    };

    const toggleTodo = (id: string) => {
        setTodos(prev => prev.map(todo => 
            todo.id === id ? { ...todo, isChecked: !todo.isChecked } : todo
        ));
    };

    // Context Provider로 자식 컴포넌트들을 감싸서 todos와 addTodo를 전달
    return (
        <TodoContext.Provider value={{ todos, addTodo, toggleTodo, setTodos }}>
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
        throw new Error('useTodo must be used within a TodoProvider');
    }
    return context;
}