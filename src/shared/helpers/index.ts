import { ConfigService } from '@nestjs/config';

export type DbConfig = {
  host: string,
  port: number,
  database: string,
  user: string,
  password: string,
  ssl: {
    rejectUnauthorized: boolean
  },
  connectionTimeoutMillis: number,
};

const dbBaseConfig = {
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 5000,
};

export const getDbConfig = (configService: ConfigService): DbConfig => {
  return ({
    ...dbBaseConfig,
    host: configService.get<string>('DB_HOST'),
    port: parseInt(configService.get<string>('DB_PORT')),
    database: configService.get<string>('DB_NAME'),
    user: configService.get<string>('DB_USER'),
    password: configService.get<string>('DB_PASSWORD'),
  });
}
