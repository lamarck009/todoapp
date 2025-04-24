## 1\. 테스트의 목적과 원칙

-   버그 예방
-   안전한 리팩토링
-   코드 문서화
-   생산성 향상
-   더 나은 설계 유도

```
// ❌ 구현 세부사항 테스트 NO
test('state가 변경되는지', () => {
  const { result } = renderHook(() => useState(false));
  act(() => {
    result.current[1](true);
  });
  expect(result.current[0]).toBe(true);
});

// ✅ 사용자 관점에서 테스트 OK
test('버튼 클릭시 모달이 열림', () => {
  render(<MyComponent />);
  userEvent.click(screen.getByRole('button', { name: '열기' }));
  expect(screen.getByRole('dialog')).toBeVisible();
});
```

-   사용자 관점에서 테스트 작성
-   구현 세부사항이 아닌 동작을 테스트
-   실제 브라우저 동작 방식을 반영

LLM을 활용하는 방법도 존재하기 때문에 테스트로만 가능한 것들에 집중한다.  
또한 개발자가 직접 테스트 해보는 것  
즉, 수동 테스트보다 자동화된 테스트가 더 효율적인 것들을 위주로 테스트 해보는 것이 좋다.

## 2\. 핵심 케이스들

1.  비즈니스 로직 검증

```
test('장바구니 금액 계산', () => {
  render(<Cart items={mockItems} />);

  // 할인, 배송비, 쿠폰 등 복잡한 계산 로직 검증
  expect(screen.getByText('총액: 21,720원')).toBeInTheDocument();
});
```

-   금액 계산은 정확성이 중요하며 할인, 쿠폰, 배송비 등 복잡한 계산식이 얽혀있음
-   때문에 사람이 수동으로 계산하면 실수할 가능성이 높음
-   코드 수정 시 의도치 않은 계산 로직 변경을 즉시 감지 가능

```
test('결제 프로세스', async () => {
  render(<PaymentFlow />);

  // 결제 정보 입력
  userEvent.type(screen.getByLabelText('카드번호'), '1234');

  // 결제 진행
  userEvent.click(screen.getByText('결제하기'));

  // 결제 완료 확인
  await waitFor(() => {
    expect(screen.getByText('결제가 완료되었습니다')).toBeInTheDocument();
  });
});
```

-   핵심 비즈니스 플로우는 항상 정상 작동해야 함
    -   매출과 직결되는 주요 기능들 (결제, 주문, 예약 등)
    -   사용자 인증/보안 관련 프로세스
    -   데이터 정합성이 중요한 금융 거래
    -   서비스의 기본적인 CRUD 기능  
        SLA(서비스 수준 계약)가 정의된 핵심 기능들
-   여러 단계가 순차적으로 실행되는 로직 검증
-   중간에 실패하면 안 되는 중요 프로세스
    -   금융 거래/송금 프로세스
    -   재고 관리 시스템
    -   백업/복구 프로세스
    -   결제 취소/환불 프로세스
    -   데이터 마이그레이션 작업
-   회귀 테스트가 특히 중요한 영역
    -   레거시 시스템과 연동되는 부분
    -   자주 변경되는 API 엔드포인트
    -   다수의 의존성을 가진 모듈
    -   비즈니스 룰이 복잡한 영역
    -   성능에 민감한 컴포넌트

2.  상태 관리 및 데이터 흐름

```
test('할일 목록', () => {
  render(<TodoList />);

  // 추가
  userEvent.type(screen.getByRole('textbox'), '새 할일');
  userEvent.click(screen.getByText('추가'));

  // 수정
  userEvent.click(screen.getByText('수정'));

  // 삭제
  userEvent.click(screen.getByText('삭제'));

  // 상태 변화 확인
  expect(screen.queryByText('새 할일')).not.toBeInTheDocument();
});
```

-   여러 상태 변화를 추적하기가 수동으로는 어려움
-   상태 업데이트 후 UI가 정확히 반영되는지 확인 필요
-   데이터 일관성이 깨지는 경우를 빠르게 발견 가능
-   Redux, Context 등 상태 관리 로직 검증

3.  API 통합

```
test('데이터 요청 및 에러 처리', async () => {
  server.use(
    rest.get('/api/users', (req, res, ctx) => {
      return res(ctx.status(500));
    })
  );

  render(<UserList />);

  await waitFor(() => {
    expect(screen.getByText('에러가 발생했습니다')).toBeInTheDocument();
  });
});
```

