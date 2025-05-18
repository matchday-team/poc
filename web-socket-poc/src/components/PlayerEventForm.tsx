import React from "react";

interface MatchEventUserRequest {
  eventType: string;
  description: string;
  matchUserId: number;
}

interface PlayerEventFormProps {
  matchId: string;
  matchUserId: string;
  eventType: string;
  description: string;
  connected: boolean;
  onMatchIdChange: (value: string) => void;
  onMatchUserIdChange: (value: string) => void;
  onEventTypeChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const PlayerEventForm: React.FC<PlayerEventFormProps> = ({
  matchId,
  matchUserId,
  eventType,
  description,
  connected,
  onMatchIdChange,
  onMatchUserIdChange,
  onEventTypeChange,
  onDescriptionChange,
  onSubmit,
}) => {
  return (
    <div className="card event-form">
      <h2>선수 이벤트 기록</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label>매치 ID:</label>
          <input
            type="text"
            value={matchId}
            onChange={(e) => onMatchIdChange(e.target.value)}
            placeholder="매치 ID 입력"
          />
        </div>
        <div>
          <label>매치 유저 ID:</label>
          <input
            type="text"
            value={matchUserId}
            onChange={(e) => onMatchUserIdChange(e.target.value)}
            placeholder="매치 유저 ID 입력"
          />
        </div>
        <div>
          <label>이벤트 유형:</label>
          <input
            type="text"
            value={eventType}
            onChange={(e) => onEventTypeChange(e.target.value)}
            placeholder="이벤트 유형 입력 (예: GOAL)"
          />
        </div>
        <div>
          <label>설명:</label>
          <input
            type="text"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="이벤트 설명 입력"
          />
        </div>
        <button type="submit" disabled={!connected}>
          선수 이벤트 전송
        </button>
      </form>
    </div>
  );
};

export default PlayerEventForm;
