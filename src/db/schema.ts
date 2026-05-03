import { pgTable, text, timestamp, integer, boolean, jsonb, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  mobile_number: text('mobile_number').unique(),
  center_name: text('center_name'),
  role: text('role').default('user').notNull(),
  referred_by: text('referred_by'),
  is_referral_converted: boolean('is_referral_converted').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const accounts = pgTable('accounts', {
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (account) => ({
  compoundKey: primaryKey({
    columns: [account.provider, account.providerAccountId],
  }),
}));

export const otps = pgTable('otps', {
  id: text('id').primaryKey(),
  mobile_number: text('mobile_number').notNull(),
  otp_hash: text('otp_hash').notNull(),
  attempts: integer('attempts').default(0).notNull(),
  expires_at: timestamp('expires_at').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey(),
  user_id: text('user_id').references(() => users.id).notNull(),
  plan_type: text('plan_type').notNull(), // 'free', 'monthly', 'quarterly', 'yearly'
  is_active: boolean('is_active').default(true).notNull(),
  downloads_used: integer('downloads_used').default(0).notNull(),
  download_limit: integer('download_limit').default(2).notNull(),
  free_downloads_today: integer('free_downloads_today').default(0).notNull(),
  watermark_downloads_today: integer('watermark_downloads_today').default(0).notNull(),
  last_usage_date: timestamp('last_usage_date').defaultNow().notNull(),
  start_date: timestamp('start_date').defaultNow().notNull(),
  end_date: timestamp('end_date'),
});

// ─── App Plans ───────────────────────────────────────────────────────────────
export const app_plans = pgTable('app_plans', {
  key: text('key').primaryKey(),
  name: text('name').notNull(),
  price: integer('price').notNull(),
  ui_price: integer('ui_price'),
  period: text('period').notNull(),
  description: text('description').notNull(),
  total_limit: integer('total_limit').notNull(),
  monthly_limit: integer('monthly_limit'),
  daily_limit: integer('daily_limit').notNull(),
  watermark_limit: integer('watermark_limit').notNull(),
  watermark: boolean('watermark').notNull(),
  extra_per_form: integer('extra_per_form').notNull(),
  badge: text('badge'),
  cta: text('cta').notNull(),
  features: jsonb('features').notNull(),
  sort_order: integer('sort_order').notNull(),
});

// ─── Payments ────────────────────────────────────────────────────────────────
export const payments = pgTable('payments', {
  id: text('id').primaryKey(),               // "PAN-{timestamp}"
  user_id: text('user_id').references(() => users.id).notNull(),
  order_id: text('order_id').unique().notNull(),
  amount: integer('amount').notNull(),        // in ₹ (not paise)
  plan_type: text('plan_type').notNull(),     // 'per_form', 'monthly', 'quarterly', 'yearly'
  status: text('status').default('PENDING').notNull(), // 'PENDING' | 'PAID' | 'FAILED'
  frinext_txn_id: text('frinext_txn_id'),
  razorpay_payment_id: text('razorpay_payment_id'),
  razorpay_signature: text('razorpay_signature'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// ─── Download Logs (tracks daily usage for gating) ───────────────────────────
export const download_logs = pgTable('download_logs', {
  id: text('id').primaryKey(),
  user_id: text('user_id').references(() => users.id).notNull(),
  pan_form_id: text('pan_form_id').references(() => pan_forms.id),
  downloaded_at: timestamp('downloaded_at').defaultNow().notNull(),
});

export const pan_forms = pgTable('pan_forms', {
  id: text('id').primaryKey(),
  user_id: text('user_id').references(() => users.id).notNull(),
  form_type: text('form_type').notNull(), // 'new', 'correction'
  status: text('status').default('draft').notNull(), // 'draft', 'submitted', 'processing', 'completed'
  data: jsonb('data').default({}).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const generated_pdfs = pgTable('generated_pdfs', {
  id: text('id').primaryKey(),
  pan_form_id: text('pan_form_id').references(() => pan_forms.id).notNull(),
  pdf_url: text('pdf_url'),
  watermarked: boolean('watermarked').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// ─── PDF Sessions (tracks single-use download/print per generated PDF) ───────
export const pdf_sessions = pgTable('pdf_sessions', {
  id: text('id').primaryKey(),
  user_id: text('user_id').references(() => users.id).notNull(),
  pan_form_id: text('pan_form_id').references(() => pan_forms.id).notNull(),
  pdf_url: text('pdf_url').notNull(),
  watermarked: boolean('watermarked').default(false).notNull(),
  is_consumed: boolean('is_consumed').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const referrals = pgTable('referrals', {
  id: text('id').primaryKey(),
  user_id: text('user_id').references(() => users.id).notNull(),
  referral_code: text('referral_code').unique().notNull(),
  referred_users_count: integer('referred_users_count').default(0).notNull(),
  converted_users_count: integer('converted_users_count').default(0).notNull(),
  rewards_claimed: integer('rewards_claimed').default(0).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// ─── User Profiles (for auto-fill) ───────────────────────────────────────────
export const user_profiles = pgTable('user_profiles', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text('user_id').references(() => users.id, { onDelete: 'cascade' }).unique().notNull(),
  
  // Basic Details
  full_name: text('full_name'),
  email: text('email'),
  center_name: text('center_name'),
  
  // Specific Requested Fields
  ao_code: text('ao_code'),
  office_address: text('office_address'),
  
  // Office Details (Granular)
  flat_door: text('flat_door'),
  road_street: text('road_street'),
  post_office: text('post_office'),
  area_locality: text('area_locality'),
  district_city: text('district_city'),
  state_ut: text('state_ut'),
  country: text('country').default('INDIA'),
  pin_code: text('pin_code'),
  
  // PAN Defaults (Granular AO Code)
  ao_area_code: text('ao_area_code'),
  ao_type: text('ao_type'),
  ao_range_code: text('ao_range_code'),
  ao_number: text('ao_number'),
  
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});


// ─── Relations ───────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  subscriptions: many(subscriptions),
  pan_forms: many(pan_forms),
  referrals: many(referrals),
  payments: many(payments),
  download_logs: many(download_logs),
  profile: one(user_profiles),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.user_id],
    references: [users.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.user_id],
    references: [users.id],
  }),
}));

export const downloadLogsRelations = relations(download_logs, ({ one }) => ({
  user: one(users, {
    fields: [download_logs.user_id],
    references: [users.id],
  }),
  pan_form: one(pan_forms, {
    fields: [download_logs.pan_form_id],
    references: [pan_forms.id],
  }),
}));

export const panFormsRelations = relations(pan_forms, ({ one, many }) => ({
  user: one(users, {
    fields: [pan_forms.user_id],
    references: [users.id],
  }),
  generated_pdfs: many(generated_pdfs),
  download_logs: many(download_logs),
}));

export const generatedPdfsRelations = relations(generated_pdfs, ({ one }) => ({
  pan_form: one(pan_forms, {
    fields: [generated_pdfs.pan_form_id],
    references: [pan_forms.id],
  }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  user: one(users, {
    fields: [referrals.user_id],
    references: [users.id],
  }),
}));

export const pdfSessionsRelations = relations(pdf_sessions, ({ one }) => ({
  user: one(users, {
    fields: [pdf_sessions.user_id],
    references: [users.id],
  }),
  pan_form: one(pan_forms, {
    fields: [pdf_sessions.pan_form_id],
    references: [pan_forms.id],
  }),
}));

export const userProfilesRelations = relations(user_profiles, ({ one }) => ({
  user: one(users, {
    fields: [user_profiles.user_id],
    references: [users.id],
  }),
}));
