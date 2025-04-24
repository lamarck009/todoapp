//homepage.tsx
"use client";
import styled from "@emotion/styled";
import { colors } from "@/styles/theme"; // colors.ts에서 colors 가져오기
import { createGlobalStyle } from "styled-components"; // createGlobalStyle 가져오기
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation"; // useRouter 훅 가져오기
import { useTodo } from "@/context/TodoContext"; // TodoContext에서 useTodo 훅 가져오기
import { ReactSortable, Sortable, Store } from "react-sortablejs";
import { Todo } from "@/context/TodoContext"; // Todo 타입 가져오기
import { ItemInterface } from "react-sortablejs";
import { DEFAULT_TODOS, DEFAULT_TODO_ID } from "@/constants/defaultTodos";
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';



const Homepage: React.FC = () => {
  // TodoContext에서 필요한 상태와 함수들을 가져옴
  const { todos, toggleTodo, setTodos, deleteTodo } = useTodo();
  // 페이지 라우팅을 위한 router 객체
  const router = useRouter();
  // 체크된 항목이 있는지 여부를 추적하는 상태
  const [hasCheckedItems, setHasCheckedItems] = useState(false);
  const isInitialMount = useRef(true);  // 초기화 플래그 생성


// 컴포넌트 마운트 시 todos 로드

  // 할일 항목 토글(체크/체크해제) 처리 함수
  const handleToggle = (e: React.MouseEvent, id: string) => {
    // 클릭된 요소가 체크박스이거나 리스트 아이템일 때만 토글
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target === e.currentTarget) {
      e.stopPropagation(); // 이벤트 버블링 방지
      const currentTodo = todos.find((t) => t.id === id);
      const newCheckedState = !currentTodo?.isChecked;
      toggleTodo(id);
      const otherCheckedExists = todos.some(
        (todo) => todo.id !== id && todo.isChecked
      );
      setHasCheckedItems(newCheckedState || otherCheckedExists);
    }
  };

  // 새 할일 작성 페이지로 이동하는 함수
  const handleWriteClick = () => {
    router.push("/write");
  };

  // 수정 페이지로 이동하는 함수
  const handleEditClick = (e: React.MouseEvent) => {
    const listItem = e.currentTarget.closest("li");
    const dataId = listItem?.getAttribute("data-id");
    router.push(`/edit/${dataId}`);
  };

  //삭제
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    const listItem = e.currentTarget.closest("li");
    const dataId = listItem?.getAttribute("data-id");
    
    if (dataId) {
      try {
        await deleteTodo(dataId); // context의 deleteTodo 함수 호출
      } catch (error) {
        console.error('삭제 실패:', error);
      }
    }
  };

  const handleSetList = async (newState: ItemInterface[]) => {
    const updatedTodos = newState.map((item) => {
      const existingTodo = todos.find((todo) => todo.id === item.id);

      return {
        id: item.id,
        text: (item as Todo).text,
        isChecked: existingTodo ? existingTodo.isChecked : false,
        chosen: false,
        selected: false,
        filtered: false,
      } as Todo;
    });
  
    setTodos(updatedTodos);
  
    // JSON 파일 업데이트
    try {

      const response = await fetch(`${API_URL}/api/todos`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reorder',
          updatedTodos: updatedTodos
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update todos order');
      }
    } catch (error) {
      console.error("7. 에러 발생:", error);
      setTodos(todos); // 에러 발생 시 원래 순서로 되돌리기
    }
  };
  
  // 저장된 todos를 로드하는 함수 수정
  const loadSavedTodos = async () => {
    try {
      const response = await fetch(`${API_URL}/data/todos.json`);
      if (!response.ok) {
        setTodos(DEFAULT_TODOS);
        return;
      }
      const data = await response.json();
      
    // 데이터가 있고 실제 할일이 있는 경우에만 해당 데이터 사용
    if (data.todos && data.todos.length > 0) {
      const realTodos = data.todos.filter((todo: Todo) => todo.id !== DEFAULT_TODO_ID);
      if (realTodos.length > 0) {
        setTodos(realTodos);
        return;
      }
      else
      setTodos(DEFAULT_TODOS);
    }
    
    // 실제 할일이 없는 경우에만 DEFAULT_TODOS 사용
    
    } catch (error) {
      console.error('Failed to load saved todos:', error);
      setTodos(DEFAULT_TODOS);
    }
  };
  
  // useEffect 수정
  useEffect(() => {
    loadSavedTodos();
  }, []);
  


  return (
    <Maincontainer>
      {/* 전역 스타일 적용 */}
      <GlobalStyle />
      <AppContainer>
        {/* 헤더 영역 */}
        <Headers>
          <Title>Todo 앱 : 일정관리</Title>
        </Headers>

        {/* 버튼 컨테이너 영역 */}
        <HeaderButtonContainer>
          {/* 섹션 버튼 영역 */}
          <SectionButtonContainer>
            <SectionButton>전체</SectionButton>
            <SectionButton>완료</SectionButton>
          </SectionButtonContainer>

          {/* 메뉴 버튼 영역 */}
          <MenuButtonContainer>
            <AddButton onClick={handleWriteClick} />
          </MenuButtonContainer>
        </HeaderButtonContainer>

        {/* 할일 목록 영역 */}
        <List>
          {/* ReactSortable로 드래그 앤 드롭 기능 구현 */}
          <StyledSortable
            list={todos}
            setList={(newState) => {
              if (isInitialMount.current) {  // 최초 마운트인 경우
                isInitialMount.current = false;  // 플래그를 false로 변경
                return;  // 함수 실행 중단  
                }
                // 이후의 호출에서만 실제 로직 실행
                handleSetList(newState);
              }}
            animation={150}
            ghostClass="sortable-ghost"
            dragClass="sortable-drag"
            handle=".drag-handle"
            forceFallback={false}
          >
            {todos.map((todo) => (
              <ListItem
                key={todo.id}
                data-id={todo.id}
                className="drag-handle" // 전체 ListItem을 드래그 핸들로 설정
              >
                <CheckBox
                  type="checkbox"
                  checked={todo.isChecked}
                  onChange={() => {}}
                  onClick={(e) => handleToggle(e, todo.id)} // 체크박스 클릭 시 이벤트 전파 방지
                />
                <ListItemText>{todo.text}</ListItemText>
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    gap: "5px",
                    alignItems: "center",
                  }}
                >
                  <CalendarButton></CalendarButton>
                  <EditButton onClick={(e) => handleEditClick(e)}></EditButton>
                  <DeleteButton onClick={(e) => handleDelete(e)}></DeleteButton>
                </div>
              </ListItem>
            ))}
          </StyledSortable>
        </List>
        {/* 리스트 하단 장식선 */}
        <ListUnderline />
      </AppContainer>
    </Maincontainer>
  );
};

