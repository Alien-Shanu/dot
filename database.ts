/**
 * SIMULATED SQLITE3 DATABASE
 * 
 * Since this is a frontend-only application (React), we cannot directly bind to 
 * the C++ 'sqlite3' library used in Node.js. 
 * 
 * This file acts as a mock Database Adapter. It simulates SQL queries but 
 * persists the data to the browser's localStorage.
 * 
 * To switch to real SQLite:
 * 1. Set up a Node.js/Express backend.
 * 2. Replace this logic to fetch() from your API endpoints.
 */

import { generateId } from "./utils";

interface User {
    id: string;
    username: string;
    passwordHash: string; // In a real app, hash this!
    createdAt: number;
}

const DB_KEY = 'deck_of_thoughts_users_db';

class SimulatedDB {
    private users: User[];

    constructor() {
        const data = localStorage.getItem(DB_KEY);
        this.users = data ? JSON.parse(data) : [];
    }

    private save() {
        localStorage.setItem(DB_KEY, JSON.stringify(this.users));
    }

    // Simulate: SELECT * FROM users WHERE username = ?
    findUser(username: string): User | undefined {
        return this.users.find(u => u.username === username);
    }

    // Simulate: INSERT INTO users (id, username, password) VALUES (?, ?, ?)
    createUser(username: string, password: string): User {
        const existing = this.findUser(username);
        if (existing) {
            throw new Error("Username already taken");
        }

        const newUser: User = {
            id: generateId(),
            username,
            passwordHash: password, // WARNING: Plaintext for demo only. Use bcrypt in production.
            createdAt: Date.now()
        };

        this.users.push(newUser);
        this.save();
        return newUser;
    }

    // Simulate: SELECT * FROM users WHERE username = ? AND password = ?
    loginUser(username: string, password: string): User {
        const user = this.findUser(username);
        if (!user || user.passwordHash !== password) {
            throw new Error("Invalid credentials");
        }
        return user;
    }
}

export const db = new SimulatedDB();