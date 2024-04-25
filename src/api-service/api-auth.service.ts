import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom, map } from 'rxjs';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

@Injectable()
export class ApiAuthService {
  private readonly baseUrl = this.config.get('META_AUTH_URL');
  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async post<T>(
    method: string,
    dto: T,
    config: AxiosRequestConfig,
  ): Promise<AxiosResponse<any, any>> {
    return await lastValueFrom(
      this.httpService
        .post(method, dto, config)
        .pipe(map((response) => response)),
    );
  }

  async sendSurveyEmail(
    userIds: Array<string>,
    metadata: object,
  ): Promise<any> {
    const config: AxiosRequestConfig = {
      headers: {},
    };

    const payload = {
      userIds,
      metadata,
    };

    return this.post<object>(
      `${this.baseUrl}/notifications/send-survey`,
      payload,
      config,
    ).then((response) => {
      if (response.status === 201) {
        Logger.debug(JSON.stringify(response.data), '[SYNC-AUTH-OK]');
        return response.data;
      }
      Logger.debug(JSON.stringify(response.data), '[SYNC-AUTH-ERROR]');
      throw new HttpException(
        'Api error: Invalid status code',
        HttpStatus.BAD_REQUEST,
      );
    });
  }
}
