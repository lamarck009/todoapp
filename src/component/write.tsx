'use client';
import { useRouter } from "next/navigation";
import { useState } from "react";   
import styled from '@emotion/styled';   
import { colors } from '@/styles/theme'; // colors.ts에서 colors 가져오기
import { useTodo } from '@/context/TodoContext'; // TodoContext에서 useTodo 훅 가져오기

export default function Write() {
    const router = useRouter(); // useRouter 훅 사용
    const [text, setText] = useState(''); // 입력된 텍스트 상태 관리
    const { addTodo } = useTodo();

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setText(event.target.value); // 입력된 텍스트 상태 업데이트
    };

    const handleSubmit = () => {
        if (text.trim()){ 
            addTodo(text); 
            router.push('/'); // 홈 페이지로 이동
        }        
    };

    return (
        <>
        <Maincontainer>
            <WriteContainer>
            <Title>글쓰기</Title>
        <Input
        value={text}
        onChange={handleInputChange}
        placeholder="내용을 입력하세요">
        </Input>
        <ButtonContainer>
        <DoneButton onClick={handleSubmit}>완료</DoneButton>
        <CancelButton onClick={() => router.push('/')}>취소</CancelButton>
        </ButtonContainer>
        </WriteContainer>
        </Maincontainer>
        </>
            )
            
        }
        

const Maincontainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100vh;
    padding: 20px;
    color: white;
    font-family: 'Geist', sans-serif;
    font-size: 1em;
    text-align: center;
    `

const Title = styled.h1`
    font-size: 2em;
    text-align: center;
    color: white;
    `
    

const WriteContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    max-width: 800px;
    height: 100vh;
    padding: 20px;
    background-color: transparent;};
    color: white;
    font-family: 'Geist', sans-serif;
    font-size: 1.5em;
    text-align: center;
    `


const Input = styled.input`
    width: 700px;
    height: 500px;
    padding: 10px;
    margin-bottom: 20px;
    border: 1px solid ${colors.border};
    border-radius: 5px;
    font-size: 1em;
`
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
`
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
`   

const ButtonContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center;   
    gap: 10px;
    width: 100%;
        
`   

