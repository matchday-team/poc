## 초기 데이터 세팅

이벤트 등록에 필요한 기본 설정(사용자, 팀, 매치 등록)을 자동으로 할 수 있음

1. Python 환경 설정

```bash
pip install -r scripts/requirements.txt
```

2. 설정 스크립트 실행

```bash
python scripts/setup_match.py
```

이 스크립트는 다음 작업을 자동으로 수행함:

- 3명의 사용자 생성 (홍길동, 장길동, 강길동)
- 2개의 팀 생성 (레알, 토트넘)
- 홍길동을 레알에, 장길동을 토트넘에 입단
- 레알 vs 토트넘 매치 생성
- 홍길동과 장길동을 선발 선수로, 강길동을 기록자로 매치에 등록

## 예시 이벤트

```json
// 전송 예시
{
  "token": "3", // ARCHIVES 권한이 있는 강길동의 ID
  "data": {
    "userId": 1, // 이벤트를 발생시킨 홍길동의 ID
    "eventType": "GOAL",
    "description": "좋은 골이었습니다!"
  }
}

// 수신 예시
{
  "id": 1,
  "elapsedMinutes": 15,
  "teamId": 1,
  "teamName": "레알",
  "userId": 1,
  "userName": "홍길동",
  "eventLog": "홍길동이 골을 넣었습니다!"
}
```

## WebSocket 엔드포인트

- 연결 URL: `ws://localhost:8080/ws`
- 메시지 브로커:
  - 구독 경로: `/topic/match/{matchId}`
  - 발행 경로: `/app/match/{matchId}`

## 메시지 구조

```typescript
// 요청 메시지
interface Message<T> {
  token: string; // 사용자 토큰 (현재는 ARCHIVES 권한이 있는 userId를 문자열로 사용)
  data: T; // 실제 데이터
}

// 이벤트 요청 데이터
interface MatchEventRequest {
  userId: number; // 이벤트를 발생시킨 사용자 ID
  eventType: string; // 이벤트 타입 (예: GOAL, YELLOW_CARD)
  description: string; // 이벤트 설명
}

// 응답 메시지
interface MatchEventResponse {
  id: number;
  elapsedMinutes: number;
  teamId: number;
  teamName: string;
  userId: number;
  userName: string;
  eventLog: string;
}
```

## 사용 방법

1. 앱 실행

```bash
npm install
npm run dev
```

2. WebSocket 연결

- 앱이 시작되면 자동으로 WebSocket 서버에 연결됨
- 연결 상태는 화면 상단에 표시됨

3. 이벤트 기록

- Match ID: 경기 ID를 입력
- Token: 현재는 ARCHIVES 권한이 있는 사용자의 ID를 문자열로 입력 (예: "3")
  - _참고: 나중엔 JWT 토큰으로 바뀔 예정임_
- User ID: 이벤트를 발생시킬 사용자 ID를 입력
- Event Type: 이벤트 타입을 입력 (예: GOAL, YELLOW_CARD)
- Description: 이벤트에 대한 설명을 입력
- "Send Event" 버튼을 클릭해서 이벤트를 전송

4. 이벤트 수신

- 전송된 이벤트는 자동으로 화면에 표시됨
- 각 이벤트는 다음 정보를 포함함:
  - 사용자 이름
  - 이벤트 로그
  - 팀 이름
  - 경과 시간

## 참고사항

- WebSocket 연결이 끊어지면 5초마다 자동으로 재연결을 시도함
- Match ID가 변경되면 해당 경기에 대한 새로운 구독이 설정됨
- 모든 필드는 필수 입력임
- 현재는 토큰으로 ARCHIVES 권한이 있는 사용자의 ID를 사용하지만, 나중엔 JWT 토큰으로 바뀔 예정임
