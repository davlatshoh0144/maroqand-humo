-- Phase 23B live LMS seed repair.
-- Run this in Supabase SQL Editor after schema/rls/phase22 hardening are applied.
-- This file changes data only. It does not alter RLS or Storage policies.

begin;

update public.courses
set published = true
where slug in (
  'dispatch-fundamentals',
  'broker-communication',
  'load-board-mastery',
  'amazon-style-freight-training',
  'usps-postal-freight-training'
);

insert into public.lessons (
  id,
  course_id,
  order_index,
  title,
  description,
  content,
  duration_min,
  is_free,
  is_required,
  checklist,
  resources
)
values
  (
    '11111111-1111-4111-8111-000000000002',
    '11111111-1111-4111-8111-111111111111',
    2,
    'Dispatcher Tools and Software',
    'Set up the dispatch workstation and understand common tools.',
    'Modern dispatchers use TMS platforms, load boards, ELD portals, email, and phone systems. This lesson explains what each tool is used for and how dispatchers keep records clean.',
    55,
    false,
    true,
    array['List common TMS tools', 'Explain how load boards are used', 'Describe how ELD data helps dispatchers'],
    '[{"title":"Load Board Platform Guide","url":"#","type":"document"}]'::jsonb
  ),
  (
    '22222222-2222-4222-8222-000000000002',
    '22222222-2222-4222-8222-222222222222',
    2,
    'Rate Negotiation Basics',
    'Use lane evidence and market context to negotiate.',
    'This lesson covers rate framing, silence, counteroffers, and how to justify a fair rate with RPM and lane context.',
    50,
    false,
    true,
    array['Calculate a target RPM', 'Write a counteroffer', 'Document the accepted rate'],
    '[]'::jsonb
  ),
  (
    '33333333-3333-4333-8333-000000000002',
    '33333333-3333-4333-8333-333333333333',
    2,
    'Load Board Risk Signals',
    'Identify risky posts, broker gaps, and rate traps before booking.',
    'This lesson teaches dispatchers to review broker history, pickup details, equipment requirements, appointment timing, rate quality, and double-brokering red flags before committing a truck.',
    50,
    false,
    true,
    array['Check broker history before booking', 'Identify vague or risky load details', 'Explain when to verify or reject a posted load'],
    '[{"title":"Load Board Risk Review Worksheet","url":"#","type":"worksheet"}]'::jsonb
  ),
  (
    '44444444-4444-4444-8444-000000000002',
    '44444444-4444-4444-8444-444444444444',
    2,
    'Appointment Windows and Strict Timing',
    'Plan pickup and delivery timing around narrow facility windows.',
    'Appointment-based freight requires precise time planning across pickup windows, delivery windows, driver hours, traffic buffers, fuel stops, and facility staging rules.',
    45,
    false,
    true,
    array['Confirm appointment times in writing', 'Build a route timeline with staging buffers', 'Check driver HOS against both appointment windows'],
    '[{"title":"Appointment Timing Planner","url":"#","type":"template"}]'::jsonb
  ),
  (
    '55555555-5555-4555-8555-000000000002',
    '55555555-5555-4555-8555-555555555555',
    2,
    'Time-sensitive Lane Management',
    'Plan lanes where late pickup or delivery can create service failures.',
    'Time-sensitive lane management starts before booking. Dispatchers verify mileage, traffic patterns, driver HOS, facility hours, weather, and contingency options.',
    45,
    false,
    true,
    array['Build a lane timeline with conservative buffers', 'Check HOS against commitments', 'Escalate risk before appointment failure'],
    '[{"title":"Route Timing Exercise","url":"#","type":"template"}]'::jsonb
  )
on conflict (course_id, order_index) do update
set title = excluded.title,
    description = excluded.description,
    content = excluded.content,
    duration_min = excluded.duration_min,
    is_free = excluded.is_free,
    is_required = excluded.is_required,
    checklist = excluded.checklist,
    resources = excluded.resources;

