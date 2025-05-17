import { doublePrecision, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { audit_fields } from './shared'

export const donors = pgTable('donors', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  ...audit_fields
})

export const contributions = pgTable('contributions', {
  id: uuid('id').primaryKey().defaultRandom(),
  donor_id: uuid('donor_id').references(() => donors.id).notNull(),
  amount: doublePrecision('amount').notNull(),
  currency_code: text('currency_code').notNull(),
  ...audit_fields
})

// NOTE: the following aggregates the count of donors.
// The issue is the generic admin view doesn't support views yet

// export const aggregate_donor_contributions = pgView('aggregate_donor_contributions', {
//   id: uuid('id'),
//   donor_name: text('donor_name'),
//   donor_created_at: timestamp('donor_created_at', { mode: 'string' }),
//   donor_updated_at: timestamp('donor_updated_at', { mode: 'string' }),
//   donor_deleted_at: timestamp('donor_deleted_at', { mode: 'string' }),
//   latest_contribution_id: uuid('latest_contribution_id'),
//   latest_contribution_amount: doublePrecision('latest_contribution_amount'),
//   latest_contribution_currency_code: text('latest_contribution_currency_code'),
//   latest_contribution_created_at: timestamp('latest_contribution_created_at', { mode: 'string' }),
//   latest_contribution_updated_at: timestamp('latest_contribution_updated_at', { mode: 'string' }),
//   latest_contribution_deleted_at: timestamp('latest_contribution_deleted_at', { mode: 'string' }),
//   contribution_count: integer('contribution_count')
// }).as(sql`
//   SELECT
//     d.id AS id,
//     d.name AS donor_name,
//     d.created_at AS donor_created_at,
//     d.updated_at AS donor_updated_at,
//     d.deleted_at AS donor_deleted_at,
//     latest_c.id AS latest_contribution_id,
//     latest_c.amount AS latest_contribution_amount,
//     latest_c.currency_code AS latest_contribution_currency_code,
//     latest_c.created_at AS latest_contribution_created_at,
//     latest_c.updated_at AS latest_contribution_updated_at,
//     latest_c.deleted_at AS latest_contribution_deleted_at,
//     contrib_counts.contribution_count
//   FROM
//     public.donors d
//   LEFT JOIN LATERAL (
//     SELECT *
//     FROM public.contributions c
//     WHERE c.donor_id = d.id
//     ORDER BY c.created_at DESC
//     LIMIT 1
//   ) latest_c ON true
//   LEFT JOIN (
//     SELECT donor_id, COUNT(*) AS contribution_count
//     FROM public.contributions
//     GROUP BY donor_id
//   ) contrib_counts ON contrib_counts.donor_id = d.id
//   ORDER BY latest_contribution_created_at DESC NULLS LAST
// `)
