# Groupify

A simple web app that lets users scan a QR code to join an event and get randomly assigned into groups. Perfect for games, team-building, or event coordination.

## Features

### Admin View
- Create a new session with name and number of groups
- Generate QR code for participants to join
- Live list of all participants joining
- Randomly assign participants into groups
- Option to reshuffle or reset groups

### User View
- Scan QR code to join session
- Enter name to join
- See assigned group in real-time
- View all group members

## Tech Stack

- **Frontend**: React with Vite
- **Styling**: TailwindCSS
- **Database**: Firebase Firestore
- **QR Code**: qrcode.react
- **Routing**: React Router

## Setup

### 1. Firebase Configuration

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Update `src/firebase.js` with your Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Development

```bash
npm run dev
```

### 4. Build for Production

```bash
npm run build
```

## Deployment on Railway

1. Connect your GitHub repository to Railway
2. Railway will automatically detect the Vite configuration
3. Set your Firebase environment variables in Railway dashboard
4. Deploy!

The app will be available at your Railway domain.

## Usage

1. **Admin**: Go to `/admin` to create a session
2. **Participants**: Scan the QR code or visit the join URL
3. **Admin**: Click "Assign Groups" to randomly distribute participants
4. **Everyone**: See real-time group assignments

## Data Model

### Sessions Collection
```javascript
{
  name: string,
  groupCount: number,
  status: "open" | "assigned" | "locked",
  createdAt: timestamp
}
```

### Participants Subcollection
```javascript
{
  name: string,
  joinedAt: timestamp,
  group: number | null
}
```

## Environment Variables

For Railway deployment, set these environment variables:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## License

MIT