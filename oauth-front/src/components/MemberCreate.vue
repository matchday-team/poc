<template>
    <v-container>
        <v-row justify="center">
            <v-col md="6">
                <v-card>
                    <v-card-title class="text-h5 text-center">
                        회원가입
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
                            <v-btn type="button" color="primary" block @click="memberCreate()">등록</v-btn>
                        </v-form>
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
      password: ""
    };
  },
  methods: {
    async memberCreate() {
      const registerData = {
        email: this.email,
        password: this.password
      };

      try {
        await axios.post(`${API_BASE_URL}/member/create`, registerData);
        window.location.href = "/";
      } catch (error) {
        console.error("회원가입 실패:", error.response?.data || error.message);
        alert("회원가입 중 오류가 발생했습니다.");
      }
    }
  }
}
</script>
