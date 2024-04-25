import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApiOrganizationService } from './api-organization.service';
import { ApiAuthService } from './api-auth.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        timeout: 5000,
        maxRedirects: 5,
        headers: {
          'Response-Content-Type': 'json',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [ApiOrganizationService, ApiAuthService],
  exports: [ApiOrganizationService, ApiAuthService],
})
export class ApiServiceModule {}
