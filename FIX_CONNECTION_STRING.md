# Fix Connection String Truncation Issue

## Problem
The connection string in Vercel is being truncated. The hostname shows as `aws-1-` instead of `aws-1-ap-south-1.pooler.supabase.com`.

## Solution: Update POSTGRES_URL in Vercel

### Step 1: Get the Complete Connection String

Your **Transaction Pooler** connection string should be:

```
postgresql://postgres.ejzcfmsxibdanknonuiq:Welcome%4013195@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require
```

**Important Notes:**
- The `@` in the password must be encoded as `%40`
- The entire string must be on ONE line (no line breaks)
- No spaces before or after
- Must use port `6543` (pooler port)

### Step 2: Update in Vercel

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Select your project

2. **Go to Settings → Environment Variables**

3. **Find `POSTGRES_URL`** (or create it if it doesn't exist)

4. **Delete the existing value** (it's truncated)

5. **Paste the COMPLETE connection string:**
   ```
   postgresql://postgres.ejzcfmsxibdanknonuiq:Welcome%4013195@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require
   ```

6. **IMPORTANT:**
   - Make sure you paste it as ONE continuous line
   - No line breaks
   - No spaces at the beginning or end
   - Select **all environments** (Production, Preview, Development)

7. **Click "Save"**

### Step 3: Verify the Value

After saving, click on the `POSTGRES_URL` variable to view it. It should show:
- Starts with: `postgresql://postgres.ejzcfmsxibdanknonuiq:****@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require`
- The hostname should be complete: `aws-1-ap-south-1.pooler.supabase.com`
- Port should be: `6543`

### Step 4: Redeploy

1. **Go to Deployments tab**
2. **Click the three dots (⋯) on the latest deployment**
3. **Click "Redeploy"**
4. **Wait for deployment to complete**

### Step 5: Test

After redeployment, visit:
```
https://your-app.vercel.app/api/test-db
```

You should see:
```json
{
  "success": true,
  "message": "Database connection successful",
  "environment": {
    "hostname": "pooler (correct)"
  }
}
```

## Common Mistakes to Avoid

❌ **DON'T:**
- Copy with line breaks
- Add spaces
- Use the direct connection string (db.xxx.supabase.co)
- Forget to encode `@` as `%40` in password
- Use port 5432 (use 6543 for pooler)

✅ **DO:**
- Copy the entire string as one line
- Use the Transaction Pooler connection string
- Use port 6543
- Encode special characters in password
- Select all environments when saving

## If Still Not Working

1. **Double-check in Supabase:**
   - Go to Supabase Dashboard → Settings → Database
   - Click "Connection pooling" tab
   - Copy the "Transaction" pooler connection string
   - Make sure you're using the **Transaction** pooler (not Session)

2. **Verify password encoding:**
   - If your password is `Welcome@13195`
   - It must be encoded as `Welcome%4013195` in the connection string

3. **Check for hidden characters:**
   - Delete the environment variable completely
   - Type it manually or copy from a plain text editor
   - Don't copy from formatted documents (Word, PDF, etc.)

4. **Test locally first:**
   - Add to `.env.local`:
     ```
     POSTGRES_URL=postgresql://postgres.ejzcfmsxibdanknonuiq:Welcome%4013195@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require
     ```
   - Run `npm run dev`
   - Check if it works locally

## Still Having Issues?

Share:
1. Screenshot of your Vercel environment variable (with password masked)
2. The response from `/api/test-db` endpoint
3. The exact error from Vercel function logs

