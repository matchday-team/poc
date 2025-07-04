<template>
  <v-container>
    <v-row justify="center">
      <v-col md="8">
        <v-card>
          <v-card-title class="text-h5 text-center">
            프로필 완성
          </v-card-title>
          <v-card-text>
            <!-- 에러 메시지 -->
            <v-alert
              v-if="errorMessage"
              type="error"
              dismissible
              class="mb-4"
            >
              {{ errorMessage }}
            </v-alert>

            <!-- 성공 메시지 -->
            <v-alert
              v-if="successMessage"
              type="success"
              dismissible
              class="mb-4"
            >
              {{ successMessage }}
            </v-alert>

            <v-form ref="form" v-model="valid">
              <!-- 사용자 유형 선택 -->
              <v-radio-group v-model="formData.userType" :rules="[v => !!v || '사용자 유형을 선택하세요']" row>
                <template v-slot:label>
                  <div><strong>사용자 유형 *</strong></div>
                </template>
                <v-radio label="선수" value="PLAYER"></v-radio>
                <v-radio label="학부모" value="PARENT"></v-radio>
                <v-radio label="동아리운영" value="CLUB_MANAGER"></v-radio>
                <v-radio label="클럽/대회운영 주최자" value="ORGANIZER"></v-radio>
              </v-radio-group>

              <!-- 선수일 경우에만 표시되는 필드들 -->
              <div v-if="formData.userType === 'PLAYER'">
                <v-divider class="my-4"></v-divider>
                <h3 class="mb-3">선수 정보</h3>
                
                <!-- 신장 -->
                <v-text-field
                  label="신장 (cm)"
                  v-model.number="formData.height"
                  type="number"
                  :rules="heightRules"
                  suffix="cm"
                ></v-text-field>

                <!-- 체중 -->
                <v-text-field
                  label="체중 (kg)"
                  v-model.number="formData.weight"
                  type="number"
                  :rules="weightRules"
                  suffix="kg"
                ></v-text-field>

                <!-- 주발 -->
                <v-select
                  label="주발"
                  v-model="formData.footType"
                  :items="footTypeOptions"
                  :rules="[v => !!v || '주발을 선택하세요']"
                  item-title="text"
                  item-value="value"
                ></v-select>

                <!-- 포지션 -->
                <v-select
                  label="포지션"
                  v-model="formData.position"
                  :items="positionOptions"
                  :rules="[v => !!v || '포지션을 선택하세요']"
                  item-title="text"
                  item-value="value"
                ></v-select>
              </div>

              <!-- 제출 버튼 -->
              <v-btn 
                type="button" 
                color="primary" 
                block 
                @click="completeProfile"
                :disabled="!valid || loading"
                :loading="loading"
                class="mt-4"
              >
                프로필 완성
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  name: 'UserProfileComplete',
  data() {
    return {
      valid: false,
      loading: false,
      errorMessage: '',
      successMessage: '',
      formData: {
        userType: '',
        height: null,
        weight: null,
        footType: '',
        position: ''
      },
      footTypeOptions: [
        { text: '오른발', value: 'RIGHT' },
        { text: '왼발', value: 'LEFT' },
        { text: '양발', value: 'BOTH' }
      ],
      positionOptions: [
        { text: '골키퍼 (GK)', value: 'GK' },
        { text: '수비수 (DF)', value: 'DF' },
        { text: '미드필더 (MF)', value: 'MF' },
        { text: '공격수 (FW)', value: 'FW' }
      ]
    };
  },
  computed: {
    heightRules() {
      const rules = [];
      if (this.formData.userType === 'PLAYER') {
        rules.push(v => !!v || '신장을 입력하세요');
        rules.push(v => (v >= 100 && v <= 250) || '신장은 100-250cm 사이여야 합니다');
      }
      return rules;
    },
    weightRules() {
      const rules = [];
      if (this.formData.userType === 'PLAYER') {
        rules.push(v => !!v || '체중을 입력하세요');
        rules.push(v => (v >= 30 && v <= 200) || '체중은 30-200kg 사이여야 합니다');
      }
      return rules;
    }
  },
  watch: {
    // 사용자 유형이 변경될 때 선수 정보 초기화
    'formData.userType'(newType) {
      if (newType !== 'PLAYER') {
        this.formData.height = null;
        this.formData.weight = null;
        this.formData.footType = '';
        this.formData.position = '';
      }
    }
  },
  methods: {
    async completeProfile() {
      // 폼 유효성 검사
      const { valid } = await this.$refs.form.validate();
      if (!valid) {
        return;
      }

      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        // userId는 URL 파라미터에서 가져오거나, localStorage에서 가져올 수 있습니다
        const userId = this.$route.params.userId || this.getUserIdFromToken();
        
        if (!userId) {
          throw new Error('사용자 ID를 찾을 수 없습니다');
        }

        // API 요청 데이터 준비
        const requestData = {
          userType: this.formData.userType
        };

        // 선수인 경우에만 추가 정보 포함
        if (this.formData.userType === 'PLAYER') {
          requestData.height = this.formData.height;
          requestData.weight = this.formData.weight;
          requestData.footType = this.formData.footType;
          requestData.position = this.formData.position;
        }

        console.log('프로필 완성 요청 데이터:', requestData);

        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/open-api/v1/users/${userId}/profile/complete`,
          requestData,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('프로필 완성 응답:', response.data);

        // 새로운 토큰 저장
        if (response.data.data.accessToken) {
          localStorage.setItem('accessToken', response.data.data.accessToken);
        }

        this.successMessage = '프로필이 성공적으로 완성되었습니다!';
        
        // 3초 후 메인 페이지로 이동
        setTimeout(() => {
          this.$router.push('/');
        }, 3000);

      } catch (error) {
        console.error('프로필 완성 실패:', error);
        
        if (error.response) {
          const status = error.response.status;
          const errorData = error.response.data;
          
          if (status === 400 && errorData.customStatusCode) {
            // 커스텀 에러 메시지 처리
            this.errorMessage = errorData.message || '잘못된 요청입니다';
          } else {
            this.errorMessage = `오류 ${status}: ${errorData.message || '프로필 완성에 실패했습니다'}`;
          }
        } else if (error.request) {
          this.errorMessage = '서버로부터 응답이 없습니다. 네트워크 연결을 확인해주세요.';
        } else {
          this.errorMessage = `요청 중 오류 발생: ${error.message}`;
        }
      } finally {
        this.loading = false;
      }
    },

    // JWT 토큰에서 userId 추출 (간단한 방법)
    getUserIdFromToken() {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return null;
        
        // JWT 토큰 디코딩 (실제로는 jwt-decode 라이브러리 사용 권장)
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId;
      } catch (error) {
        console.error('토큰에서 userId 추출 실패:', error);
        return null;
      }
    }
  },

  mounted() {
    // 컴포넌트 로드 시 userId 확인
    const userId = this.$route.params.userId || this.getUserIdFromToken();
    if (!userId) {
      this.errorMessage = '사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.';
    }
  }
};
</script>

<style scoped>
.v-card {
  padding: 20px;
}
</style>