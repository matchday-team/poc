<template>
  <v-container>
    <v-card>
      <v-card-title>팀 목록</v-card-title>
      <v-card-text>

        <!-- 에러 메시지 시각화 -->
        <v-alert
          v-if="errorMessage"
          type="error"
          dismissible
          class="mb-4"
        >
          {{ errorMessage }}
        </v-alert>

        <v-btn color="primary" @click="fetchTeams">팀 목록 불러오기</v-btn>

        <v-data-table
          :headers="headers"
          :items="teams"
          class="elevation-1 mt-4"
          item-value="id"
        >
          <template v-slot:no-data>
            팀 데이터를 불러오려면 버튼을 눌러주세요.
          </template>
        </v-data-table>

      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import axios from 'axios';
import { ref } from 'vue';

export default {
  name: 'TeamList',
  setup() {
    const teams = ref([]);
    const errorMessage = ref('');
    const headers = [
      { text: 'ID', value: 'id' },
      { text: '팀 이름', value: 'name' },
    ];

    const fetchTeams = async () => {
      errorMessage.value = ''; // 이전 에러 초기화
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          const msg = '인증 토큰이 없습니다. 로그인 후 다시 시도해주세요.';
          console.error(msg);
          throw new Error(msg);
        }

        const response = await axios.get('http://localhost:8080/api/v1/teams', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        teams.value = response.data.data;
        console.log('팀 목록 요청 성공:', teams.value);
      } catch (error) {
        if (error.response) {
          const status = error.response.status;
          const msg = error.response.data?.message || '요청 실패';
          errorMessage.value = `오류 ${status}: ${msg}`;
          console.error(`API 오류 응답 [${status}]`, error.response);
        } else if (error.request) {
          errorMessage.value = '서버로부터 응답이 없습니다.';
          console.error('응답 없음 (No response)', error.request);
        } else {
          errorMessage.value = `요청 중 오류 발생: ${error.message}`;
          console.error('Axios 요청 오류:', error.message);
        }
      }
    };

    return {
      teams,
      headers,
      fetchTeams,
      errorMessage,
    };
  },
};
</script>
