<template>
  <div>
    카카오 로그인 진행중...
  </div>
</template>

<script>
import axios from 'axios';

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
        // ✅ redirectUri 제거됨
      };
      console.log("📦 서버로 전송할 요청 JSON:", JSON.stringify(requestBody, null, 2));

      try {
        const response = await axios.post(
          "http://localhost:8080/open-api/v1/users/kakao",
          requestBody,
          {
            withCredentials: true
          }
        );

        const token = response.data.data.accessToken;
        localStorage.setItem("accessToken", token);
        window.location.href = "/";
      } catch (error) {
        console.error("❌ 로그인 실패:", error.response?.data || error.message);
        alert("카카오 로그인 중 오류가 발생했습니다.");
      }
    }
  }
}
</script>