const GlobalStyle = createGlobalStyle`
 .sortable-ghost {
    opacity: 0.5;  // 원래 위치에 남는 고스트 이미지는 완전히 불투명하게
    background-color: #f0f0f0; // 고스트 이미지 배경색
    border: 2px dashed #ccc; // 고스트 이미지 테두리
  }

  .sortable-drag {
  opacity: 1;
    border: 2px dashed blue;
  }



`;
const StyledSortable = styled(ReactSortable)<{ list: Todo[] }>`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Maincontainer = styled.div`
  display: flex;
  padding: 20px;
  width: 100%;
  height: 100vh;
  justify-content: center;
  align-items: center;
  z-index: 0;
`;

const AppContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  max-width: 500px;
  max-height: 600px;
  height: 600px;
  overflow: hidden;
`;

const Title = styled.h1`
  font-size: 2em;
  text-align: center;
  color: white;
  text-shadow: 1px 1px 2px #000;
`;
const Headers = styled.header`
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  background-color: ${colors.head};
  color: white;
  width: 100%;
  height: 70px;
  border-radius: 25px 25px 0 0;
  direction: column;
`;
const SCROLLBAR_WIDTH = 8; // 스크롤바 너비
const PADDING = 20; // 기본 패딩값

const List = styled.ul<{ isDraggingOver?: boolean }>`
  list-style-type: none;
  padding: ${PADDING}px;
  padding-left: ${PADDING + SCROLLBAR_WIDTH}px;
  padding-bottom: 0px;
  width: 100%;
  max-height: 100%;
  max-width: 500px;
  flex: 1;
  background-color: ${colors.list};
  z-index: 2;
  overflow-y: auto; // 스크롤바 표시
  scrollbar-gutter: stable;


  // 선택적: 스크롤바 스타일링
// 선택적: 스크롤바 스타일링
  &::-webkit-scrollbar {
    width: ${SCROLLBAR_WIDTH}px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }

  }
`;
const ListUnderline = styled.div`
  user-select: none;
  width: 100%;
  height: 30px;
  border-radius: 0 0 25px 25px;
  background-color: ${colors.list};
`;

