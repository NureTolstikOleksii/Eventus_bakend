import pkg from 'pg';
const { Pool } = pkg;

import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    user: process.env.PG_USER || 'postgres',
    host: process.env.PG_HOST || 'localhost',
    database: process.env.PG_DATABASE || 'eventus',
    password: process.env.PG_PASSWORD || 'your_password',
    port: process.env.PG_PORT || 5432,
    ssl: { rejectUnauthorized: false }, // Включить SSL
});

export async function connectToDatabase() {
    try {
        const client = await pool.connect();
        console.log('Connected to PostgreSQL database');
        return client; // Возвращаем подключение
    } catch (error) {
        console.error('Error connecting to PostgreSQL database:', error);
        throw error;
    }
}
