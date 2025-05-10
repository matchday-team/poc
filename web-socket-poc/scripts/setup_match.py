import uuid

import requests

BASE_URL = "http://localhost:8080/api/v1"


def create_user(name):
    url = f"{BASE_URL}/users"
    payload = {"name": name}
    response = requests.post(url, json=payload)
    print(f"Created user {response.json()['data']}: {response.json()}")
    return response.json()["data"]


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
    print(f"Created team {name}: {response.json()}")
    return response.json()["data"]


def join_team(user_id, team_id, number, position):
    url = f"{BASE_URL}/users/{user_id}/teams"
    payload = {"teamId": team_id, "number": number, "defaultPosition": position}
    response = requests.post(url, json=payload)
    print(f"User {user_id}  {team_id}: {response.json()}")
    return response.json()["data"]


def create_match(title, home_team_id, away_team_id):
    url = f"{BASE_URL}/matches"
    payload = {
        "title": title,
        "homeTeamId": home_team_id,
        "awayTeamId": away_team_id,
        "matchType": "리그",
        "stadium": "홈구장",
        "matchDate": "2999-04-22",
        "plannedStartTime": "14:30:00",
        "plannedEndTime": "14:30:00",
        "matchState": "SCHEDULED",
    }
    response = requests.post(url, json=payload)
    print(f"Created match {title}: {response.json()}")
    return response.json()["data"]


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
    print(f"Registered user {user_id} for match {match_id} as {role}: {response.json()}")


def main():
    # Create users
    hong_id = create_user(str(uuid.uuid4())[:3])
    jang_id = create_user(str(uuid.uuid4())[:3])
    kang_id = create_user(str(uuid.uuid4())[:3])

    # Create teams
    team1_name = str(uuid.uuid4())
    team2_name = str(uuid.uuid4())
    team1_id = create_team(team1_name, "#FFFFFF")
    team2_id = create_team(team2_name, "#000000")

    # Join teams
    join_team(hong_id, team1_id, 7, "FW")
    join_team(jang_id, team2_id, 7, "FW")

    # Create match
    match_id = create_match(team1_name + " vs " + team2_name, team1_id, team2_id)

    # Register match users
    register_match_user(match_id, hong_id, team1_id, "START_PLAYER")
    register_match_user(match_id, jang_id, team2_id, "START_PLAYER")
    register_match_user(match_id, kang_id, None, "ARCHIVES")


if __name__ == "__main__":
    main()
