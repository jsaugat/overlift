# Overlift App Context

This file is a quick reference for chatting about the app, its flows, and its database.

## What this app is

Overlift is a workout tracking app built with:

- Next.js App Router
- Supabase for auth + Postgres
- Tailwind CSS
- Recharts for charts

The app focuses on:

- workout logging
- training programs
- bodyweight tracking
- nutrition tracking
- rest timer support

## Main routes

- `/` → redirects to workout
- `/auth` → sign in
- `/auth/callback` → Supabase auth callback
- `/workout` → today’s workout session
- `/programs` → list of user programs
- `/programs/[programId]` → program details
- `/progress` → weight tracking / progress view
- `/nutrition` → nutrition logging and macros
- `/timer` → rest timer

## Important app files

- `app/workout/page.tsx` loads the current user, ensures they have a program, and passes the active program into the workout client.
- `lib/actions/programs.ts` contains server-side program logic such as loading programs, importing templates, and setting the active program.
- `lib/program.ts` contains helper functions for working with program day types and exercises.
- `lib/supabase-server.ts` creates a Supabase server client using request cookies.
- `types/db.ts` contains TypeScript types for the database tables used by the app.

## Program flow

The workout flow is roughly:

1. User opens `/workout`.
2. The server reads the Supabase session.
3. `ensureUserHasProgram(user.id)` checks if the user has an active program.
4. If not, a default template is imported for the user.
5. The program is passed into the workout UI.
6. The UI uses the program to decide which exercises to show for the current day.

## Program helpers

`lib/program.ts` provides helpers like:

- `getTodayKey()` → gets the current day name
- `getProgramDay(program, dayName)` → finds the matching program day
- `getExercisesForDay(program, dayName)` → returns exercises for that day sorted by position

## Database tables

### `exercises`

Master exercise list.

Columns:

- `id`
- `name`
- `muscle_group`
- `equipment`
- `day_type`
- plus program-related fields from migration:
  - `source`
  - `user_id`
  - `instructions`
  - `difficulty`
  - `safety_info`

Used by:

- workout programs
- set logs
- exercise selection UI

### `workout_sessions`

One workout session per user per day/day name.

Columns:

- `id`
- `user_id`
- `session_date`
- `day_name`
- `notes`
- `created_at`

Used by:

- workout logging
- set history
- progress tracking

### `set_logs`

Stores individual sets for a workout session.

Columns:

- `id`
- `user_id`
- `session_id`
- `exercise_id`
- `set_number`
- `weight_kg`
- `reps`
- `rest_seconds`
- `created_at`

Used by:

- logging sets
- charts and history
- latest-weight view

### `weight_logs`

Daily bodyweight entries.

Columns:

- `id`
- `user_id`
- `log_date`
- `weight_kg`
- `notes`

Used by:

- weight charts
- progress tracking

### `nutrition_logs`

Daily nutrition totals.

Columns:

- `id`
- `user_id`
- `log_date`
- `calories`
- `protein_g`
- `carbs_g`
- `fat_g`

Used by:

- nutrition dashboard
- macro tracking

### `program_templates`

Reusable template programs.

Columns:

- `id`
- `name`
- `description`
- `created_at`

Used by:

- importing a default program for a new user

### `template_days`

Days inside a template.

Columns:

- `id`
- `template_id`
- `day_order`
- `name`

Used by:

- building a template program structure

### `template_exercises`

Exercises inside a template day.

Columns:

- `id`
- `template_day_id`
- `exercise_id`
- `position`
- `sets`
- `rep_min`
- `rep_max`

Used by:

- defining the exercise order and target ranges in templates

### `user_programs`

User-owned programs.

Columns:

- `id`
- `user_id`
- `name`
- `is_active`
- `created_at`
- `starting_day`

Important:

- there is a unique index so only one program can be active per user

Used by:

- showing the user’s saved programs
- selecting the active workout program

### `user_program_days`

Days inside a user program.

Columns:

- `id`
- `user_program_id`
- `user_id`
- `day_order`
- `name`

Used by:

- rendering program days
- mapping the workout schedule

### `user_program_exercises`

Exercises inside a user program day.

Columns:

- `id`
- `user_program_day_id`
- `user_id`
- `exercise_id`
- `position`
- `sets`
- `rep_min`
- `rep_max`

Used by:

- rendering exercises for each day
- determining exercise order in the workout UI

## View

### `v_latest_weights`

A view that returns the latest logged weight per user/exercise.

Columns:

- `user_id`
- `exercise`
- `muscle_group`
- `weight_kg`
- `reps`
- `session_date`

Used by:

- weight history and charts

## Supabase auth and security

- The app uses Supabase Auth.
- Server-side code reads the current session from cookies.
- RLS policies restrict user data so users only see and modify their own rows.
- Shared reference data like global exercises and templates are readable by authenticated users.

## Useful code paths to inspect

- `app/workout/page.tsx`
- `app/programs/page.tsx`
- `app/programs/[programId]/page.tsx`
- `lib/actions/programs.ts`
- `lib/program.ts`
- `supabase/schema.sql`
- `supabase/migration.sql`
- `types/db.ts`

## Short mental model

If you want to understand the app quickly:

- `program_templates` are the seed source
- `user_programs` are the user’s saved plans
- `user_program_days` define the days
- `user_program_exercises` define the workout content
- `workout_sessions` and `set_logs` track what the user actually did
- `weight_logs` and `nutrition_logs` track progress outside training

## Chatting with the app

Good questions to ask about this app include:

- how a program is loaded for the current user
- how the active workout day is chosen
- how templates are copied into user programs
- how RLS protects user data
- where a table is used in the UI
- how to change the day mapping or program structure