### MSW를 활용한 API 모킹 예시

MSW(Mock Service Worker)는 API 모킹을 위한 도구로, 실제 네트워크 요청을 가로채서 가짜 응답을 보내주는 방식으로 작동합니다.

```
const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(ctx.json([{ name: '김철수' }]));
  })
);

test('사용자 목록 조회', async () => {
  render(<UserList />);
  await screen.findByText('김철수');
});
```

-   다양한 API 응답 상황을 시뮬레이션 가능
-   에러 상황 테스트는 수동으로는 재현하기 어려움
-   네트워크 지연, 타임아웃 등 엣지 케이스 테스트
    -   네트워크 지연: 데이터가 출발지에서 목적지까지 도달하는데 걸리는 시간이 늘어나는 현상
    -   타임아웃: 요청에 대한 응답을 기다리는 제한 시간을 초과하는 현상
    -   네트워크 단절: 통신이 완전히 끊어지는 현상
    -   부분 실패: 여러 요청 중 일부만 실패하는 현상
    -   데이터 손실: 전송 중 데이터가 유실되는 현상
-   백엔드 의존성 없이 프론트엔드 로직 검증 가능

4.  조건부 렌더링 로직

```
test('사용자 권한에 따른 UI 표시', () => {
  render(<Dashboard user={{ role: 'admin' }} />);

  // 관리자만 볼 수 있는 요소 확인
  expect(screen.getByText('관리자 설정')).toBeInTheDocument();

  // 일반 사용자 UI
  rerender(<Dashboard user={{ role: 'user' }} />);
  expect(screen.queryByText('관리자 설정')).not.toBeInTheDocument();
});
```

-   다양한 권한/상태에 따른 UI 변화를 체계적으로 검증
-   특정 조건을 만족하기 위한 복잡한 설정이 필요한 경우
-   모든 케이스를 빠짐없이 체크 가능
-   권한 관련 보안 이슈 예방

5.  폼 유효성 검사

```
test('회원가입 폼 검증', async () => {
  render(<SignupForm />);

  // 잘못된 입력
  userEvent.type(screen.getByLabelText('이메일'), 'invalid');
  userEvent.click(screen.getByText('가입하기'));

  // 에러 메시지 확인
  expect(screen.getByText('올바른 이메일을 입력하세요')).toBeInTheDocument();
});
```

-   다양한 입력값에 대한 검증이 필요
-   실시간 유효성 검사 로직 테스트
-   여러 필드 간의 연관 규칙 검증
-   사용자 입력에 따른 즉각적인 피드백 확인

이러한 케이스들은

-   반복적인 검증이 필요
-   로직이 복잡
-   데이터 흐름 추적이 중요
-   자동화된 회귀 테스트가 유용
-   비즈니스적으로 중요

따라서 수동 테스트보다 자동화된 테스트가 더 효율적

# 테스트 작성 가이드

## 1\. 요소 선택 방법

### 1\. 선택자 우선순위

```
// 1순위: getByRole
// - 가장 권장되는 쿼리 메서드
// - 실제 사용자가 요소를 인식하는 방식과 가장 유사
// - ARIA 역할을 기반으로 요소를 찾음
// - name 옵션으로 특정 텍스트를 가진 요소를 찾을 수 있음
// - button, link, heading 등 HTML 시맨틱 요소들의 기본 역할 활용
const button = screen.getByRole('button', { name: '제출' });

// 2순위: getByLabelText
// - 폼 요소를 찾을 때 가장 적합
// - HTML의 label과 input의 연결관계를 활용
// - aria-label 속성도 인식
// - 실제 사용자가 폼을 이해하는 방식과 일치
const input = screen.getByLabelText('이메일');

// 3순위: getByText
// - 화면에 표시되는 텍스트로 요소를 찾음
// - 단순 텍스트 콘텐츠를 확인할 때 사용
// - 정규식을 사용한 부분 일치 검색 가능
// - 버튼이나 링크가 아닌 일반 텍스트 요소에 적합
const message = screen.getByText('환영합니다');

// 마지막 순위: getByTestId
// - 다른 쿼리 메서드로 접근이 어려울 때만 사용
// - data-testid 속성을 요소에 추가해야 함
// - 실제 사용자 경험과는 무관한 테스트 전용 속성
// - 유지보수 시 실수로 속성이 제거될 수 있어 주의 필요
const special = screen.getByTestId('custom-element');
```

