import { useState, useEffect, useRef } from "react";
import { Client, IMessage, IFrame } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import "./App.css";

// 컴포넌트 가져오기
import PlayerEventForm from "./components/PlayerEventForm";
import TeamEventForm from "./components/TeamEventForm";
import CancelEventForm from "./components/CancelEventForm";
import ExchangePlayerForm from "./components/ExchangePlayerForm";
import EventList from "./components/EventList";

// 인터페이스 정의
interface MatchEventRequest {
  eventType: string;
  description: string;
}

interface MatchEventUserRequest extends MatchEventRequest {
  matchUserId: number;
}

interface TeamEventRequest {
  eventType: string;
  description?: string;
}

interface MatchEventCancelRequest {
  matchUserId?: number;
  teamId: number;
  matchEventType: string;
}

interface MatchUserExchangeRequest {
  fromMatchUserId: number;
  toMatchUserId: number;
  message: string;
}

interface MatchEventResponse {
  id: number;
  elapsedMinutes: number;
  teamId: number;
  teamName: string;
  userName: string;
  userId: number;
  eventLog: string;
}

interface ApiResponse<T> {
  status: string;
  message: string;
  data?: T;
}

function App() {
  // 상태 관리
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<MatchEventResponse[]>([]);
  const [matchId, setMatchId] = useState(localStorage.getItem("matchId") || "");
  const [teamId, setTeamId] = useState(localStorage.getItem("teamId") || "");
  const [eventType, setEventType] = useState(
    localStorage.getItem("eventType") || ""
  );
  const [description, setDescription] = useState(
    localStorage.getItem("description") || ""
  );
  const [matchUserId, setMatchUserId] = useState(
    localStorage.getItem("matchUserId") || ""
  );
  const [fromMatchUserId, setFromMatchUserId] = useState(
    localStorage.getItem("fromMatchUserId") || ""
  );
  const [toMatchUserId, setToMatchUserId] = useState(
    localStorage.getItem("toMatchUserId") || ""
  );
  const [exchangeMessage, setExchangeMessage] = useState(
    localStorage.getItem("exchangeMessage") || ""
  );
  const [cancelTeamId, setCancelTeamId] = useState(
    localStorage.getItem("cancelTeamId") || ""
  );
  const [cancelEventType, setCancelEventType] = useState(
    localStorage.getItem("cancelEventType") || ""
  );
  const [error, setError] = useState<string | null>(null);
  const stompClient = useRef<Client | null>(null);

  // 로컬 스토리지에 상태 저장
  useEffect(() => {
    localStorage.setItem("matchId", matchId);
    localStorage.setItem("teamId", teamId);
    localStorage.setItem("eventType", eventType);
    localStorage.setItem("description", description);
    localStorage.setItem("matchUserId", matchUserId);
    localStorage.setItem("fromMatchUserId", fromMatchUserId);
    localStorage.setItem("toMatchUserId", toMatchUserId);
    localStorage.setItem("exchangeMessage", exchangeMessage);
    localStorage.setItem("cancelTeamId", cancelTeamId);
    localStorage.setItem("cancelEventType", cancelEventType);
  }, [
    matchId,
    teamId,
    eventType,
    description,
    matchUserId,
    fromMatchUserId,
    toMatchUserId,
    exchangeMessage,
    cancelTeamId,
    cancelEventType,
  ]);

  // WebSocket 연결 설정
  useEffect(() => {
    const socket = new SockJS("https://dev-api.matchday-planner.com/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        setConnected(true);
        setError(null);
        console.log("WebSocket에 연결되었습니다");

        // 매치 이벤트 구독
        client.subscribe(`/topic/match/${matchId}`, (message: IMessage) => {
          const event = JSON.parse(message.body);
          setEvents((prev) => [event, ...prev]);
        });

        // 에러 메시지 구독
        client.subscribe("/user/queue/errors", (message: IMessage) => {
          const errorResponse: ApiResponse<any> = JSON.parse(message.body);
          setError(errorResponse.message);
          console.error("WebSocket 에러:", errorResponse);
        });
      },
      onStompError: (frame: IFrame) => {
        console.error("WebSocket 연결 오류:", frame);
        setConnected(false);
        setError("WebSocket 연결 오류가 발생했습니다.");
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.activate();
    stompClient.current = client;

    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, [matchId]);

  // 선수 이벤트 전송
  const sendEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stompClient.current || !connected) return;

    const event: MatchEventUserRequest = {
      eventType,
      description,
      matchUserId: matchUserId ? Number(matchUserId) : 0,
    };

    stompClient.current.publish({
      destination: `/app/match/${matchId || "default"}`,
      body: JSON.stringify(event),
    });
  };

  // 팀 이벤트 전송
  const sendTeamEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stompClient.current || !connected || !teamId) return;

    const event: TeamEventRequest = {
      eventType,
      description: description || undefined,
    };

    stompClient.current.publish({
      destination: `/app/match/${matchId}/teams/${teamId}`,
      body: JSON.stringify(event),
    });
  };

  // 이벤트 취소
  const cancelEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stompClient.current || !connected) return;

    const cancelRequest: MatchEventCancelRequest = {
      matchUserId: matchUserId ? Number(matchUserId) : undefined,
      teamId: cancelTeamId ? Number(cancelTeamId) : 0,
      matchEventType: cancelEventType,
    };

    stompClient.current.publish({
      destination: `/app/match/${matchId}/cancel`,
      body: JSON.stringify(cancelRequest),
    });
  };

  // 선수 교체
  const sendExchangeRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stompClient.current || !connected) return;

    const exchangeRequest: MatchUserExchangeRequest = {
      fromMatchUserId: fromMatchUserId ? Number(fromMatchUserId) : 0,
      toMatchUserId: toMatchUserId ? Number(toMatchUserId) : 0,
      message: exchangeMessage,
    };

    stompClient.current.publish({
      destination: `/app/match/${matchId || "default"}/exchange`,
      body: JSON.stringify(exchangeRequest),
    });
  };

  return (
    <div
      className="app-container"
      style={{
        width: "100%",
        maxWidth: "none",
        overflow: "hidden",
        borderRadius: "8px",
      }}
    >
      <h1>경기 이벤트 기록기</h1>

      <div
        className={`connection-status ${
          connected ? "connected" : "disconnected"
        }`}
        style={{ borderRadius: "8px" }}
      >
        {connected ? "WebSocket 연결됨" : "WebSocket 연결 끊김"}
      </div>

      {error && (
        <div className="error-message" style={{ borderRadius: "8px" }}>
          {error}
        </div>
      )}

      <div
        className="main-layout"
        style={{ width: "100%", overflow: "hidden" }}
      >
        <div className="dashboard" style={{ width: "100%" }}>
          <div className="column">
            <PlayerEventForm
              matchId={matchId}
              matchUserId={matchUserId}
              eventType={eventType}
              description={description}
              connected={connected}
              onMatchIdChange={setMatchId}
              onMatchUserIdChange={setMatchUserId}
              onEventTypeChange={setEventType}
              onDescriptionChange={setDescription}
              onSubmit={sendEvent}
            />

            <TeamEventForm
              matchId={matchId}
              teamId={teamId}
              eventType={eventType}
              description={description}
              connected={connected}
              onMatchIdChange={setMatchId}
              onTeamIdChange={setTeamId}
              onEventTypeChange={setEventType}
              onDescriptionChange={setDescription}
              onSubmit={sendTeamEvent}
            />
          </div>

          <div className="column">
            <CancelEventForm
              matchId={matchId}
              matchUserId={matchUserId}
              cancelTeamId={cancelTeamId}
              cancelEventType={cancelEventType}
              connected={connected}
              onMatchIdChange={setMatchId}
              onMatchUserIdChange={setMatchUserId}
              onCancelTeamIdChange={setCancelTeamId}
              onCancelEventTypeChange={setCancelEventType}
              onSubmit={cancelEvent}
            />

            <ExchangePlayerForm
              matchId={matchId}
              fromMatchUserId={fromMatchUserId}
              toMatchUserId={toMatchUserId}
              exchangeMessage={exchangeMessage}
              connected={connected}
              onMatchIdChange={setMatchId}
              onFromMatchUserIdChange={setFromMatchUserId}
              onToMatchUserIdChange={setToMatchUserId}
              onExchangeMessageChange={setExchangeMessage}
              onSubmit={sendExchangeRequest}
            />
          </div>
        </div>

        <div className="events-container">
          <EventList events={events} />
        </div>
      </div>
    </div>
  );
}

export default App;
