<template>
    <div>
        구글 로그인 진행중...
    </div>
</template>

<script>
import axios from 'axios';

export default{
    created(){
        const code = new URL(window.location.href).searchParams.get("code");
        this.sendCodeToServer(code);
    },
    methods:{
        async sendCodeToServer(code){
            const response = await axios.post("http://localhost:8080/api/v1/auth/oauth/google", {code});//body 담아 json 형식으로 넘겨주기
            const token = response.data.data.token;
            localStorage.setItem("token", token);
            window.location.href = "/";// console.log 볼꺼면 주석처리하세용
        }
    }
}
</script>