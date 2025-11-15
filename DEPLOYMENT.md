# Deploying to Vercel

## Method 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Prepare Your Repository
1. Make sure your code is pushed to GitHub, GitLab, or Bitbucket
2. Ensure all files are committed and pushed to your repository

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in (or create an account)
2. Click **"Add New Project"** or **"Import Project"**
3. Import your Git repository:
   - Connect your Git provider (GitHub, GitLab, or Bitbucket)
   - Select your repository
   - Click **"Import"**

### Step 3: Configure Build Settings
Vercel will auto-detect Vite, but verify these settings:
- **Framework Preset:** Vite
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `dist` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait for the build to complete (usually 1-2 minutes)
3. Your site will be live at `https://your-project-name.vercel.app`

---

## Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy
From your project directory:
```bash
vercel
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account
- **Link to existing project?** → No (for first deployment)
- **Project name?** → Press Enter (uses folder name)
- **Directory?** → Press Enter (uses current directory)
- **Override settings?** → No

### Step 4: Production Deploy
For production deployment:
```bash
vercel --prod
```

---

## Environment Variables (if needed)

If you need environment variables:
1. Go to your project settings on Vercel dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add your variables
4. Redeploy

---

## Custom Domain

To add a custom domain:
1. Go to your project on Vercel dashboard
2. Navigate to **Settings** → **Domains**
3. Add your domain
4. Follow DNS configuration instructions

---

## Automatic Deployments

Vercel automatically deploys:
- **Production:** Every push to your main/master branch
- **Preview:** Every push to other branches and pull requests

---

## Build Configuration

The project includes `vercel.json` with:
- Build command: `npm run build`
- Output directory: `dist`
- Framework: Vite
- SPA routing support (all routes redirect to index.html)

---

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version (Vercel uses Node 18.x by default)

### Routing Issues
- The `vercel.json` includes SPA routing rewrites
- All routes redirect to `index.html` for client-side routing

### Local Testing
Test your production build locally:
```bash
npm run build
npm run preview
```

---

## Quick Deploy Button

You can also add this to your README.md:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/your-repo)

Replace `your-username/your-repo` with your actual repository URL.

