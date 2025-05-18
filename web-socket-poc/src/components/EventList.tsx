import React from "react";

interface MatchEventResponse {
  id: number;
  elapsedMinutes: number;
  teamId: number;
  teamName: string;
  userName: string;
  userId: number;
  eventLog: string;
}

interface EventListProps {
  events: MatchEventResponse[];
}

const EventList: React.FC<EventListProps> = ({ events }) => {
  return (
    <div
      className="card events-list"
      style={{ borderRadius: "8px", overflow: "hidden" }}
    >
      <h2>최근 이벤트</h2>
      <div style={{ overflow: "auto", height: "calc(100% - 50px)" }}>
        {events.length === 0 ? (
          <p className="no-events">아직 이벤트가 없습니다.</p>
        ) : (
          <ul>
            {events.map((event, index) => (
              <li key={index}>
                <strong>{event.userName}</strong> - {event.eventLog}
                <br />
                <small>
                  팀: {event.teamName} | 시간: {event.elapsedMinutes}'
                </small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EventList;
