import requests

BASE_URL = "http://localhost:8080/api/v1"


def create_user(name):
    url = f"{BASE_URL}/users"
    payload = {"name": name}
    response = requests.post(url, json=payload)
    print(f"Created user {name}: {response.json()}")
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
    payload = {"name": name, "teamColor": team_color}
    response = requests.post(url, json=payload)
    print(f"Created team {name}: {response.json()}")
    return response.json()["data"]


def join_team(user_id, team_id, number, position):
    url = f"{BASE_URL}/users/{user_id}/teams"
    payload = {"teamId": team_id, "number": number, "defaultPosition": position}
    response = requests.post(url, json=payload)
    print(f"User {user_id} joined team {team_id}: {response.json()}")
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
        "startTime": "14:30:00",
        "endTime": "16:30:00",
    }
    response = requests.post(url, json=payload)
    print(f"Created match {title}: {response.json()}")
    return 1  # Assuming match ID is 1


def register_match_user(match_id, user_id, role):
    url = f"{BASE_URL}/matches/{match_id}/users"
    payload = {
        "userId": user_id,
        "role": role,
        "matchPosition": "FW",
        "matchGrid": "A1",
    }
    response = requests.post(url, json=payload)
    print(f"Registered user {user_id} for match {match_id}: {response.json()}")


def main():
    # Create users
    hong_id = create_user("국길동")
    jang_id = create_user("킹길동")
    kang_id = create_user("왕길동")

    # Create teams
    real_id = create_team("레알", "#FFFFFF")
    tottenham_id = create_team("토트넘", "#000000")

    # Join teams
    join_team(hong_id, real_id, 7, "FW")
    join_team(jang_id, tottenham_id, 7, "FW")

    # Create match
    match_id = create_match("레알 vs 토트넘", real_id, tottenham_id)

    # Register match users
    register_match_user(match_id, hong_id, "START_PLAYER")
    register_match_user(match_id, jang_id, "START_PLAYER")
    register_match_user(match_id, kang_id, "ARCHIVES")


if __name__ == "__main__":
    main()
