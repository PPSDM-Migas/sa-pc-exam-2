import RequestInstance from '@bpmlib/sauth-frontend/http'
import type { RouteDict } from '@bpmlib/sauth-frontend'
import axios from 'axios'

export class ExamRequestInstance extends RequestInstance<RouteDict> {
  private readonly refreshEndpoint: string

  constructor(routes: RouteDict, service: string, refreshEndpoint: string) {
    super(
      import.meta.env.VITE_BASE_API ?? 'http://127.0.0.1:10600',
      routes,
      service,
      {
        mode: 'pkce',
        accessTokenPrefix: 'tkac_',
        refreshTokenTtl: 9000,
        onAuthFailure: () => { window.location.assign('/') },
      },
    )
    this.refreshEndpoint = refreshEndpoint
  }

  protected override async refreshingToken(): Promise<void> {
    const refresh = this.getRefreshTk()
    if (!refresh) throw new Error('No refresh token')

    const baseUrl = import.meta.env.VITE_BASE_API ?? 'http://127.0.0.1:10600'
    const { data } = await axios.post<{ access: string; refresh: string; expires_in: number }>(
      `${baseUrl}${this.refreshEndpoint}`,
      { refresh },
    )

    this.storeTokens(data.access, data.refresh, data.expires_in)
  }
}