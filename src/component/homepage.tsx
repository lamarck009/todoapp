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
import { FaUser } from "react-icons/fa";
import Write from "./write";
import EditModal from "./EditModal";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const Homepage: React.FC = () => {
  // TodoContext에서 필요한 상태와 함수들을 가져옴
  const { todos, toggleTodo, setTodos, deleteTodo, toggleStatus } = useTodo();
  // 페이지 라우팅을 위한 router 객체
  const router = useRouter();
  // 체크된 항목이 있는지 여부를 추적하는 상태
  const isInitialMount = useRef(true); // 초기화 플래그 생성
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
// 검색어와 검색 적용 여부를 위한 상태
const [searchText, setSearchText] = useState<string>("");
const [activeSearchText, setActiveSearchText] = useState<string>("");

// 검색 버튼 클릭 시 실행될 함수
const handleSearchButton = () => {
  setActiveSearchText(searchText);
};

// 화면에 보여질 필터링된 todos
const displayTodos = todos.filter((todo) => 
  todo.text.toLowerCase().includes(activeSearchText.toLowerCase())
);

  // 컴포넌트 마운트 시 todos 로드

  // 할일 진행도 처리 함수
  const handleToggle = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    toggleStatus(id); // 상태 변경
  };
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false); // 초기값을 false로 설정


  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    const savedTheme = window.localStorage.getItem("theme");
    if (savedTheme) {
      // 저장된 테마가 있으면 그 값을 사용
      setIsDarkMode(savedTheme === "dark");
      document.body.classList.toggle("dark-mode", savedTheme === "dark");
    }
    if (!savedTheme) {
      // 저장된 테마가 없을 경우에만 라이트 모드로 초기화
      setIsDarkMode(false);
      window.localStorage.setItem("theme", "light");
      document.body.classList.remove("dark-mode");
    }
  }, []);

  // 다크모드
  const toggleDarkMode = () => {
    document.body.classList.toggle("dark-mode");
    const newTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("theme", newTheme);
  };

  // 새 할일 작성 페이지로 이동하는 함수
  const handleWriteClick = () => {
    setIsWriteModalOpen(true);
  };

  // 수정 페이지로 이동하는 함수
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const listItem = e.currentTarget.closest("li");
    const dataId = listItem?.getAttribute("data-id");
    if (dataId) {
      setEditingTodoId(dataId);
      setIsEditModalOpen(true);
    }
  };

  //삭제
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    const listItem = e.currentTarget.closest("li");
    const dataId = listItem?.getAttribute("data-id");

    if (dataId && listItem) {
      // 먼저 페이드아웃 애니메이션 적용
      listItem.classList.add("fade-out");

      // 애니메이션 완료 후 실제 삭제
      setTimeout(async () => {
        try {
          await deleteTodo(dataId);
        } catch (error) {
          console.error("삭제 실패:", error);
          listItem.classList.remove("fade-out");
        }
      }, 400);
    }
  };

  //정렬관련 로직
  const handleSetList = async (newState: ItemInterface[]) => {
    const updatedTodos = newState.map((item) => {
      const existingTodo = todos.find((todo) => todo.id === item.id);

      return {
        ...existingTodo,
      } as Todo;
    });

    setTodos(updatedTodos);

    // JSON 파일 업데이트
    try {
      const response = await fetch(`${API_URL}/api/todos`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "reorder",
          updatedTodos: updatedTodos,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update todos order");
      }
    } catch (error) {
      console.error("7. 에러 발생:", error);
      setTodos(todos); // 에러 발생 시 원래 순서로 되돌리기
    }
  };

  //섹션 정렬 로직
  const [currentFilter, setCurrentFilter] = useState("all");

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
  };

  // 날짜순 정렬 로직(4.28)
  const [isDateAscending, setIsDateAscending] = useState(true);

  const handleSortByDate = async () => {
    setIsDateAscending(!isDateAscending); // 클릭할 때마다 정렬 방향 전환

    const sortedTodos = [...todos].sort((a, b) => {
      return isDateAscending
        ? a.timestamp - b.timestamp // 오름차순 (과거 → 최신)
        : b.timestamp - a.timestamp; // 내림차순 (최신 → 과거)
    });

    await handleSetList(sortedTodos);
  };

  //중요도 정렬 로직(4.28)
  const priorityStyles = [
    { text: "상", className: "high" },
    { text: "중", className: "medium" },
    { text: "하", className: "low" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSortByPriority = async () => {
    const nextIndex = (currentIndex + 1) % priorityStyles.length;
    setCurrentIndex(nextIndex);
    const priorityOrders = [
      { high: 1, medium: 2, low: 3 }, // "상" 클릭시
      { medium: 1, high: 2, low: 3 }, // "중" 클릭시
      { low: 1, medium: 2, high: 3 }, // "하" 클릭시
    ] as const; // 여기에 as const 추가

    const priorityOrder = priorityOrders[nextIndex];

    const sortedTodos = [...todos].sort((a, b) => {
      const aPriority =
        priorityOrder[a.priority as keyof typeof priorityOrder] || 4;
      const bPriority =
        priorityOrder[b.priority as keyof typeof priorityOrder] || 4;
      return aPriority - bPriority;
    });

    await handleSetList(sortedTodos);
  };

  // 저장된 todos를 로드하는 함수
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
        const realTodos = data.todos.filter(
          (todo: Todo) => todo.id !== DEFAULT_TODO_ID
        );
        if (realTodos.length > 0) {
          setTodos(realTodos);
          return;
        } else setTodos(DEFAULT_TODOS);
      }

      // 실제 할일이 없는 경우에만 DEFAULT_TODOS 사용
    } catch (error) {
      console.error("Failed to load saved todos:", error);
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
        <Headers className="Header">
          {/* 프로필 사진을 넣을경우 동그란 사진으로. 아닐경우 아이콘으로 */}
          <HeaderTop className="HeaderTop">
            <button
              className={`toggle-switch ${isDarkMode ? "dark-mode" : ""}`}
              onClick={toggleDarkMode}
            >
              <div
                id="toggle-darkmode"
                className={`${isDarkMode ? "dark-mode" : ""}`}
              >
                🌙
              </div>
            </button>
            <UserIcon className="profile" onClick={() => router.push("/auth")}>
              <FaUser size={20} />
            </UserIcon>
          </HeaderTop>
          <HeaderBottom>
            <Title>My Todo List</Title>
          </HeaderBottom>
        </Headers>

        {/* 버튼 컨테이너 영역 */}
        <HeaderButtonContainer className="HeaderButtonContainer">
          {/* 섹션 버튼 영역 */}
          <SectionButtonContainer className="SectionButtonContainer">
            <div className="category-section">
              <SectionButton
                id="filter-all"
                onClick={() => handleFilterChange("all")}
                className={currentFilter === "all" ? "active" : ""}
              >
                All
              </SectionButton>
              <SectionButton
                id="filter-todo"
                onClick={() => handleFilterChange("todo")}
                className={currentFilter === "todo" ? "active" : ""}
              >
                시작
              </SectionButton>
              <SectionButton
                id="filter-progress"
                onClick={() => handleFilterChange("Progress")}
                className={currentFilter === "Progress" ? "active" : ""}
              >
                진행
              </SectionButton>
              <SectionButton
                id="filter-done"
                onClick={() => handleFilterChange("Done")}
                className={currentFilter === "Done" ? "active" : ""}
              >
                완료
              </SectionButton>
            </div>
            <div className="sort-section">
              <SectionButton id="sort-priority" onClick={handleSortByPriority}>
                <span>중요도</span>
                <div
                  className={`PriorityText ${priorityStyles[currentIndex].className}`}
                >
                  {" "}
                  {priorityStyles[currentIndex].text}
                </div>
              </SectionButton>
              <SectionButton id="sort-date" onClick={handleSortByDate}>
                날짜 {isDateAscending ? "↑" : "↓"}
              </SectionButton>
            </div>
          </SectionButtonContainer>

          {/* 메뉴 버튼 영역 */}
          <MenuButtonContainer className="MenuButtonContainer">
            <SearchInput
              value={searchText || ""}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <SearchButton onClick={handleSearchButton}/>
            <AddButton onClick={handleWriteClick} />
            <Write
              isOpen={isWriteModalOpen}
              onClose={() => setIsWriteModalOpen(false)}
            />
            <EditModal
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              todoId={editingTodoId}
            />
          </MenuButtonContainer>
        </HeaderButtonContainer>

        {/* 할일 목록 영역 */}
        <List>
          {/* ReactSortable로 드래그 앤 드롭 기능 구현 */}
          <StyledSortable
            list={todos}
            setList={(newState) => {
              if (isInitialMount.current) {
                // 최초 마운트인 경우
                isInitialMount.current = false; // 플래그를 false로 변경
                return; // 함수 실행 중단
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
            {displayTodos.map((todo) => (
              <ListItem
                key={todo.id}
                data-id={todo.id}
                className={`drag-handle ${todo.priority} ${todo.status} ${
                  currentFilter === "all" || currentFilter === todo.status
                    ? ""
                    : "hidden"
                }`}
              >
                <StatusCircle
                  onClick={(e) => handleToggle(e, todo.id)}
                  className={todo.status}
                ></StatusCircle>
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

//글로벌 변수
const SCROLLBAR_WIDTH = 8; // 스크롤바 너비
const Basic_Padding = 20; // 기본 패딩값
const P_S_Padding = Basic_Padding + SCROLLBAR_WIDTH;

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
  gap: 5px;
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
  max-height: 700px;
  height: 700px;
  overflow: hidden;
`;

const Headers = styled.header`
  display: flex;
  position: relative;
  justify-content: center; // 중앙 정렬을 위해 변경
  flex-direction: column;
  align-items: center;
  background-color: ${colors.head};
  color: white;
  width: 100%;
  height: fit-content;
  border-radius: 25px 25px 0 0;
  padding: ${Basic_Padding}px;
`;

const Title = styled.h1`
  font-size: 2em;
  color: white;
  text-shadow: 1px 1px 2px #000;
`;

const HeaderTop = styled.div`
  display: flex;
  width: 100%;
  padding: 0 10px;
  height: fit-content;
  justify-content: space-between;
  align-items: center;
  position: relative;
`;
const HeaderBottom = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50%; // Headers의 하단 절반
`;

const List = styled.ul<{ isDraggingOver?: boolean }>`
  list-style-type: none;
  padding: 0 ${Basic_Padding}px;
  padding-left: ${P_S_Padding}px;
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
  border-radius: 5px;
  height: 3rem;
  border: 2px solid transparent;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  user-select: none;
  transform: translateY(10px);

  &:hover {
    cursor: pointer;
    border: 2px solid ${colors.checked};
  }
 &.hidden {
    display: none;

  /* 페이드인 애니메이션 */
  &.fade-in {
    animation: fadeIn 0.4s ease forwards;
  }

  /* 페이드아웃 애니메이션 */
  &.fade-out {
    animation: fadeOut 0.4s ease forwards;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(30px);
    }
  }


`;
const StatusCircle = styled.div`
  width: 24px;
  height: 24px;
  border: 2px solid #666666;
  border-radius: 50%;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;

  &.todo {
    &::after {
      content: "";
      position: absolute;
      width: 100%;
      height: 100%;
      background-color: ${colors.icon};
      mask-image: url("asset/Progress1.svg");
      mask-size: contain;
      mask-repeat: no-repeat;
      mask-position: center;
      top: 0%;
      left: 0%;
    }
  }
  &.Progress {
    &::after {
      content: "";
      position: absolute;
      width: 100%;
      height: 100%;
      background-color: ${colors.icon};
      mask-image: url("asset/Progress2.svg");
      mask-size: 100%;
      mask-repeat: no-repeat;
      mask-position: center;
      top: 0%;
      left: 0%;
    }
  }

  &.Done {
    background: white;
    &::after {
      content: "";
      position: absolute;
      width: 100%;
      height: 100%;
      background-color: red;
      mask-image: url("asset/check2.svg");
      mask-size: 120%;
      mask-repeat: no-repeat;
      mask-position: center;
      top: -20%;
      left: 10%;
      animation: checkAfter 0.5s ease forwards;
    }
  }

  @keyframes checkAfter {
    0% {
      transform: scale(0.8) rotate(-45deg);
      opacity: 0;
    }
    50% {
      transform: scale(1.1) rotate(0deg);
      opacity: 0.5;
    }
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }

  &:hover {
    transform: scale(1.1);
  }
`;

const ListItemText = styled.span`
  font-size: 1.2em;
  margin-right: 10px;
  color: #555;
`;

const HeaderButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: fit-content;
  position: relative;
  max-width: 600px;
  padding: 10px 20px;
  background-color: ${colors.head2};
  gap: 10px;
  align-items: flex-end;
`;

const SectionButtonContainer = styled.div`
  display: flex;
  width: 100%;
  background-color: ${colors.head2};
  border-bottom: 3px solid transparent; // 먼저 투명한 border 설정
  border-image: ${colors.hr}; // gradient 적용
  border-image-slice: 1; // 필수! gradient가 제대로 보이게 함
  background-color: #white;
`;

const SectionButton = styled.button`
  white-space: nowrap; // 줄바꿈 방지
  color: black;
  height: fit-content;
  width: fit-content;
  display: flex;
  align-items: center;
  font-size: 1.2em;
  padding: 5px 5px;
  border-radius: 5px;
  cursor: pointer;
  align-items: center; // 세로 중앙 정렬

  // active 상태일 때의 스타일
  &.active {
    background-color: #666666;
    color: white;
    // 추가로 원하는 스타일
    // box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    // transform: scale(1.05);
  }
`;

const MenuButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  height: fit-content;
  position: relative;
  padding: 10px;
  background-color: ${colors.head2};
  gap: 10px;
  border-bottom: 3px solid transparent; // 먼저 투명한 border 설정
  border-image: ${colors.hr}; // gradient 적용
  border-image-slice: 1; // 필수! gradient가 제대로 보이게 함
  background-color: #white;
`;

const AddButton = styled.button`
  background-color: ${colors.icon2};
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

const SearchInput = styled.input`
  width: 100%;
`;

const SearchButton = styled.button`
  background-color: ${colors.icon2};
  mask-image: url("asset/search.svg");
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  border: none;
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

const UserIcon = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  mask-size: contain;
  transform: scale(1.3);
  justify-content: center;
  &:hover {
    transform: scale(1.5);
    opacity: 0.8;
    transition: all ease-in 0.2s;
  }
`;

export default Homepage;