insert into public.quizzes (id, course_id, lesson_id, title, questions, passing_score, published)
values
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
    '11111111-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-000000000002',
    'Dispatch Fundamentals Check',
    '[{"id":"q1","question":"Who confirms load details with the broker in writing?","options":["Dispatcher","Receiver","Fuel desk"],"correctIndex":0},{"id":"q2","question":"What does RPM mean?","options":["Route planning manual","Revenue per mile","Rate pickup memo"],"correctIndex":1}]'::jsonb,
    70,
    true
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
    '22222222-2222-4222-8222-222222222222',
    '22222222-2222-4222-8222-000000000002',
    'Broker Communication Check',
    '[{"id":"q1","question":"What should a rate counteroffer include?","options":["A clear rate and reason","Only emojis","No lane details"],"correctIndex":0},{"id":"q2","question":"Why confirm details by email?","options":["It creates a record","It replaces the rate confirmation","It removes the need to inspect the load"],"correctIndex":0}]'::jsonb,
    75,
    true
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3',
    '33333333-3333-4333-8333-333333333333',
    '33333333-3333-4333-8333-000000000002',
    'Load Board Mastery Check',
    '[{"id":"q1","question":"What should be verified before booking a suspiciously high-paying load?","options":["Broker history, pickup details, equipment requirements, timing, and rate logic","Only the posted rate","Only the destination city"],"correctIndex":0},{"id":"q2","question":"What is a common load board red flag?","options":["Clear appointment details","Missing pickup information from a new broker account","Complete rate confirmation"],"correctIndex":1}]'::jsonb,
    75,
    true
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4',
    '44444444-4444-4444-8444-444444444444',
    '44444444-4444-4444-8444-000000000002',
    'Amazon-Style Freight Training Check',
    '[{"id":"q1","question":"What should be verified before accepting strict appointment freight?","options":["Only the posted rate","Appointment windows, HOS, route time, trailer requirements, and facility instructions","Only the delivery city"],"correctIndex":1},{"id":"q2","question":"When should a likely appointment delay be communicated?","options":["As soon as the delay risk is known","After delivery","Never"],"correctIndex":0}]'::jsonb,
    75,
    true
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb5',
    '55555555-5555-4555-8555-555555555555',
    '55555555-5555-4555-8555-000000000002',
    'USPS / Postal Freight Training Check',
    '[{"id":"q1","question":"What is postal-style freight usually most sensitive to?","options":["Time, documentation, trailer status, and service reliability","Decorative trailer graphics","Invoice date only"],"correctIndex":0},{"id":"q2","question":"What should happen when a seal number does not match paperwork?","options":["Ignore it","Escalate immediately and document the mismatch","Wait until invoicing"],"correctIndex":1}]'::jsonb,
    75,
    true
  )
on conflict (id) do update
set course_id = excluded.course_id,
    lesson_id = excluded.lesson_id,
    title = excluded.title,
    questions = excluded.questions,
    passing_score = excluded.passing_score,
    published = excluded.published;

