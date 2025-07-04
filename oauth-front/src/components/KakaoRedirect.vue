<template>
  <div>
    카카오 로그인 진행중...
  </div>
</template>

<script>
import axios from 'axios';

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL;

export default {
  created() {
    const code = new URL(window.location.href).searchParams.get("code");
    console.log("✅ 인가 코드:", code);
    this.sendCodeToServer(code);
  },
  methods: {
    async sendCodeToServer(code) {
      const requestBody = {
        code
        // redirectUri 필요시 여기에 추가
      };
      console.log("📦 서버로 전송할 요청 JSON:", JSON.stringify(requestBody, null, 2));

      try {
        const response = await axios.post(
          `${API_BASE_URL}/open-api/v1/users/kakao`,
          requestBody,
          {
            withCredentials: true
          }
        );

        const token = response.data.data.accessToken;
        localStorage.setItem("accessToken", token);
        
        // JWT 토큰에서 사용자 정보 추출
        const userInfo = this.getUserInfoFromToken(token);
        
        // 사용자 상태에 따라 리다이렉트
        if (userInfo && userInfo.userLifecycle === 'PENDING') {
          // 프로필 미완성 상태면 프로필 완성 페이지로
          this.$router.push(`/profile/complete/${userInfo.userId}`);
        } else {
          // 완성된 사용자면 메인 페이지로
          this.$router.push('/');
        }
      } catch (error) {
        console.error("❌ 로그인 실패:", error.response?.data || error.message);
        alert("카카오 로그인 중 오류가 발생했습니다.");
      }
    },

    // JWT 토큰에서 사용자 정보 추출
    getUserInfoFromToken(token) {
      try {
        if (!token) return null;
        
        // JWT 토큰 디코딩
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
          userId: payload.userId,
          userLifecycle: payload.userLifecycle
        };
      } catch (error) {
        console.error('토큰에서 사용자 정보 추출 실패:', error);
        return null;
      }
    }
  }
}
</script>