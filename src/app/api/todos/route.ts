// route.ts
import { writeFile, readFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";
import { DEFAULT_TODOS, DEFAULT_TODO_ID } from "@/constants/defaultTodos";

export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    console.log("1. 받은 데이터:", data);

    const filePath = path.join(process.cwd(), "public", "data", "todos.json");
    console.log("2. 파일 경로:", filePath);

    // 파일이 존재하는지 확인
    let currentData = { todos: DEFAULT_TODOS };
    try {
      const fileContent = await readFile(filePath, "utf-8");
      currentData = JSON.parse(fileContent);
      console.log("3. 현재 저장된 데이터:", currentData);
    } catch (error) {
      // 파일이 없거나 읽을 수 없는 경우 기본값 사용
      console.error("4. 파일 읽기 에러:", error);
    }

    switch (data.action) {
      case "add":
        const existingTodos = currentData.todos.filter(
          (todo: any) => todo.id !== DEFAULT_TODO_ID
        );
        currentData.todos = [...existingTodos, data.newTodo];
        break;
      case "delete":
        // 삭제 후 남은 할일 필터링
        currentData.todos = currentData.todos.filter(
          (todo: any) => todo.id !== data.id
        );
        // 모든 할일이 삭제된 경우 기본 예시 추가
        if (currentData.todos.length === 0) {
          currentData.todos = DEFAULT_TODOS;
        }
        break;
      case "reorder":
        // 실제 할일이 있는 경우에만 순서 업데이트

        if (data.updatedTodos && data.updatedTodos.length > 0) {
          currentData.todos = data.updatedTodos;
        }
        // 데이터가 비어있는 경우에만 DEFAULT_TODOS 설정
        if (!currentData.todos || currentData.todos.length === 0) {
          currentData.todos = DEFAULT_TODOS;
        }
        break;
          //상태 업데이트
      case "updateStatus":
        currentData.todos = currentData.todos.map((todo: any) =>
          todo.id === data.id ? { ...todo, status: data.newStatus } : todo
        );
        break;
    }

    // 변경된 데이터를 파일에 저장
    await writeFile(filePath, JSON.stringify(currentData, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update todos" },
      { status: 500 }
    );
  }
}
