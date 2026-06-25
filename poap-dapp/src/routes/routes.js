import { LoginPage } from '@/pages/LoginPage';
import { WalletGuidePage } from '@/pages/WalletGuidePage';
import { FundsGuidePage } from '@/pages/FundsGuidePage';
import { RoleSelectPage } from '@/pages/RoleSelectPage';
import { StudentHomePage } from '@/pages/student/StudentHomePage';
import { ClaimPage } from '@/pages/student/ClaimPage';
import { EmblemObtainedPage } from '@/pages/student/EmblemObtainedPage';
import { TeacherHomePage } from '@/pages/teacher/TeacherHomePage';
import { QrPage } from '@/pages/teacher/QrPage';
import { RouteNamesEnum } from './routeNames';

export const routes = [
  {
    path: RouteNamesEnum.home,
    component: LoginPage,
    authenticatedRoute: false
  },
  {
    path: RouteNamesEnum.walletGuide,
    component: WalletGuidePage,
    authenticatedRoute: false
  },
  {
    path: RouteNamesEnum.fundsGuide,
    component: FundsGuidePage,
    authenticatedRoute: false
  },
  {
    path: RouteNamesEnum.role,
    component: RoleSelectPage,
    authenticatedRoute: true
  },
  {
    path: RouteNamesEnum.student,
    component: StudentHomePage,
    authenticatedRoute: true
  },
  {
    path: RouteNamesEnum.claim,
    component: ClaimPage,
    authenticatedRoute: true
  },
  {
    path: RouteNamesEnum.emblemObtained,
    component: EmblemObtainedPage,
    authenticatedRoute: true
  },
  {
    path: RouteNamesEnum.teacher,
    component: TeacherHomePage,
    authenticatedRoute: true
  },
  {
    path: RouteNamesEnum.teacherQr,
    component: QrPage,
    authenticatedRoute: true
  }
];
