import { ExamRequestInstance } from '@/assets/js/Mixins/Class/ExamRequestInstance'
import srfRoutes from '@/assets/js/Mixins/url/srf.json'
import type { RouteDict } from '@bpmlib/sauth-frontend'

const routes = srfRoutes as unknown as RouteDict

export const page1Req = new ExamRequestInstance(
  routes,
  'fuj_pex',
  '/api/exam/auth/pre/refresh',
)

export const examReq = new ExamRequestInstance(
  routes,
  'fuj_ex',
  '/api/exam/auth/refresh',
)