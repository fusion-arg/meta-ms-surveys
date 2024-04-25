import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom, map } from 'rxjs';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

@Injectable()
export class ApiOrganizationService {
  private readonly baseUrl = this.config.get('META_ORGANIZATION_URL');

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

  async get<T>(
    method: string,
    config: AxiosRequestConfig,
  ): Promise<AxiosResponse<any, any>> {
    return await lastValueFrom(
      this.httpService.get<T>(method, config).pipe(map((response) => response)),
    );
  }

  async getStakeholdersForAnswers(payload: object): Promise<any> {
    const config: AxiosRequestConfig = {
      headers: {},
    };

    return this.post<object>(
      `${this.baseUrl}/public/list-stakeholders-for-answers`,
      payload,
      config,
    ).then((response) => {
      if (response.status === 200) {
        Logger.debug(JSON.stringify(response.data), '[SYNC-ORGANIZATION-OK]');
        return response.data.data;
      }
      Logger.debug(JSON.stringify(response.data), '[SYNC-ORGANIZATION-ERROR]');
      throw new HttpException(
        'Api error: Invalid status code',
        HttpStatus.BAD_REQUEST,
      );
    });
  }

  async getStakeholder(userId: string, projectId: string): Promise<any> {
    const config: AxiosRequestConfig = {
      headers: {},
    };

    const payload = {
      projectId,
      userId,
    };

    return this.post<object>(
      `${this.baseUrl}/public/stakeholder-detail`,
      payload,
      config,
    )
      .then((response) => {
        if (response.status === 200) {
          Logger.debug(JSON.stringify(response.data), '[SYNC-ORGANIZATION-OK]');
          return response.data.data;
        }
        Logger.debug(
          JSON.stringify(response.data),
          '[SYNC-ORGANIZATION-ERROR]',
        );
        throw new HttpException(
          'Api error: Invalid status code',
          HttpStatus.BAD_REQUEST,
        );
      })
      .catch((error) => {
        const message = error.response?.data?.message || error.message;
        const statusCode =
          error.response?.data?.statusCode || HttpStatus.BAD_REQUEST;
        Logger.error(error, 'Error GET getStakeholder');
        throw new HttpException(message, statusCode);
      });
  }

  async getStakeholders(payload: object): Promise<any> {
    const config: AxiosRequestConfig = {
      headers: {},
    };

    return this.post<object>(
      `${this.baseUrl}/public/list-for-segmentation`,
      payload,
      config,
    )
      .then((response) => {
        if (response.status === 200) {
          Logger.debug(JSON.stringify(response.data), '[SYNC-ORGANIZATION-OK]');
          return response.data;
        }
        Logger.debug(
          JSON.stringify(response.data),
          '[SYNC-ORGANIZATION-ERROR]',
        );
        throw new HttpException(
          'Api error: Invalid status code',
          HttpStatus.BAD_REQUEST,
        );
      })
      .catch((error) => {
        const message = error.response?.data?.message || error.message;
        const statusCode =
          error.response?.data?.statusCode || HttpStatus.BAD_REQUEST;
        Logger.error(error, 'Error GET getStakeholders');
        throw new HttpException(message, statusCode);
      });
  }

  async getSprint(sprintId: string): Promise<any> {
    const config: AxiosRequestConfig = {
      headers: {},
    };

    return this.get<object>(
      `${this.baseUrl}/public/sprints/${sprintId}`,
      config,
    )
      .then((response) => {
        if (response.status === 200) {
          Logger.debug(JSON.stringify(response.data), '[SYNC-SPRINT-OK]');
          return response.data;
        }
        Logger.debug(JSON.stringify(response.data), '[SYNC-SPRINT-ERROR]');
        throw new HttpException(
          'Api error: Invalid status code',
          HttpStatus.BAD_REQUEST,
        );
      })
      .catch((error) => {
        const message = error.response?.data?.message || error.message;
        const statusCode =
          error.response?.data?.statusCode || HttpStatus.BAD_REQUEST;
        Logger.error(error, 'Error getSprint');
        throw new HttpException(message, statusCode);
      });
  }

  async getDepartments(departmentIds: Array<string>): Promise<any> {
    const config: AxiosRequestConfig = {
      headers: {},
    };

    const payload = {
      departmentIds,
    };

    return this.post<object>(
      `${this.baseUrl}/public/list-departments-for-segmentation`,
      payload,
      config,
    )
      .then((response) => {
        if (response.status === 200) {
          Logger.debug(JSON.stringify(response.data), '[SYNC-ORGANIZATION-OK]');
          return response.data.departments;
        }
        Logger.debug(
          JSON.stringify(response.data),
          '[SYNC-ORGANIZATION-ERROR]',
        );
        throw new HttpException(
          'Api error: Invalid status code',
          HttpStatus.BAD_REQUEST,
        );
      })
      .catch((error) => {
        const message = error.response?.data?.message || error.message;
        const statusCode =
          error.response?.data?.statusCode || HttpStatus.BAD_REQUEST;
        Logger.error(error, 'Error getDepartments');
        throw new HttpException(message, statusCode);
      });
  }
}
