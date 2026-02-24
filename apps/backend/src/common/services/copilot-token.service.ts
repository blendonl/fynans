import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CopilotTokenService {
  private readonly logger = new Logger(CopilotTokenService.name);
  private accessToken: string;
  private readonly refreshToken: string;
  private expiresAt: number; // unix ms

  private static readonly COPILOT_CLIENT_ID = 'Iv1.b507a08c87ecfe98';
  private static readonly REFRESH_URL = 'https://github.com/login/oauth/access_token';

  constructor(private readonly configService: ConfigService) {
    this.accessToken = this.configService.get<string>('COPILOT_ACCESS_TOKEN', '');
    this.refreshToken = this.configService.get<string>('COPILOT_REFRESH_TOKEN', '');
    const expiresEnv = this.configService.get<string>('COPILOT_TOKEN_EXPIRES', '');
    this.expiresAt = expiresEnv
      ? parseInt(expiresEnv, 10) * 1000
      : Date.now() + 30 * 60 * 1000;
  }

  async getToken(): Promise<string> {
    if (!this.accessToken) {
      throw new Error(
        'COPILOT_ACCESS_TOKEN is not set. Provide it in your environment.',
      );
    }

    if (this.refreshToken && Date.now() >= this.expiresAt - 60_000) {
      await this.refresh();
    }

    return this.accessToken;
  }

  async refreshIfUnauthorized(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error(
        'Cannot refresh Copilot token: COPILOT_REFRESH_TOKEN is not set.',
      );
    }
    await this.refresh();
    return this.accessToken;
  }

  private async refresh(): Promise<void> {
    this.logger.log('Refreshing Copilot access token...');

    const response = await fetch(CopilotTokenService.REFRESH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: CopilotTokenService.COPILOT_CLIENT_ID,
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Failed to refresh Copilot token (${response.status}): ${body.substring(0, 200)}`,
      );
    }

    const data = (await response.json()) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
      error?: string;
      error_description?: string;
    };

    if (data.error) {
      throw new Error(
        `Copilot token refresh error: ${data.error} — ${data.error_description}`,
      );
    }

    if (!data.access_token) {
      throw new Error('Copilot token refresh returned no access_token');
    }

    this.accessToken = data.access_token;
    this.expiresAt = data.expires_in
      ? Date.now() + data.expires_in * 1000
      : Date.now() + 30 * 60 * 1000;

    this.logger.log(
      `Copilot token refreshed, expires in ${Math.round((this.expiresAt - Date.now()) / 60_000)}m`,
    );
  }

  isConfigured(): boolean {
    return !!this.accessToken;
  }
}
