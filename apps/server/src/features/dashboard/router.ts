// The IT team's home page numbers, in one request.
import { Router } from "express"
import { pool } from "../../db"

export const dashboardRouter = Router()

dashboardRouter.get("/", async (_req, res) => {
  const [tickets, assets, fixTime, quickFix, recent, changes, perDay] = await Promise.all([
    pool.query(
      `select count(*) filter (where status <> 'closed')::int as open,
              count(*) filter (where status = 'open')::int as unassigned,
              count(*) filter (where status in ('assigned', 'in_progress'))::int as in_progress,
              count(*) filter (where status = 'waiting')::int as waiting,
              count(*) filter (where status = 'resolved')::int as resolved,
              count(*) filter (where status <> 'closed' and priority = 'urgent')::int as urgent,
              count(*) filter (where status not in ('resolved', 'closed') and due_at < now())::int as late,
              count(*) filter (where status not in ('resolved', 'closed') and escalated_at is not null)::int as escalated
       from tickets`,
    ),
    pool.query(
      `select count(*) filter (where status <> 'retired')::int as total,
              count(*) filter (where status = 'under_repair')::int as under_repair
       from assets`,
    ),
    // average hours from filing to resolution, over the last 30 days
    pool.query(
      `select round(avg(extract(epoch from resolved_at - created_at) / 3600)::numeric, 1)::float as avg_fix_hours
       from tickets where resolved_at > now() - interval '30 days'`,
    ),
    pool.query(
      `select count(*)::int as asked,
              count(*) filter (where outcome = 'solved')::int as solved,
              count(*) filter (where outcome = 'ticket_filed')::int as ticket_filed
       from ai_suggestions`,
    ),
    pool.query(
      `select e.type, e.from_value, e.to_value, e.created_at, p.full_name as actor_name,
              t.id as ticket_id, 'IT-' || lpad(t.number::text, 4, '0') as ticket_ref, t.title
       from ticket_events e
       join tickets t on t.id = e.ticket_id
       left join profiles p on p.id = e.actor_id
       order by e.created_at desc limit 10`,
    ),
    pool.query(
      "select count(*)::int as pending from asset_change_requests where status = 'pending'",
    ),
    // new tickets per day for the last two weeks, including days with none (Lagos dates)
    pool.query(
      `select to_char(day, 'YYYY-MM-DD') as day, count(t.id)::int as count
       from generate_series((now() at time zone 'Africa/Lagos')::date - 13,
                            (now() at time zone 'Africa/Lagos')::date, interval '1 day') day
       left join tickets t on (t.created_at at time zone 'Africa/Lagos')::date = day::date
       group by day order by day`,
    ),
  ])

  res.json({
    tickets: tickets.rows[0],
    assets: assets.rows[0],
    avg_fix_hours: fixTime.rows[0].avg_fix_hours,
    quick_fix: quickFix.rows[0],
    recent_activity: recent.rows,
    change_requests: changes.rows[0],
    tickets_per_day: perDay.rows,
  })
})
