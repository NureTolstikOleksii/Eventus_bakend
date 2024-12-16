import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

export async function connectToDatabase() {
    const databasePath = './database/eventus.db'; 
    return open({
        filename: path.resolve(databasePath),
        driver: sqlite3.Database
    });
}
