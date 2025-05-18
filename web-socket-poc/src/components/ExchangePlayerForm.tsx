import React from "react";

interface ExchangePlayerFormProps {
  matchId: string;
  fromMatchUserId: string;
  toMatchUserId: string;
  exchangeMessage: string;
  connected: boolean;
  onMatchIdChange: (value: string) => void;
  onFromMatchUserIdChange: (value: string) => void;
  onToMatchUserIdChange: (value: string) => void;
  onExchangeMessageChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const ExchangePlayerForm: React.FC<ExchangePlayerFormProps> = ({
  matchId,
  fromMatchUserId,
  toMatchUserId,
  exchangeMessage,
  connected,
  onMatchIdChange,
  onFromMatchUserIdChange,
  onToMatchUserIdChange,
  onExchangeMessageChange,
  onSubmit,
}) => {
  return (
    <div className="card exchange-form">
      <h2>선수 교체</h2>
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
          <label>교체 대상 선수 ID:</label>
          <input
            type="text"
            value={fromMatchUserId}
            onChange={(e) => onFromMatchUserIdChange(e.target.value)}
            placeholder="교체 대상 선수 ID 입력"
          />
        </div>
        <div>
          <label>교체 투입 선수 ID:</label>
          <input
            type="text"
            value={toMatchUserId}
            onChange={(e) => onToMatchUserIdChange(e.target.value)}
            placeholder="교체 투입 선수 ID 입력"
          />
        </div>
        <div>
          <label>교체 메시지:</label>
          <input
            type="text"
            value={exchangeMessage}
            onChange={(e) => onExchangeMessageChange(e.target.value)}
            placeholder="교체 이유 입력"
          />
        </div>
        <button type="submit" disabled={!connected}>
          선수 교체
        </button>
      </form>
    </div>
  );
};

export default ExchangePlayerForm;
