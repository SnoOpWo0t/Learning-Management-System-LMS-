"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const dns_1 = __importDefault(require("dns"));
const database_1 = require("@strapi/database");
// Fix for Node >= 20 and pg module AggregateError on Railway internal network (Happy Eyeballs bug)
dns_1.default.setDefaultResultOrder('ipv4first');
const config = ({ env }) => {
    const defaultClient = env('DATABASE_URL') ? 'postgres' : 'sqlite';
    const client = env('DATABASE_CLIENT', defaultClient);
    if (!(0, database_1.isDatabaseClientKind)(client)) {
        throw new Error(`Unsupported DATABASE_CLIENT: ${client}. Use "postgres", "mysql", or "sqlite".`);
    }
    const databaseUrl = env('DATABASE_URL');
    let postgresConnection = {};
    if (databaseUrl) {
        // Railway handles SSL internally, but if forced, use rejectUnauthorized: false
        const useSsl = env.bool('DATABASE_SSL', false) || databaseUrl.includes('sslmode=require');
        postgresConnection = {
            connectionString: databaseUrl,
            ssl: useSsl ? { rejectUnauthorized: false } : false,
            schema: env('DATABASE_SCHEMA', 'public'),
        };
    }
    else {
        postgresConnection.host = env('DATABASE_HOST', env('PGHOST', 'localhost'));
        postgresConnection.port = env.int('DATABASE_PORT', env.int('PGPORT', 5432));
        postgresConnection.database = env('DATABASE_NAME', env('PGDATABASE', 'strapi'));
        postgresConnection.user = env('DATABASE_USERNAME', env('PGUSER', 'strapi'));
        postgresConnection.password = env('DATABASE_PASSWORD', env('PGPASSWORD', 'strapi'));
        postgresConnection.ssl = env.bool('DATABASE_SSL', false) ? { rejectUnauthorized: false } : false;
    }
    const connections = {
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
            connection: postgresConnection,
            pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
        },
        sqlite: {
            client: 'sqlite',
            connection: {
                filename: path_1.default.join(__dirname, '..', '..', env('DATABASE_FILENAME', '.tmp/data.db')),
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
exports.default = config;
