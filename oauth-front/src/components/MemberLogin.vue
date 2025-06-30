<template>
    <v-container>
        <v-row justify="center">
            <v-col md="4">
                <v-card>
                    <v-card-title class="text-h5 text-center">
                        로그인
                    </v-card-title>
                    <v-card-text>
                        <v-form>
                            <v-text-field
                                label="email"
                                v-model="email"
                            >
                            </v-text-field>
                            <v-text-field
                                label="패스워드"
                                v-model="password"
                                type="password"
                            >
                            </v-text-field>
                            <v-btn type="button" color="primary" block @click="memberLogin()">로그인</v-btn>
                        </v-form>
                        <br>
                        <v-row>
                            <v-col cols="6" class="d-flex justify-center">
                                <img
                                    src="@/assets/google_login.png"
                                    style="max-height:40px; width:auto;"
                                    @click="googleLogin()"
                                />
                            </v-col>
                            <v-col cols="6" class="d-flex justify-center">
                                <img
                                    src="@/assets/kakao_login.png"
                                    style="max-height:40px; width:auto;"
                                    @click="kakaoLogin()"
                                />
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default {
  data() {
    return {
      email: "",
      password: "",
      googleUrl: "https://accounts.google.com/o/oauth2/auth",
      googleClientId: "1077528609885-o6liu8qvasp2fj4ojj2ufmgnc5bi42pj.apps.googleusercontent.com",
      googleRedirectUrl: "http://localhost:3000/oauth/google/redirect",
      googleScope: "openid email profile",
      kakaoUrl: "https://kauth.kakao.com/oauth/authorize",
      kakaoClientId: "874bba3fe98abf68721c8057ab1421a6",
      kakaoRedirectUrl: "http://localhost:3000/login/kakao-redirect",
    };
  },
  methods: {
    async memberLogin() {
      const loginData = {
        email: this.email,
        password: this.password
      };
      try {
        const response = await axios.post(`${API_BASE_URL}/member/doLogin`, loginData);
        const token = response.data.token;
        localStorage.setItem("token", token);
        window.location.href = "/";
      } catch (err) {
        console.error("로그인 실패:", err.response?.data || err.message);
        alert("로그인 실패");
      }
    },
    googleLogin() {
      const auth_uri = `${this.googleUrl}?client_id=${this.googleClientId}&redirect_uri=${this.googleRedirectUrl}&response_type=code&scope=${this.googleScope}`;
      console.log(auth_uri);
      window.location.href = auth_uri;
    },
    kakaoLogin() {
      const auth_uri = `${this.kakaoUrl}?client_id=${this.kakaoClientId}&redirect_uri=${this.kakaoRedirectUrl}&response_type=code`;
      window.location.href = auth_uri;
    },
    googleServerLogin() {
      window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
    }
  }
};
</script>
