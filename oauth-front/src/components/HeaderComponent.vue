<template>
  <v-app-bar app dark>
    <v-container>
      <v-row align="center">
        <v-col>
          <span class="white--text font-weight-bold">MatchDay Oauth 테스트</span>
        </v-col>
        <v-col class="d-flex justify-end" align="center">
          <span v-if="isLogin" class="white--text mr-4">AccessToken 만료까지: {{ timeLeft }}</span>
          <v-btn v-if="!isLogin" :to="{ path: '/member/create' }">회원가입</v-btn>
          <v-btn v-if="!isLogin" :to="{ path: '/member/login' }">로그인</v-btn>
          <v-btn v-if="isLogin" @click="renewToken()">토큰 재발급</v-btn>
          <v-btn v-if="isLogin" @click="doLogout()">로그아웃</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-app-bar>
</template>

<script>
import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export default {
  data() {
    return {
      isLogin: false,
      timeLeft: '',
      intervalId: null,
    };
  },
  created() {
    const tokenFromCookie = Cookies.get("accessToken");
    if (tokenFromCookie) {
      localStorage.setItem("accessToken", tokenFromCookie);
      Cookies.remove("accessToken");
      window.location.href = "/";
    }

    const token = localStorage.getItem("accessToken");
    if (token) {
      this.isLogin = true;
      this.startTimer(token);
    }
  },
  methods: {
    startTimer(token) {
      const payload = parseJwt(token);
      if (!payload || !payload.exp) return;

      this.intervalId = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        const secondsLeft = payload.exp - now;

        if (secondsLeft <= 0) {
          this.timeLeft = "만료됨";
          clearInterval(this.intervalId);
          return;
        }

        const min = Math.floor(secondsLeft / 60);
        const sec = secondsLeft % 60;
        this.timeLeft = `${min.toString().padStart(2, '0')}분 ${sec.toString().padStart(2, '0')}초`;
      }, 1000);
    },

    async renewToken() {
      try {
        const response = await axios.post(`${API_BASE_URL}/open-api/v1/users/renew`, null, {
          withCredentials: true
        });
        const newAccessToken = response.data.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);
        clearInterval(this.intervalId);
        this.startTimer(newAccessToken);
        alert("토큰이 갱신되었습니다.");
      } catch (err) {
        console.error("토큰 갱신 실패:", err);
        alert("토큰 갱신에 실패했습니다.");
        this.doLogout();
      }
    },

    async doLogout() {
      try {
        await axios.post(`${API_BASE_URL}/api/v1/users/logout`, {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        });
      } catch (e) {
        console.warn("로그아웃 요청 실패 (무시)", e);
      }

      localStorage.removeItem("accessToken");
      clearInterval(this.intervalId);
      window.location.reload();
    }
  },
  beforeUnmount() {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
</script>


