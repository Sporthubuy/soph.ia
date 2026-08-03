import { createBrowserClient } from "@supabase/ssr";

// Simulate authenticated user
const supabase = createBrowserClient(
  "https://upyyjwyvkbvjjfxhntzc.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVweXlqd3l2a2J2ampmeGhudHpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwOTExOTQsImV4cCI6MjEwMDY2NzE5NH0.ImUmf8TuyjZrRn31tHFmiRD8Edh1k8ddkF3pN_AgZXQ"
);

// Set the session manually
const accessToken = "eyJhbGciOiJFUzI1NiIsImtpZCI6ImI1ZmViYmRmLWU2YjQtNDBlYi1hYjljLTMxOGZlNjVkNzRjMCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3VweXlqd3l2a2J2ampmeGhudHpjLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJmMDljMGQxMS1lNWY2LTQ3NGEtYmZmNi1kOWNjMGFlYmNmYjQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzg1Nzg1NjM4LCJpYXQiOjE3ODU3ODIwMzgsImVtYWlsIjoicmcuYXZpYWdhQGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWxfdmVyaWZpZWQiOnRydWV9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzg1NzgyMDM4fV0sInNlc3Npb25faWQiOiI3MjhjOWRjZi00MGNmLTQ5NDctOTAyMy05OTE5OGU4ODE3ZWEiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.pGzYFjOKme7l2DryTsTG72FWORpP3y6exIXvRIrKPgmJ6nm6VyNzcngkxnDvnUWjxQrtLBJSkie5s4dyJgUQIw";

async function testRLS() {
  await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: "dtebgo62u2dc",
  });

  const { data, error } = await supabase
    .from("admin_roles")
    .select("*")
    .eq("user_id", "f09c0d11-e5f6-474a-bff6-d9cc0aebcfb4");

  console.log("Admin role data:", data);
  console.log("Error:", error?.message);
}

testRLS();
