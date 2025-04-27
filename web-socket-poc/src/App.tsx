import { useState, useEffect, useRef } from 'react'
import { Client, IMessage, IFrame } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import './App.css'

interface MatchEventRequest {
  userId: number;
  eventType: string;
  description: string;
}

interface MatchEventResponse {
  id: number;
  elapsedMinutes: number;
  teamId: number;
  teamName: string;
  userId: number;
  userName: string;
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
  const [matchId, setMatchId] = useState(localStorage.getItem('matchId') || '');
  const [eventType, setEventType] = useState(localStorage.getItem('eventType') || '');
  const [description, setDescription] = useState(localStorage.getItem('description') || '');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
  const [error, setError] = useState<string | null>(null);
  const stompClient = useRef<Client | null>(null);

  useEffect(() => {
    localStorage.setItem('matchId', matchId);
    localStorage.setItem('eventType', eventType);
    localStorage.setItem('description', description);
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
  }, [matchId, eventType, description, token, userId]);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        setConnected(true);
        setError(null);
        console.log('Connected to WebSocket');

        client.subscribe(`/topic/match/${matchId}`, (message: IMessage) => {
          const event = JSON.parse(message.body);
          setEvents(prev => [event, ...prev]);
        });

        client.subscribe('/user/queue/errors', (message: IMessage) => {
          const errorResponse: ApiResponse<any> = JSON.parse(message.body);
          setError(errorResponse.message);
          console.error('WebSocket Error:', errorResponse);
        });
      },
      onStompError: (frame: IFrame) => {
        console.error('Error connecting to WebSocket:', frame);
        setConnected(false);
        setError('WebSocket 연결 오류가 발생했습니다.');
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });

    client.activate();
    stompClient.current = client;

    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, [matchId]);

  const sendEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stompClient.current || !connected) return;

    const event: MatchEventRequest = {
      userId: userId ? Number(userId) : 0,
      eventType,
      description
    };

    const message = {
      token: token || '',
      data: event
    };

    stompClient.current.publish({
      destination: `/app/match/${matchId || 'default'}`,
      body: JSON.stringify(message)
    });
  };

  return (
    <div className="app-container">
      <h1>Match Event Recorder</h1>
      
      <div className="connection-status">
        Status: {connected ? 'Connected' : 'Disconnected'}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="event-form">
        <h2>Record Event</h2>
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
            <label>User ID:</label>
            <input 
              type="text" 
              value={userId} 
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID"
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
          <button type="submit" disabled={!connected}>Send Event</button>
        </form>
      </div>

      <div className="events-list">
        <h2>Recent Events</h2>
        <ul>
          {events.map((event, index) => (
            <li key={index}>
              <strong>{event.userName}</strong> - {event.eventLog}
              <br />
              <small>Team: {event.teamName} | Time: {event.elapsedMinutes}'</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
