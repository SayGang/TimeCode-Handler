import { Role } from '../types.js';

export const users = [
  { id: 1, role: Role.Admin, name: 'Richard', email: 'admin@example.com', password: 'admin123' },
  { id: 2, role: Role.Agent, name: 'Ram', email: 'ram@example.com', password: '1234' },
  { id: 3, role: Role.Agent, name: 'Rahim', email: 'rahim@example.com', password: '1234' },
  { id: 4, role: Role.Agent, name: 'John', email: 'john@example.com', password: '1234' },
  { id: 5, role: Role.Agent, name: 'Sita', email: 'sita@example.com', password: '1234' },
  { id: 6, role: Role.Agent, name: 'Mohan', email: 'mohan@example.com', password: '1234' },
  { id: 7, role: Role.Agent, name: 'Aisha', email: 'aisha@example.com', password: '1234' },
  { id: 8, role: Role.Agent, name: 'Lee', email: 'lee@example.com', password: '1234' },
  { id: 9, role: Role.Agent, name: 'Sara', email: 'sara@example.com', password: '1234' },
  { id: 10, role: Role.Agent, name: 'Kunal', email: 'kunal@example.com', password: '1234' },
];

export const agents = users.filter(u => u.role === Role.Agent);