const ListItem = styled.li`
  padding: 10px;
  background-color: white;
  margin-top: 5px;
  border-radius: 5px;
  height: 3rem;
  border: 2px solid transparent;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  cursor: pointer;

  user-select: none;
  &:hover {
    cursor: pointer;
    border: 2px solid ${colors.checked};
  }
`;
const CheckBox = styled.input`
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  width: 24px;
  height: 24px;
  border: 2px solid #666666;
  border-radius: 3px;
  position: relative;
  cursor: pointer;

  &:checked {
    background-color: white;
  }

  &:checked::after {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: red;
    mask-image: url("asset/check.svg"); /* SVG 파일을 마스크로 사용 */
    mask-size: contain; /* 마스크 크기 조절 */
    mask-repeat: no-repeat; /* 마스크 반복 없음 */
    mask-position: center; /* 마스크 위치 */
    top: -25%;
    left: 10%;
    animation: checkAfter 0.1s ease forwards;
  }

  @keyframes checkAfter {
    0% {
      transform: scale(0);
    }
    100% {
      transform: scale(1.7);
    }
  }
`;

const ListItemText = styled.span`
  font-size: 1.2em;
  margin-right: 10px;
  color: #555;
`;

const HeaderButtonContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  width: 100%;
  height: fit-content;
  position: relative;
  max-width: 600px;
  height: 50px;
  padding: 10px 20px;

  background-color: ${colors.head2};
  gap: 10px;
  align-items: center;
`;

const SectionButtonContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  width: 100%;
  height: fit-content;
  position: relative;
  flex: 1;
  height: 50px;
  padding: 10px;
  background-color: ${colors.head2};
  gap: 10px;
  border-bottom: 3px solid transparent; // 먼저 투명한 border 설정
  border-image: ${colors.hr}; // gradient 적용
  border-image-slice: 1; // 필수! gradient가 제대로 보이게 함
  background-color: #white;
`;

const SectionButton = styled.button`
  background-color: rgb(255, 255, 255);
  color: black;
  border: none;
  height: 100%;
  display: flex;
  align-items: center;
  font-size: 1.2em;
  padding: 15px 5px;
  border-radius: 5px;
  border: 2px solid #666666;
  cursor: pointer;
`;

const MenuButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  height: fit-content;
  position: relative;
  flex: 1;
  height: 50px;
  padding: 10px;
  background-color: ${colors.head2};
  gap: 10px;
  border-bottom: 3px solid transparent; // 먼저 투명한 border 설정
  border-image: ${colors.hr}; // gradient 적용
  border-image-slice: 1; // 필수! gradient가 제대로 보이게 함
  background-color: #white;
`;

const AddButton = styled.button`
  background-color: ${colors.icon};
  mask-image: url("asset/plus.svg"); /* SVG 파일을 마스크로 사용 */
  mask-size: contain; /* 마스크 크기 조절 */
  mask-repeat: no-repeat; /* 마스크 반복 없음 */
  mask-position: center; /* 마스크 위치 */
  border: none; // 버튼 테두리 제거
  height: 24px;
  width: 24px;
  padding: 5px;
  cursor: pointer;

  &:hover {
    transform: scale(1.2); // hover 시 크기 증가
    transition: transform 0.1s ease; // 부드러운 애니메이션 효과
  }
`;

const EditButton = styled.button`
  background-color: ${colors.icon};
  height: 100%;
  cursor: pointer;
  mask-image: url("asset/edit.svg");
  mask-size: contain;
  mask-repeat: no-repeat; /* 마스크 반복 없음 */
  mask-position: center; /* 마스크 위치 */
  border: none; // 버튼 테두리 제거
  aspect-ratio: 1; // 정사각형 비율 유지
  transform: scale(1.3);

  &:hover {
    filter: brightness(1.2); // 밝기 조절
    mask-image: url("asset/edit2.svg");
  }
`;

const DeleteButton = styled.button`
  background-color: ${colors.icon};
  color: white;
  height: 100%;
  cursor: pointer;
  mask-image: url("asset/close-trashcan.svg");
  mask-size: contain;
  mask-repeat: no-repeat; /* 마스크 반복 없음 */
  mask-position: center; /* 마스크 위치 */
  border: none; // 버튼 테두리 제거
  aspect-ratio: 1; // 정사각형 비율 유지
  transform: scale(1.3);

  &:hover {
    filter: brightness(1.2); // 밝기 조절
    mask-image: url("asset/open-trashcan.svg");
  }
`;
const CalendarButton = styled.button`
    background-color:${colors.icon};  
    color: white;
  height: 100%;
  cursor: pointer;
  mask-image: url("asset/calendar.svg"); 
  mask-size: contain;
  mask-repeat: no-repeat; /* 마스크 반복 없음 */
  mask-position: center; /* 마스크 위치 */
  border: none; // 버튼 테두리 제거
    aspect-ratio: 1; // 정사각형 비율 유지
    transform:scale(1.3);

  &:hover {
    filter: brightness(1.2); // 밝기 조절
  mask-image: url("asset/calendar2.svg"); 

}

  }
`;
export default Homepage;
