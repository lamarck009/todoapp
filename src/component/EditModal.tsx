"use client";
import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { colors } from "@/styles/theme"; // colors.ts에서 colors 가져오기
import { useTodo } from "@/context/TodoContext"; // TodoContext에서 useTodo 훅 가져오기

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  todoId: string | null;
}
const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, todoId }) => {
  const { todos, setTodos } = useTodo();
  const [editText, setEditText] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("low");
  const todo = todos.find((t) => t.id === todoId);

  useEffect(() => {
    if (todo) {
      setEditText(todo.text);
      setStatus(todo.status);
      setPriority(todo.priority);
    }
  }, [todo]);

  const handleSubmit = () => {
    if (!editText.trim()) {
      alert("내용을 입력해주세요");
      return;
    }
    if (todo) {
      const newTodos = [...todos];
      newTodos[todos.indexOf(todo)] = {
        ...todo,
        text: editText,
        status: status,
        priority: priority,
      };
      setTodos(newTodos);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <WriteContainer>
        <Title>수정</Title>
        <Input
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          placeholder="내용을 입력하세요"
        />
        <ButtonGroup>
          <ButtonContainer1>
            <span style={{ whiteSpace: "nowrap" }}>우선 순위 : </span>
            <PriorityButton
              onClick={() => setPriority("low")}
              isSelected={priority === "low"}
            >
              낮음
            </PriorityButton>
            <PriorityButton
              onClick={() => setPriority("medium")}
              isSelected={priority === "medium"}
            >
              중간
            </PriorityButton>
            <PriorityButton
              onClick={() => setPriority("high")}
              isSelected={priority === "high"}
            >
              높음
            </PriorityButton>
          </ButtonContainer1>
          <ButtonContainer2>
            <DoneButton onClick={handleSubmit}>완료</DoneButton>
            <CancelButton onClick={onClose}>취소</CancelButton>
          </ButtonContainer2>
        </ButtonGroup>
      </WriteContainer>
    </ModalOverlay>
  );
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Title = styled.h1`
  font-size: 2em;
  text-align: center;
  color: black;
`;

const WriteContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 800px;
  height: auto;
  padding: 20px;
  background-color: ${colors.list};
  border-radius: 8px;
  animation: slideIn 0.3s ease-out;

  color: white;
  font-family: "Geist", sans-serif;
  font-size: 1.5em;
  text-align: center;

  @keyframes slideIn {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 700px;
  max-width: 700px;
  padding: 10px;
  heihgt: fit-content;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 8px;
  text-align: center;
  font-size: 1em;
  gap: 10px;
`;

const PriorityButton = styled.button<{ isSelected: boolean }>`
  background-color: ${colors.btno};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  white-space: nowrap;
  background-color: ${(props) =>
    props.isSelected ? `${colors.btok}` : "gray"};
  color: ${(props) => (props.isSelected ? "white" : "#4A5568")};

  &:hover {
    background-color: ${colors.hover};
  }

  &.high {
    background-color: red;
  }

  &.medium {
    background-color: yellow;
    color: black; // 노란색 배경에는 검은색 텍스트
  }

  &.low {
    background-color: green;
  }
`;

const Input = styled.input`
  width: 700px;
  height: 100px;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid ${colors.border};
  border-radius: 5px;
  font-size: 1em;
`;
const DoneButton = styled.button`
  background-color: ${colors.btok};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  &:hover {
    background-color: ${colors.hover};
  }
`;
const CancelButton = styled.button`
  background-color: ${colors.btno};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  margin-left: 10px;
  &:hover {
    background-color: ${colors.hover};
  }
`;

const ButtonContainer2 = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  width: 100%;
`;

const ButtonContainer1 = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  width: 100%;
`;

export default EditModal;
