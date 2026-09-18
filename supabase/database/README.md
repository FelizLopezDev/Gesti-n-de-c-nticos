# Database authorization foundation

Clerk is the identity provider. The authenticated JWT `sub` claim is the only identity input used by the database, and `profiles.clerk_user_id` is its bridge to PostgreSQL.

`profiles.role` is the application role source (`USER`, `ADMIN`, or `SUPERADMIN`) and `profiles.status` is the account-status source (`ACTIVE` or `DISABLED`). Neither field, nor any other profile field, is client-editable. RLS is the database authorization layer; the initial policy lets a user read only their own profile and lets an `ADMIN` or `SUPERADMIN` read profiles for administration.

The real `SUPERADMIN` profile is bootstrapped separately and is not part of a migration. Only one profile can hold that role, including if its status is `DISABLED`.

`private` holds internal security helpers and must not be added to Supabase's Data API exposed schemas. Future privileged profile mutations must use trusted server-side logic or tightly controlled database functions.
