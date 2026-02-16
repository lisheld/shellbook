# Our Valentine's Day 2026 💕

A private, Instagram-style photo sharing website for Liam and Michelle to capture and share Valentine's Day memories together.

## Features

- 📸 **Photo Upload**: Upload photos with captions (max 500 characters)
- 🎨 **Beautiful Feed**: Instagram-style feed with photos sorted by date
- 📅 **Day Headers**: Posts automatically grouped by day
- 🔐 **Secure Login**: Username/password protected (only Liam and Michelle)
- 💕 **Valentine's Theme**: Pink and red color scheme with hearts
- 📱 **Responsive**: Works beautifully on mobile, tablet, and desktop
- ⚡ **Real-time Updates**: Feed updates automatically when new photos are posted

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Backend**: Firebase (Auth + Firestore + Storage)
- **Deployment**: GitHub Pages
- **CI/CD**: GitHub Actions

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd vday2026
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (name it whatever you like, e.g., "vday2026")
3. Enable the following services:

#### Enable Authentication
- Go to **Authentication** → **Sign-in method**
- Enable **Email/Password** provider
- Click **Save**

#### Enable Firestore Database
- Go to **Firestore Database** → **Create database**
- Start in **test mode** (we'll add security rules later)
- Choose a location close to you
- Click **Enable**

#### Enable Storage
- Go to **Storage** → **Get started**
- Start in **test mode**
- Click **Done**

#### Get Firebase Configuration
- Go to **Project Settings** (gear icon) → **General**
- Scroll down to "Your apps"
- Click the web icon `</>`
- Register your app (name: "Valentine's Day 2026")
- Copy the Firebase configuration values

### 4. Configure Environment Variables

1. Copy the example file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 5. Create Initial Users

1. Install Firebase Admin SDK:
```bash
npm install --save-dev firebase-admin
```

2. Download service account key:
   - Go to **Project Settings** → **Service accounts**
   - Click **Generate new private key**
   - Save the file as `scripts/service-account-key.json`

3. Run the setup script:
```bash
node scripts/setup-users.js
```

4. **Important**: Delete the service account key file after setup:
```bash
rm scripts/service-account-key.json
```

This creates two users:
- **Username**: `liam` | **Password**: `iloveyou`
- **Username**: `michelle` | **Password**: `iloveyou`

### 6. Deploy Firebase Security Rules

Install Firebase CLI (if not already installed):
```bash
npm install -g firebase-tools
```

Login to Firebase:
```bash
firebase login
```

Initialize Firebase in your project:
```bash
firebase init
```
- Select **Firestore** and **Storage**
- Use existing project (select your project)
- Use `firestore.rules` and `storage.rules` (they're already created)

Deploy the security rules:
```bash
firebase deploy --only firestore:rules,storage:rules
```

### 7. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173/vday2026](http://localhost:5173/vday2026) in your browser.

### 8. Deploy to GitHub Pages

1. Update `vite.config.ts` if your repo name is different:
```typescript
base: '/your-repo-name/',  // Change this to match your GitHub repo name
```

2. Add Firebase config as GitHub Secrets:
   - Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Add each of these:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`

3. Enable GitHub Pages:
   - Go to **Settings** → **Pages**
   - Source: **Deploy from a branch**
   - Branch: **gh-pages** / **/ (root)**
   - Click **Save**

4. Push to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

5. GitHub Actions will automatically build and deploy your site!

6. Visit your site at: `https://yourusername.github.io/vday2026/`

## Usage

### Logging In

1. Visit the website
2. Enter username: `liam` or `michelle`
3. Enter password: `iloveyou`
4. Click **Sign In**

### Uploading Photos

1. Click the **+** button (bottom-right corner)
2. Select a photo from your device
3. Add a caption (optional, max 500 characters)
4. Click **Upload**

The photo will appear in the feed automatically!

### Viewing Photos

- Photos are sorted by most recent first
- Day headers group photos by date
- Scroll to see all photos
- Click **About** to read the special note

## Project Structure

```
src/
├── components/
│   ├── auth/          # Login form and protected route
│   ├── feed/          # Photo feed, cards, day headers
│   ├── upload/        # Upload modal and image preview
│   ├── layout/        # Header component
│   └── about/         # About page
├── context/           # Authentication context
├── hooks/             # Custom React hooks
├── services/          # Firebase services
├── types/             # TypeScript interfaces
└── utils/             # Helper functions
```

## Customization

### Change the About Page Content

Edit `src/components/about/AboutPage.tsx` and replace the placeholder text with your personal note.

### Change Colors

Edit `src/index.css` and update the color values in the `@theme` section:
```css
@theme {
  --color-valentine-pink: #ff69b4;
  --color-valentine-red: #dc143c;
  --color-valentine-light-pink: #ffb6c1;
  --color-valentine-rose: #ff007f;
}
```

### Add More Users

If you want to add more users later, update `scripts/setup-users.js` and run it again.

## Troubleshooting

### Build Errors

Make sure all environment variables are set in `.env` for local development and in GitHub Secrets for deployment.

### Firebase Permission Errors

Make sure you've deployed the security rules:
```bash
firebase deploy --only firestore:rules,storage:rules
```

### 404 Errors on GitHub Pages

Make sure `vite.config.ts` has the correct `base` path matching your repo name.

## Firebase Free Tier Limits

The Firebase free tier (Spark plan) includes:
- **Firestore**: 1 GB storage, 50K reads/day, 20K writes/day
- **Storage**: 5 GB storage, 1 GB/day downloads
- **Authentication**: Unlimited

This should be more than enough for two users!

## Security

- All routes are password protected
- Only authenticated users can view and upload photos
- Users can only upload to their own storage folder
- Firestore security rules enforce data access controls
- Service account keys should never be committed to git

## Made with ❤️

Created with love for Valentine's Day 2026.

---

Happy Valentine's Day! 💕
