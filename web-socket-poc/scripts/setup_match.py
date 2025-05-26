import datetime
import uuid

import requests

BASE_URL = "http://localhost:8080/api/v1"


def format_response(response_json):
    """응답 JSON을 보기 좋게 포맷팅"""
    data = response_json.get("data", {})
    return f"ID: {data} | 상태: {response_json.get('status', 'N/A')} | 메시지: {response_json.get('message', 'N/A')}"


def create_user(name):
    url = f"{BASE_URL}/users"
    payload = {"name": name}
    response = requests.post(url, json=payload)
    response_json = response.json()
    print(f"[유저 생성] 이름: {name} | {format_response(response_json)}")
    return response_json["data"]


def create_team(name, team_color):
    """_summary_
    팀 생성 Method

    Args:
        name (_type_): 홍길동
        teamColor (_type_): #FFFFFF

    Returns:
        _type_: _description_
    """
    url = f"{BASE_URL}/teams"
    payload = {
        "name": name,
        "teamColor": team_color,
        "bottomColor": team_color,
        "stockingColor": team_color,
    }
    response = requests.post(url, json=payload)
    response_json = response.json()
    print(
        f"[팀 생성] 이름: {name} | 색상: {team_color} | {format_response(response_json)}"
    )
    return response_json["data"]


def join_team(user_id, team_id, number, position):
    url = f"{BASE_URL}/users/{user_id}/teams"
    payload = {"teamId": team_id, "number": number, "defaultPosition": position}
    response = requests.post(url, json=payload)
    response_json = response.json()
    print(
        f"[팀 가입] 유저ID: {user_id} | 팀ID: {team_id} | 번호: {number} | 포지션: {position} | {format_response(response_json)}"
    )
    return response_json["data"]


def create_match(title, home_team_id, away_team_id):
    url = f"{BASE_URL}/matches"
    match_date = datetime.datetime.now().strftime("%Y-%m-%d")
    # hh:mm:ss 형식
    planed_start_time = datetime.datetime.now().strftime("%H:%M:%S")
    planed_end_time = (datetime.datetime.now() + datetime.timedelta(hours=1)).strftime(
        "%H:%M:%S"
    )

    payload = {
        "title": title,
        "homeTeamId": home_team_id,
        "awayTeamId": away_team_id,
        "matchType": "리그",
        "stadium": "홈구장",
        "matchDate": match_date,
        "plannedStartTime": planed_start_time,
        "plannedEndTime": planed_end_time,
        "firstHalfPeriod": 45,
        "secondHalfPeriod": 45,
    }
    response = requests.post(url, json=payload)
    response_json = response.json()
    print(
        f"[경기 생성] 제목: {title} | 홈팀: {home_team_id} | 원정팀: {away_team_id} | {format_response(response_json)}"
    )
    return response_json["data"]


def register_match_user(match_id, user_id, team_id, role):
    url = f"{BASE_URL}/matches/{match_id}/users"
    payload = {
        "userId": user_id,
        "teamId": team_id,
        "role": role,
        "matchPosition": "FW",
        "matchGrid": "1",
    }
    response = requests.post(url, json=payload)
    response_json = response.json()
    team_info = f"팀ID: {team_id}" if team_id else "팀ID: 없음"
    print(
        f"[경기 참여] 매치ID: {match_id} | 유저ID: {user_id} | {team_info} | 역할: {role} | {format_response(response_json)}"
    )


def start_match(match_id: int) -> None:
    url = f"{BASE_URL}/matches/{match_id}/time"
    payload = {"halfType": "FIRST_HALF", "timeType": "START_TIME", "time": "14:30:00"}
    response = requests.patch(url, json=payload)
    response_json = response.json()
    print(f"[경기 시작] 매치ID: {match_id} | {format_response(response_json)}")


def main():
    print("\n========== 테스트 설정 시작 ==========\n")

    # Create users
    print("\n----- 유저 생성 -----")
    hong_id = create_user(str(uuid.uuid4())[:3])
    lee_id = create_user(str(uuid.uuid4())[:3])
    jang_id = create_user(str(uuid.uuid4())[:3])
    kang_id = create_user(str(uuid.uuid4())[:3])

    # Create teams
    print("\n----- 팀 생성 -----")
    team1_name = str(uuid.uuid4())
    team2_name = str(uuid.uuid4())
    team1_id = create_team(team1_name, "#FFFFFF")
    team2_id = create_team(team2_name, "#000000")

    # Join teams
    print("\n----- 팀 가입 -----")
    join_team(hong_id, team1_id, 7, "FW")
    join_team(lee_id, team1_id, 7, "FW")
    join_team(jang_id, team2_id, 7, "FW")

    # Create match
    print("\n----- 경기 생성 -----")
    match_id = create_match(team1_name + " vs " + team2_name, team1_id, team2_id)

    # Register match users
    print("\n----- 경기 참여 등록 -----")
    register_match_user(match_id, hong_id, team1_id, "START_PLAYER")
    register_match_user(match_id, lee_id, team1_id, "SUB_PLAYER")
    register_match_user(match_id, jang_id, team2_id, "START_PLAYER")
    register_match_user(match_id, kang_id, None, "ARCHIVES")

    # 경기 시작
    print("\n----- 경기 시작 -----")
    start_match(match_id)

    print("\n========== 테스트 설정 완료 ==========\n")
    print(f"생성된 매치 ID: {match_id}")
    print(f"팀1 ID: {team1_id} | 팀2 ID: {team2_id}")
    print(f"선수1 ID: {hong_id} | 선수2 ID: {jang_id}")
    print(f"기록담당자 ID: {kang_id}")


if __name__ == "__main__":
    main()