insert into public.assignments (
  id,
  course_id,
  lesson_id,
  title,
  description,
  instructions,
  scenario,
  rubric,
  type,
  difficulty,
  published
)
values
  (
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
    '11111111-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-000000000002',
    'Dispatch Your First Load',
    'Submit a step-by-step dispatch plan for a simulated load.',
    'Explain how you would confirm pickup, assign a driver, track delivery, and close paperwork.',
    'A broker offers a dry van load from Chicago, IL to Atlanta, GA with next-day pickup. Build a dispatch plan.',
    '[{"criterion":"Workflow completeness","weight":40,"description":"Covers pickup, tracking, delivery, and paperwork."},{"criterion":"Communication quality","weight":30,"description":"Uses professional broker and driver language."},{"criterion":"Risk checks","weight":30,"description":"Mentions broker score, rate, and appointment confirmation."}]'::jsonb,
    'scenario',
    'beginner',
    true
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc2',
    '22222222-2222-4222-8222-222222222222',
    '22222222-2222-4222-8222-000000000002',
    'Broker Rate Counter Email',
    'Write a professional counteroffer email.',
    'Draft a concise broker email that counters the offered rate and asks for written confirmation.',
    'The broker offers $1,900 on a 780-mile lane. Your target is $2,250. Write the email.',
    '[{"criterion":"Clarity","weight":35,"description":"States the counteroffer clearly."},{"criterion":"Professional tone","weight":35,"description":"Keeps the broker relationship positive."},{"criterion":"Business reasoning","weight":30,"description":"Uses lane or RPM context."}]'::jsonb,
    'email',
    'intermediate',
    true
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc3',
    '33333333-3333-4333-8333-333333333333',
    '33333333-3333-4333-8333-000000000002',
    'Load Board Risk Review',
    'Review a load board post and identify risk signals.',
    'List the fields you would verify before booking and explain any red flags.',
    'A post shows high pay, vague pickup details, and a new broker account with limited history.',
    '[{"criterion":"Field review","weight":30,"description":"Checks required load board details."},{"criterion":"Risk detection","weight":40,"description":"Identifies likely red flags."},{"criterion":"Decision quality","weight":30,"description":"Explains book, reject, or verify decision."}]'::jsonb,
    'review',
    'intermediate',
    true
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc4',
    '44444444-4444-4444-8444-444444444444',
    '44444444-4444-4444-8444-000000000002',
    'Appointment Delay Scenario',
    'Handle a late-arrival risk on an appointment-based freight scenario.',
    'Create an action plan with driver instructions, stakeholder notification, update cadence, documentation, and recovery steps.',
    'A driver is 55 miles from pickup for an appointment-based load with a 2:00 PM appointment. A crash has slowed the route and the new ETA is 2:35 PM.',
    '[{"criterion":"Speed of escalation","weight":30,"description":"Notifies stakeholders before the appointment is missed."},{"criterion":"Driver instructions","weight":25,"description":"Instructions are safe and specific."},{"criterion":"Documentation","weight":20,"description":"Captures ETA, cause, location, timestamps, and facility response."},{"criterion":"Recovery options","weight":25,"description":"Includes practical recovery or reschedule steps."}]'::jsonb,
    'scenario',
    'intermediate',
    true
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc5',
    '55555555-5555-4555-8555-555555555555',
    '55555555-5555-4555-8555-000000000002',
    'Late Pickup Scenario',
    'Manage late pickup risk on postal-style freight.',
    'Build a response plan covering driver instructions, stakeholder notification, route timing recovery, documentation, and follow-up after pickup.',
    'A driver assigned to a postal-style freight lane is delayed leaving the previous delivery. Pickup is scheduled for 6:00 PM, the driver ETA is now 6:40 PM, and the lane has an overnight delivery commitment.',
    '[{"criterion":"Service protection","weight":30,"description":"Prioritizes on-time performance and early escalation."},{"criterion":"Stakeholder communication","weight":25,"description":"Notifications are timely and factual."},{"criterion":"Route recovery","weight":25,"description":"Evaluates whether timing can still be recovered legally."},{"criterion":"Documentation","weight":20,"description":"Captures timestamps, cause, ETA, and pickup outcome."}]'::jsonb,
    'scenario',
    'intermediate',
    true
  )
on conflict (id) do update
set course_id = excluded.course_id,
    lesson_id = excluded.lesson_id,
    title = excluded.title,
    description = excluded.description,
    instructions = excluded.instructions,
    scenario = excluded.scenario,
    rubric = excluded.rubric,
    type = excluded.type,
    difficulty = excluded.difficulty,
    published = excluded.published;

commit;

select
  c.slug,
  c.title,
  count(distinct l.id) filter (where l.is_free) as free_lessons,
  count(distinct l.id) filter (where not l.is_free) as non_free_lessons,
  count(distinct a.id) filter (where a.published) as published_assignments,
  count(distinct q.id) filter (where q.published) as published_quizzes
from public.courses c
left join public.lessons l on l.course_id = c.id
left join public.assignments a on a.course_id = c.id
left join public.quizzes q on q.course_id = c.id
where c.slug in (
  'dispatch-fundamentals',
  'broker-communication',
  'load-board-mastery',
  'amazon-style-freight-training',
  'usps-postal-freight-training'
)
group by c.slug, c.title
order by c.slug;
