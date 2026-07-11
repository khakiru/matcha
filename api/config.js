export default function handler(request, response) {
  response.status(200).json({
    url: process.env.SUPABASE_URL || "https://hxhntsxrqxwrydwttupx.supabase.co",
    anonKey:
      process.env.SUPABASE_ANON_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6Imh4aG50c3hycXh3cnlkd3R0dXB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3NDk3MTUsImV4cCI6MjA5OTMyNTcxNX0.0XV48CZCCKzfjBPKUT-mxBYNLHG8Fnpg2GsAZMbdG7A"
  });
}