1.  getByRole : HTML 요소의 의미적 역할(semantic role)을 기반
2.  getByLabelText : HTML의 label과 연결된 폼 요소
3.  getByText : 텍스트 콘텐츠 기반
4.  getByTestId : data-testid 속성 기반

## 2\. 비동기 처리

```
// ✅ 권장: async/await 사용
test('데이터 로딩', async () => {
  render(<DataComponent />);

  // 로딩 상태 확인
  expect(screen.getByText('로딩중...')).toBeInTheDocument();

  // 데이터 로드 대기
  await screen.findByText('데이터 제목');

  // 결과 확인
  expect(screen.getByText('데이터 내용')).toBeInTheDocument();

});
```

-   대기가 필요할 경우 setTimeout()보다 waitFor(() => {}) 사용
    -   waitFor : 비동기 작업이 완료될 때까지 기다렸다가 테스트하는 유틸리티
    -   waitFor 사용이 필요한 경우:
        -   API 응답을 기다려야 할 때
        -   상태 업데이트를 기다려야 할 때
        -   애니메이션이 완료되기를 기다려야 할 때
    -   findBy\* 사용이 필요한 경우:
        -   특정 요소가 나타나기를 기다려야 할 때
        -   비동기적으로 렌더링되는 컴포넌트를 테스트할 때

## 3\. 테스트 구조화와 유지 보수

### 1\. 파일 구조

```
// Component.tsx
export const Component = () => {...}

// Component.test.tsx
describe('Component', () => {
  // 관련 테스트들을 그룹화
  describe('초기 렌더링', () => {
    test('기본 상태 표시', () => {...})
  });

  describe('사용자 인터랙션', () => {
    test('버튼 클릭', () => {...})
  });
});
```

### 2\. 테스트 격리

```
// ✅ 각 테스트는 독립적으로 실행
beforeEach(() => {
  jest.clearAllMocks();
});

// ✅ 공통 설정은 함수로 추출
const renderWithProviders = (ui) => {
  return render(
    <Provider>
      {ui}
    </Provider>
  );
};
```

### 3\. 모범 사례

```
// ✅ 의미있는 테스트 이름
test('이메일 형식이 맞지 않으면 에러 메시지 표시', () => {});

// ✅ 하나의 테스트는 하나의 동작만
test('로그인 성공 시나리오', () => {
  render(<LoginForm />);

  // Given - 초기 설정
  const emailInput = screen.getByLabelText('이메일');
  const passwordInput = screen.getByLabelText('비밀번호');
  const submitButton = screen.getByRole('button', { name: '로그인' });

  // When - 사용자 액션
  userEvent.type(emailInput, 'test@example.com');
  userEvent.type(passwordInput, 'password123');
  userEvent.click(submitButton);

  // Then - 결과 확인
  expect(screen.getByText('로그인 성공')).toBeInTheDocument();
});
```

---

## 2\. 유지보수 고려사항

```
// ✅ 무거운 설정은 beforeAll 사용
beforeAll(() => {
  // DB 설정 등
});

// ✅ 가벼운 초기화는 beforeEach 사용
beforeEach(() => {
  jest.clearAllMocks();
});
```

## 3\. 유지보수 용이성

```
// ✅ 테스트 유틸리티 함수 활용
const fillLoginForm = async (email, password) => {
  userEvent.type(screen.getByLabelText('이메일'), email);
  userEvent.type(screen.getByLabelText('비밀번호'), password);
  userEvent.click(screen.getByRole('button', { name: '로그인' }));
};

// ✅ 상수 활용
const TEST_DATA = {
  email: 'test@example.com',
  password: 'password123'
};
```

## 4\. 주의사항

-   불필요한 테스트 작성 지양
-   테스트 커버리지에 집착하지 않기
-   깨지기 쉬운 테스트 피하기
-   실제 사용자 시나리오에 집중

### 3\. LLM 활용 추천 케이스

1.  테스트 케이스 발굴
    -   복잡한 시나리오의 엣지 케이스 도출
    -   다양한 사용자 입력 패턴 생성
2.  모의 데이터 생성
    -   테스트용 더미 데이터 생성
    -   API 응답 데이터 구조 작성
3.  에러 케이스 시나리오
    -   다양한 에러 상황 시뮬레이션
    -   예외 처리 테스트 케이스 도출