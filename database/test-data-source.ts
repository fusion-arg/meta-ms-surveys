import { DataSourceOptions } from 'typeorm';
import * as os from 'os';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const dataSourceOptions: DataSourceOptions = {
  type: 'sqlite',
  database: path.join(os.tmpdir(), uuidv4(), 'test.db.sqlite'),
  entities: ['dist/**/*.entity.js'],
  synchronize: true,
  dropSchema: true,
};
