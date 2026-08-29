import path from 'path';
import dns from 'dns';
import type { Core } from '@strapi/strapi';
import { isDatabaseClientKind } from '@strapi/database';

// Fix for Node >= 20 and pg module AggregateError on Railway internal network (Happy Eyeballs bug)
dns.setDefaultResultOrder('ipv4first');

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Database => {
  const defaultClient = env('DATABASE_URL') ? 'postgres' : 'sqlite';
  const client = env('DATABASE_CLIENT', defaultClient);

  if (!isDatabaseClientKind(client)) {
    throw new Error(
      `Unsupported DATABASE_CLIENT: ${client}. Use "postgres", "mysql", or "sqlite".`
    );
  }

  const databaseUrl = env('DATABASE_URL');
  let postgresConnection: Record<string, any> = {};

  if (databaseUrl) {
    const useSsl = env.bool('DATABASE_SSL', false) || databaseUrl.includes('sslmode=require');
    
    // Parse the URL to get individual fields - more reliable than connectionString with pg
    try {
      const url = new URL(databaseUrl);
      postgresConnection = {
        host: url.hostname,
        port: url.port ? parseInt(url.port, 10) : 5432,
        database: url.pathname.replace(/^\//, ''),
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        ssl: useSsl ? { rejectUnauthorized: false } : false,
        schema: env('DATABASE_SCHEMA', 'public'),
      };
      console.log('[DB] Connecting to:', url.hostname, 'port:', url.port, 'ssl:', useSsl);
    } catch {
      // Fallback to connectionString if URL parsing fails
      postgresConnection = {
        connectionString: databaseUrl,
        ssl: useSsl ? { rejectUnauthorized: false } : false,
        schema: env('DATABASE_SCHEMA', 'public'),
      };
      console.log('[DB] Using raw connectionString, ssl:', useSsl);
    }
  } else {
    postgresConnection.host = env('DATABASE_HOST', env('PGHOST', 'localhost'));
    postgresConnection.port = env.int('DATABASE_PORT', env.int('PGPORT', 5432));
    postgresConnection.database = env('DATABASE_NAME', env('PGDATABASE', 'strapi'));
    postgresConnection.user = env('DATABASE_USERNAME', env('PGUSER', 'strapi'));
    postgresConnection.password = env('DATABASE_PASSWORD', env('PGPASSWORD', 'strapi'));
    postgresConnection.ssl = env.bool('DATABASE_SSL', false) ? { rejectUnauthorized: false } : false;
    console.log('[DB] Using individual env vars. Host:', postgresConnection.host);
  }

  const connections: Record<Core.Config.Database.ClientKind, Core.Config.Database['connection']> = {
    mysql: {
      client: 'mysql',
      connection: {
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 3306),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        ssl: env.bool('DATABASE_SSL', false) && {
          key: env('DATABASE_SSL_KEY', undefined),
          cert: env('DATABASE_SSL_CERT', undefined),
          ca: env('DATABASE_SSL_CA', undefined),
          capath: env('DATABASE_SSL_CAPATH', undefined),
          cipher: env('DATABASE_SSL_CIPHER', undefined),
          rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', false),
        },
      },
      pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
    },
    postgres: {
      client: 'postgres',
      connection: postgresConnection as any,
      pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
    },
    sqlite: {
      client: 'sqlite',
      connection: {
        filename: path.join(__dirname, '..', '..', env('DATABASE_FILENAME', '.tmp/data.db')),
      },
      useNullAsDefault: true,
    },
  };

  return {
    connection: {
      ...connections[client],
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};

export default config;
