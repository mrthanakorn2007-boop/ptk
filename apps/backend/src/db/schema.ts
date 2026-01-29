import { pgTable, text, bigint, timestamp, uuid, integer, date, pgEnum } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const termTypeEnum = pgEnum('term_type', ['term1', 'term2', 'summer', 'other']);

export const students = pgTable('students', {
  id: text('id').primaryKey().$defaultFn(() => createId()), // CUID
  citizenId: text('citizen_id').unique(), // Encrypted/Hidden
  studentId: text('student_id').unique(), // Public ID (e.g. 64201xxxx)
  prefix: text('prefix'),
  nameTh: text('name_th'),
  surnameTh: text('surname_th'),
  nameEn: text('name_en'),
  surnameEn: text('surname_en'),
  class: bigint('class', { mode: 'number' }), 
  room: bigint('room', { mode: 'number' }), 
  number: text('number'),
  house: text('house'),
  conductScore: integer('conduct_score').default(150).notNull(),
  email: text('email').unique(), // For auth linking
  userId: uuid('user_id'), // Link to Supabase Auth UUID
});

export const profiles = pgTable('profiles', {
    id: uuid('id').primaryKey(), // Matches Supabase Auth User ID
    email: text('email').notNull().unique(),
    firstName: text('first_name'),
    lastName: text('last_name'),
    role: text('role').notNull(), // 'teacher', 'admin', 'student_affairs'
});

export const academicTerms = pgTable('academic_terms', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    name: text('name').notNull(), // e.g. "1/2567"
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    type: termTypeEnum('type').notNull(),
});

export const conductLogs = pgTable('conduct_logs', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    studentId: text('student_id').notNull().references(() => students.id),
    teacherId: uuid('teacher_id').notNull().references(() => profiles.id),
    scoreChange: integer('score_change').notNull(),
    reason: text('reason').notNull(),
    termId: text('term_id').references(() => academicTerms.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const notifications = pgTable('notifications', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    title: text('title').notNull(),
    content: text('content').notNull(),
    description: text('description'), // Long text for detailed description
    imageUrl: text('image_url'), // URL to notification image
    externalUrl: text('external_url'), // Optional external URL link
    type: text('type').notNull(), // 'urgent', 'general', 'event'
    targetAudience: text('target_audience').notNull(), // 'all', 'students', 'teachers'
    createdBy: uuid('created_by').references(() => profiles.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
