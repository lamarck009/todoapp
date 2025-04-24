import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Write from './write'
import '@testing-library/jest-dom'
import { TodoProvider } from '@/context/TodoContext'
import { useRouter } from 'next/navigation'
import { Todo } from '@/context/TodoContext'

// mockPush 함수를 밖에서 선언
const mockPush = jest.fn()

// Next.js router 모킹
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush  // 미리 선언한 mockPush 사용
  })
}))

// nanoid 모킹 (고정된 ID 반환)
jest.mock('nanoid', () => ({
  nanoid: () => '123'
}))

describe('Write Component', () => {
   // 각 테스트 전에 실행
   beforeEach(() => {
    mockPush.mockClear() // mock 함수 초기화
})
  it('renders Write component correctly', () => {
      render(
          <TodoProvider>
              <Write />
          </TodoProvider>
      )
      
      expect(screen.getByText('글쓰기')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('내용을 입력하세요')).toBeInTheDocument()
      expect(screen.getByText('완료')).toBeInTheDocument()
      expect(screen.getByText('취소')).toBeInTheDocument()
  })

  it('인풋 밸류 타이핑핑', () => {
      render(
          <TodoProvider>
              <Write />
          </TodoProvider>
      )
      
      const input = screen.getByPlaceholderText('내용을 입력하세요')
      fireEvent.change(input, { target: { value: 'New Todo' } })
      expect(input).toHaveValue('New Todo')
  })

  it('새 todo 추가', async () => {  // async 추가
    render(
        <TodoProvider>
            <Write />
        </TodoProvider>
    )
    
    const input = screen.getByPlaceholderText('내용을 입력하세요')
    const submitButton = screen.getByText('완료')

    // 입력값 변경
    fireEvent.change(input, { target: { value: 'New Todo' } })
    
    // 버튼 클릭
    fireEvent.click(submitButton)

    // 약간의 지연 후 확인
    await waitFor(() => {
    expect(mockPush).toHaveBeenCalledWith('/')
})
  })

  it('캔슬 버튼 클릭', () => { 

      render(
          <TodoProvider>
              <Write />
          </TodoProvider>
      )
      
      const cancelButton = screen.getByText('취소')
      fireEvent.click(cancelButton)


      expect(mockPush).toHaveBeenCalledWith('/')
    })


  it('인풋 밸류가 비었을 경우', () => {

      render(
          <TodoProvider>
              <Write />
          </TodoProvider>
      )
      
      const submitButton = screen.getByText('완료')
      fireEvent.click(submitButton)

      expect(mockPush).not.toHaveBeenCalled()
  })
})