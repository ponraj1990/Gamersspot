# Troubleshooting Database Connection Timeout

## Error: "timeout exceeded when trying to connect"

This error means the database connection is taking longer than 30 seconds to establish.

## Common Causes & Solutions

### 1. Supabase Project is Paused ⚠️ (Most Common)

**Check:**
- Go to Supabase Dashboard → Your Project
- Look at the top of the page - if it says "Paused", click "Restore"
- Free tier projects pause after 7 days of inactivity

**Solution:**
- Click "Restore" in Supabase Dashboard
- Wait 1-2 minutes for the project to fully restore
- Try your app again

### 2. Network Connectivity Issues

**Possible causes:**
- Temporary network issues
- Supabase pooler temporarily unavailable
- Regional connectivity problems

**Solution:**
- Wait 30-60 seconds and try again
- Check Supabase status page: https://status.supabase.com
- Verify your internet connection

### 3. Too Many Connections

**Possible causes:**
- Connection pool is exhausted
- Too many concurrent requests

**Solution:**
- Wait a few moments for connections to release
- Check Supabase Dashboard → Database → Connection Pooling
- Verify you're using Transaction Pooler (port 6543)

### 4. Cold Start Delay

**Possible causes:**
- First connection after inactivity takes longer
- Serverless function cold start

**Solution:**
- This is normal for serverless - wait a bit longer
- Subsequent requests should be faster
- Consider using a connection pool (already configured)

### 5. Connection String Issues

**Verify:**
- Connection string uses `pooler.supabase.com` (not `db.xxx.supabase.co`)
- Port is `6543` (Transaction Pooler)
- Password is URL-encoded (e.g., `@` becomes `%40`)

**Solution:**
- Double-check your `POSTGRES_URL` in Vercel
- Ensure it's the **Transaction Pooler** connection string
- Get it from: Supabase Dashboard → Settings → Database → Connection Pooling

## Quick Checks

1. **Is Supabase project active?**
   - Dashboard should show "Active" status
   - If paused, click "Restore"

2. **Is connection string correct?**
   - Should contain: `pooler.supabase.com:6543`
   - Should NOT contain: `db.xxx.supabase.co:5432`

3. **Are you using the right pooler?**
   - Use **Transaction** pooler (not Session)
   - Port should be **6543**

4. **Is the password encoded?**
   - Special characters like `@` should be `%40`
   - Example: `password@123` → `password%40123`

## Testing Connection

After fixing the issue, test the connection:

1. Visit: `https://your-app.vercel.app/api/test-db`
2. Should return: `{"success": true, ...}`
3. If still timing out, check Vercel function logs

## What I Changed

- Increased `connectionTimeoutMillis` from 10 seconds to 30 seconds
- Added better error messages for timeout errors
- Added logging to track connection attempts

## Still Having Issues?

1. Check Vercel function logs for the exact error
2. Verify Supabase project is active (not paused)
3. Test connection string directly in a PostgreSQL client
4. Check Supabase status page for outages

