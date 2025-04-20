"use client"
import styled from '@emotion/styled';   
import { colors } from '@/styles/theme'; // colors.ts에서 colors 가져오기
import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation'; // useRouter 훅 가져오기
import { useTodo } from '@/app/context/TodoContext'; // TodoContext에서 useTodo 훅 가져오기

interface Todo {
    id: string;
    text: string;
    isChecked: boolean;}


const Homepage: React.FC = () => {
    const { todos, toggleTodo } = useTodo(); // toggleTodo 추가
    const router = useRouter(); // useRouter 훅 사용

    const handleListClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        const listItem = target.closest('li');
        
        if (listItem) {
            const id = listItem.dataset.id;
            if (id) {
                toggleTodo(id);
                listItem.style.border = !todos.find(t => t.id === id)?.isChecked
                    ? `2px solid ${colors.checked}`
                    : '2px solid transparent';
            }
        }
    };


    const handleWriteClick = () => {
        router.push('/write'); // write 페이지로 이동

      };


    return (
        <Maincontainer>
            <AppContainer>
            <Headers>
            <Title>Todo 앱 : 일정관리</Title>
            </Headers>
            <MenuButtonContainer>
                <EditButton>수정</EditButton>
                <DateSetButton>일정</DateSetButton>
                <DeleteButton>삭제</DeleteButton>
                <AddButton onClick={handleWriteClick} />
                </MenuButtonContainer>
            <List onClick={handleListClick}>
                {todos.map((todo) => (
                <ListItem
                key={todo.id}
                data-id={todo.id}
                >
                <CheckBox type='checkbox' 
                checked={todo.isChecked}
                onChange={() => {}} // React controlled component를 위한 빈 핸들러
                />
                <ListItemText>{todo.text}</ListItemText>
                </ListItem>
                   ))}
                </List>  
                </AppContainer>
        </Maincontainer>
    );
};

const Maincontainer = styled.div`
    display: flex;
    padding: 20px;
    width: 100%;
    height: 100vh;
    justify-content: center;
    align-items: center;
    z-index: 0;

    
`
const AppContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    max-width: 500px;
    
    `


const Title = styled.h1`
    font-size: 2em;
    text-align: center;
    color: white;
    text-shadow: 1px 1px 2px #000;
`   
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
    direction: column;`



const List = styled.ul`
    list-style-type: none;
    padding: 20px;  
    width: 100%;
    max-width: 600px;
    max- height: 500px;
    height: 500px;
    background-color: ${colors.list};
    border-radius: 0 0 25px 25px;
    z-index: 2;

`
const ListItem = styled.li`
    padding: 10px;
    background-color: white;
    margin: 5px 0;
    border-radius: 5px;
    border: 2px solid transparent;
    display: flex;
    justify-content: flex-start; 
    align-items: center;    
    gap: 10px;
    cursor: pointer;
    &:hover {
        background-color: #e0e0e0;
    }
    width: 100%;
    
`
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
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: red; 
    mask-image: url('asset/check.svg'); /* SVG 파일을 마스크로 사용 */
    mask-size: contain; /* 마스크 크기 조절 */
    mask-repeat: no-repeat; /* 마스크 반복 없음 */
    mask-position: center; /* 마스크 위치 */
    top: -25%;
    left:10%;
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
`

const MenuButtonContainer = styled.div`
    
    display: flex;
    justify-content: flex-end;
    width: 100%;
    position: relative;
    max-width: 600px;
    height: fit-content;
    padding: 10px;
    background-color: ${colors.head2};
    gap: 10px;
    border-bottom: 3px solid transparent; // 먼저 투명한 border 설정
    border-image: ${colors.hr}; // gradient 적용
    border-image-slice: 1; // 필수! gradient가 제대로 보이게 함
    background-color: #white;`

const AddButton = styled.button`
    background-color: red; 
    mask-image: url('asset/plus.svg'); /* SVG 파일을 마스크로 사용 */
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
`

const EditButton = styled.button`
    background-color: #28a745;
    color: white;
    border: none; 
    height: fit-content;
    padding: 5px;
    border-radius: 5px;
    cursor: pointer;
    &:hover {
        background-color: #218838;
    }
 `

 const DeleteButton = styled.button`
    background-color: #dc3545;  
    color: white;
    border: none;
    height: fit-content;
    padding: 5px;
    border-radius: 5px;
    cursor: pointer;
    &:hover {
        background-color: #c82333;
    }
    `
const DateSetButton = styled.button`
    background-color: #17a2b8;
    color: white;
    border: none;
    height: fit-content;
    padding: 5px;
    border-radius: 5px;
    cursor: pointer;
    &:hover {
        background-color: #138496;
    }
`
export default Homepage;