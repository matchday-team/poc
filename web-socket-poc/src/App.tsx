import { useState, useEffect, useRef } from "react";
import { Client, IMessage, IFrame } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import "./App.css";

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
  const [token, setToken] = useState(localStorage.getItem("token") || "");
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

  useEffect(() => {
    localStorage.setItem("matchId", matchId);
    localStorage.setItem("teamId", teamId);
    localStorage.setItem("eventType", eventType);
    localStorage.setItem("description", description);
    localStorage.setItem("token", token);
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
    token,
    matchUserId,
    fromMatchUserId,
    toMatchUserId,
    exchangeMessage,
    cancelTeamId,
    cancelEventType,
  ]);

  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        setConnected(true);
        setError(null);
        console.log("Connected to WebSocket");

        // 개인 이벤트 구독
        client.subscribe(`/topic/match/${matchId}`, (message: IMessage) => {
          const event = JSON.parse(message.body);
          setEvents((prev) => [event, ...prev]);
        });

        client.subscribe("/user/queue/errors", (message: IMessage) => {
          const errorResponse: ApiResponse<any> = JSON.parse(message.body);
          setError(errorResponse.message);
          console.error("WebSocket Error:", errorResponse);
        });
      },
      onStompError: (frame: IFrame) => {
        console.error("Error connecting to WebSocket:", frame);
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
  }, [matchId, teamId]);

  // 경기 이벤트 유저 요청 (matchUserId 포함)
  const sendEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stompClient.current || !connected) return;

    const event: MatchEventUserRequest = {
      eventType,
      description,
      matchUserId: matchUserId ? Number(matchUserId) : 0,
    };

    const payload = {
      token: token || "",
      ...event,
    };

    stompClient.current.publish({
      destination: `/app/match/${matchId || "default"}`,
      body: JSON.stringify(payload),
    });
  };

  const sendTeamEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stompClient.current || !connected || !teamId) return;

    const event: TeamEventRequest = {
      eventType,
      description: description || undefined,
    };

    const payload = {
      token: token || "",
      ...event,
    };

    stompClient.current.publish({
      destination: `/app/match/${matchId}/teams/${teamId}`,
      body: JSON.stringify(payload),
    });
  };

  const cancelEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stompClient.current || !connected) return;

    const cancelRequest: MatchEventCancelRequest = {
      matchUserId: matchUserId ? Number(matchUserId) : undefined,
      teamId: cancelTeamId ? Number(cancelTeamId) : 0,
      matchEventType: cancelEventType,
    };

    const payload = {
      token: token || "",
      ...cancelRequest,
    };

    stompClient.current.publish({
      destination: `/app/match/${matchId}/cancel`,
      body: JSON.stringify(payload),
    });
  };

  const sendExchangeRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stompClient.current || !connected) return;

    const exchangeRequest: MatchUserExchangeRequest = {
      fromMatchUserId: fromMatchUserId ? Number(fromMatchUserId) : 0,
      toMatchUserId: toMatchUserId ? Number(toMatchUserId) : 0,
      message: exchangeMessage,
    };

    const payload = {
      token: token || "",
      ...exchangeRequest,
    };

    stompClient.current.publish({
      destination: `/app/match/${matchId || "default"}/exchange`,
      body: JSON.stringify(payload),
    });
  };

  return (
    <div className="app-container">
      <h1>Match Event Recorder</h1>

      <div className="connection-status">
        Status: {connected ? "Connected" : "Disconnected"}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="event-form">
        <h2>Record Player Event</h2>
        <form onSubmit={sendEvent}>
          <div>
            <label>Match ID:</label>
            <input
              type="text"
              value={matchId}
              onChange={(e) => setMatchId(e.target.value)}
              placeholder="Enter match ID"
            />
          </div>
          <div>
            <label>Token:</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter token"
            />
          </div>
          <div>
            <label>Match User ID:</label>
            <input
              type="text"
              value={matchUserId}
              onChange={(e) => setMatchUserId(e.target.value)}
              placeholder="Enter match user ID"
            />
          </div>
          <div>
            <label>Event Type:</label>
            <input
              type="text"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              placeholder="Enter event type"
            />
          </div>
          <div>
            <label>Description:</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
            />
          </div>
          <button type="submit" disabled={!connected}>
            Send Player Event
          </button>
        </form>
      </div>

      <div className="event-form">
        <h2>Record Team Event</h2>
        <form onSubmit={sendTeamEvent}>
          <div>
            <label>Match ID:</label>
            <input
              type="text"
              value={matchId}
              onChange={(e) => setMatchId(e.target.value)}
              placeholder="Enter match ID"
            />
          </div>
          <div>
            <label>Team ID:</label>
            <input
              type="text"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              placeholder="Enter team ID"
            />
          </div>
          <div>
            <label>Token:</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter token"
            />
          </div>
          <div>
            <label>Event Type:</label>
            <input
              type="text"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              placeholder="Enter event type"
            />
          </div>
          <div>
            <label>Description:</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
            />
          </div>
          <button type="submit" disabled={!connected || !teamId}>
            Send Team Event
          </button>
        </form>
      </div>

      <div className="event-form">
        <h2>Cancel Event</h2>
        <form onSubmit={cancelEvent}>
          <div>
            <label>Match ID:</label>
            <input
              type="text"
              value={matchId}
              onChange={(e) => setMatchId(e.target.value)}
              placeholder="Enter match ID"
            />
          </div>
          <div>
            <label>Token:</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter token"
            />
          </div>
          <div>
            <label>Match User ID (optional):</label>
            <input
              type="text"
              value={matchUserId}
              onChange={(e) => setMatchUserId(e.target.value)}
              placeholder="Enter match user ID"
            />
          </div>
          <div>
            <label>Team ID:</label>
            <input
              type="text"
              value={cancelTeamId}
              onChange={(e) => setCancelTeamId(e.target.value)}
              placeholder="Enter team ID"
            />
          </div>
          <div>
            <label>Event Type:</label>
            <input
              type="text"
              value={cancelEventType}
              onChange={(e) => setCancelEventType(e.target.value)}
              placeholder="Enter event type to cancel"
            />
          </div>
          <button
            type="submit"
            disabled={!connected || !cancelTeamId || !cancelEventType}
          >
            Cancel Event
          </button>
        </form>
      </div>

      <div className="exchange-form">
        <h2>Player Exchange</h2>
        <form onSubmit={sendExchangeRequest}>
          <div>
            <label>Token:</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter token"
            />
          </div>
          <div>
            <label>From Match User ID:</label>
            <input
              type="text"
              value={fromMatchUserId}
              onChange={(e) => setFromMatchUserId(e.target.value)}
              placeholder="Enter from match user ID"
            />
          </div>
          <div>
            <label>To Match User ID:</label>
            <input
              type="text"
              value={toMatchUserId}
              onChange={(e) => setToMatchUserId(e.target.value)}
              placeholder="Enter to match user ID"
            />
          </div>
          <div>
            <label>Exchange Message:</label>
            <input
              type="text"
              value={exchangeMessage}
              onChange={(e) => setExchangeMessage(e.target.value)}
              placeholder="Enter exchange message"
            />
          </div>
          <button type="submit" disabled={!connected}>
            Exchange Player
          </button>
        </form>
      </div>

      <div className="events-list">
        <h2>Recent Events</h2>
        <ul>
          {events.map((event, index) => (
            <li key={index}>
              <strong>{event.userName}</strong> - {event.eventLog}
              <br />
              <small>
                Team: {event.teamName} | Time: {event.elapsedMinutes}'
              </small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
