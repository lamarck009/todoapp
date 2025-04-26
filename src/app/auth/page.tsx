// Auth.tsx
"use client";

import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import Image from "next/image";
import { FaHome } from "react-icons/fa";
import Link from "next/link"; 

interface UserProfile {
  name: string;
  nickname: string;
  email: string;
}

const Auth = () => {
  const [user, setUser] = useState<UserProfile>({
    name: "",
    nickname: "",
    email: "",
  });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("userProfile");
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("userProfile", JSON.stringify(user));
    setEditing(false);
  };

  const [emailError, setEmailError] = useState<string>("");


  return (
    <Container>
      <Title>사용자 프로필</Title>
      <ProfileItems>
        <ProfileItem>
          <Label>이름:</Label>
          {editing ? (
            <Input
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
            />
          ) : (
            <Value>{user.name}</Value>
          )}
        </ProfileItem>

        <ProfileItem>
          <Label>닉네임:</Label>
          {editing ? (
            <Input
              value={user.nickname}
              onChange={(e) => setUser({ ...user, nickname: e.target.value })}
            />
          ) : (
            <Value>{user.nickname}</Value>
          )}
        </ProfileItem>

        <ProfileItem>
          <Label>이메일:</Label>
          {editing ? (
            <>
              <Input
                value={user.email}
                onChange={(e) => {
                  const newEmail = e.target.value;
                  setUser({ ...user, email: newEmail });

                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (!emailRegex.test(newEmail)) {
                    setEmailError("이메일 형식이 아닙니다");
                  } else {
                    setEmailError("");
                  }
                }}
              />
              {emailError && <ErrorMessage>{emailError}</ErrorMessage>}
            </>
          ) : (
            <Value>{user.email}</Value>
          )}

        </ProfileItem>
      </ProfileItems>

      <ButtonsContainer>
        <EditButton onClick={() => (editing ? handleSave() : setEditing(true))}
          disabled={editing && !!emailError}>
          <Image src="/asset/edit.svg" alt="Edit" width={24} height={24} style={{ filter: "invert(1)" }} />
          {editing ? "저장" : "수정"}
        </EditButton>

        <Link href="/" passHref>
          <HomeButton>
            <FaHome size={20} />
            홈으로
          </HomeButton>
        </Link>
      </ButtonsContainer>


    </Container>
  );
};

const Container = styled.div`
  max-width: 600px;
  margin: 60px auto;
  background-color: rgb(215, 236, 248);
  border-radius: 25px;
`;

const Title = styled.h2`
  font-size: 2em;
  display:flex;
  text-align: center;
  align-items: center;
  justify-content: center;
  color: white;
  text-shadow: 1px 1px 2px #000;
  background-color: #4399C8;
  border-radius: 25px 25px 0 0;
  width: 100%;
  height: 100px;
`;

const ProfileItems = styled.div`
  background-color: rgb(215, 236, 248);
  padding:10px;
`;

const ProfileItem = styled.div`
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  background-color: white;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
  height: 3rem;
  border: 2px solid transparent;
`;

const Label = styled.label`
  width: 100px;
  font-weight: bold;
`;

const ErrorMessage = styled.div`
  color: red;
  font-size: 0.8rem;
  margin-top: 5px;
`;


const Value = styled.span`
  flex: 1;
`;

const Input = styled.input`
  flex: 1;
  padding: 5px 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 16px;
  padding-bottom:10px;
  justify-content: space-evenly;
  flex-direction: row;
  align-items:baseline;
`;

const EditButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 30px;
  padding: 8px 12px;
  border: none;
  
  color: white;
  border-radius: 5px;
  cursor: pointer;

  background-color: ${({ disabled }) => (disabled ? "#ccc" : "#0070f3")};
  pointer-events: ${({ disabled }) => (disabled ? "none" : "auto")};
  width: 100px;
  height: 40px;

   &:hover {
   transform: scale(1.1);
   opacity : 0.9;
   transition:all ease-in 0.2s;
  }
`;

const HomeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: none;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  background-color: #00b894;
  width: 100px;
  height: 40px;
   &:hover {
   transform: scale(1.1);
   opacity : 0.9;
   transition:all ease-in 0.2s;
  
  }
`;

export default Auth;
