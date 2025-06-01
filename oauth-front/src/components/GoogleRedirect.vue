<template>
    <div>
        구글 로그인 진행중...
    </div>
</template>

<script>
import axios from 'axios';

export default {
    created() {
        const code = new URL(window.location.href).searchParams.get("code");
        this.sendCodeToServer(code);
    },
    methods: {
        async sendCodeToServer(code) {
            try {
                const response = await axios.post("http://localhost:8080/open-api/v1/users/google", { code }, {
                    withCredentials: true // HttpOnly 쿠키 받기 위해 필수
                });

                const token = response.data.data.accessToken;
                localStorage.setItem("accessToken", token);
                window.location.href = "/";
            } catch (error) {
                console.error("구글 로그인 실패", error);
            }
        }
    }
}
</script>