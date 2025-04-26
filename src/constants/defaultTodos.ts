// constants/defaultTodos.ts
import { Todo } from "@/context/TodoContext";

export const DEFAULT_TODO_ID = "DEFAULT_EXAMPLE_ITEM";

export const DEFAULT_TODOS: Todo[] = [
  {
    id: DEFAULT_TODO_ID,
    text: "예시 : 할일을 추가하면 사라집니다.",
    isChecked: false,
    chosen: false,
    selected: false,
    filtered: false,
    author: "익명"
  }
];