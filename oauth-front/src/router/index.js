import GoogleRedirect from "@/components/GoogleRedirect.vue";
import KakaoRedirect from "@/components/KakaoRedirect.vue";
import MemberCreate from "@/components/MemberCreate.vue";
import MemberLogin from "@/components/MemberLogin.vue";
import TeamList from "@/components/TeamList.vue";
import UserProfileComplete from "@/components/UserProfileComplete.vue"; // 이 줄을 추가하세요
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: '/',
    component: TeamList
  },
  {
    path: '/member/create',
    component: MemberCreate
  },
  {
    path: '/member/login',
    component: MemberLogin
  },
  {
    path: "/oauth/google/redirect",
    component: GoogleRedirect
  },
  {
    path: "/login/kakao-redirect",
    component: KakaoRedirect
  },
  {
    path: '/profile/complete/:userId?',
    component: UserProfileComplete,
    meta: {
      requiresAuth: false // OAuth 로그인 후 호출되므로 인증 불필요
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;