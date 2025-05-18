import React from "react";

interface CancelEventFormProps {
  matchId: string;
  matchUserId: string;
  cancelTeamId: string;
  cancelEventType: string;
  connected: boolean;
  onMatchIdChange: (value: string) => void;
  onMatchUserIdChange: (value: string) => void;
  onCancelTeamIdChange: (value: string) => void;
  onCancelEventTypeChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const CancelEventForm: React.FC<CancelEventFormProps> = ({
  matchId,
  matchUserId,
  cancelTeamId,
  cancelEventType,
  connected,
  onMatchIdChange,
  onMatchUserIdChange,
  onCancelTeamIdChange,
  onCancelEventTypeChange,
  onSubmit,
}) => {
  return (
    <div className="card event-form">
      <h2>이벤트 취소</h2>
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
          <label>매치 유저 ID (선택사항):</label>
          <input
            type="text"
            value={matchUserId}
            onChange={(e) => onMatchUserIdChange(e.target.value)}
            placeholder="매치 유저 ID 입력"
          />
        </div>
        <div>
          <label>팀 ID:</label>
          <input
            type="text"
            value={cancelTeamId}
            onChange={(e) => onCancelTeamIdChange(e.target.value)}
            placeholder="팀 ID 입력"
          />
        </div>
        <div>
          <label>이벤트 유형:</label>
          <input
            type="text"
            value={cancelEventType}
            onChange={(e) => onCancelEventTypeChange(e.target.value)}
            placeholder="취소할 이벤트 유형 입력 (예: GOAL)"
          />
        </div>
        <button
          type="submit"
          disabled={!connected || !cancelTeamId || !cancelEventType}
        >
          이벤트 취소
        </button>
      </form>
    </div>
  );
};

export default CancelEventForm;
