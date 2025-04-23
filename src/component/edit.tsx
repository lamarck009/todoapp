'use client';
import { useParams, useRouter } from "next/navigation";
import { useContext,useEffect,  useState } from "react";   
import styled from '@emotion/styled';   
import { colors } from '@/styles/theme'; // colors.ts에서 colors 가져오기
import { useTodo } from '@/context/TodoContext'; // TodoContext에서 useTodo 훅 가져오기

const EditPage = () => {
    const [EditText,SetEditText]  =useState('')
    const { todos, setTodos } = useTodo();
    const router = useRouter(); // useRouter 훅 사용
    
    const params = useParams();
    const todo = todos.find(t => t.id === params.id);


    useEffect(() => {
        if (todo) {
            SetEditText(todo.text);
        }
    }, [params, todos]);

    const changeText = () => {
        if (!EditText.trim()) {
            alert("내용을 입력해주세요");
            return;
        }
            if (todo) {  // todo가 있을 때만
            const newTodos = [...todos];
            newTodos[todos.indexOf(todo)] = { ...todo, text: EditText };
            setTodos(newTodos);
            router.push('/'); // 홈 페이지로 이동
        }
    }

    return (
        <>
        <Maincontainer>
            <WriteContainer>
            <Title>수정</Title>
        <Input
        value={EditText}
        placeholder="내용을 입력하세요"
        onChange={(e) => SetEditText(e.target.value)}>
        </Input>
        <ButtonContainer>
        <DoneButton onClick={changeText}>완료</DoneButton>
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
    


  
  export default EditPage;