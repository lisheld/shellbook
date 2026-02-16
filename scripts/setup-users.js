/**
 * Script to create initial users in Firebase
 *
 * Prerequisites:
 * 1. Install firebase-admin: npm install --save-dev firebase-admin
 * 2. Download service account key from Firebase Console
 * 3. Save it as service-account-key.json in this directory
 *
 * Usage:
 * node scripts/setup-users.js
 */

import admin from 'firebase-admin';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

const users = [
  {
    email: 'liam@vday.local',
    username: 'liam',
    displayName: 'Liam',
    password: 'iloveyou'
  },
  {
    email: 'michelle@vday.local',
    username: 'michelle',
    displayName: 'Michelle',
    password: 'iloveyou'
  }
];

async function setupUsers() {
  console.log('🚀 Starting user setup...\n');

  for (const userData of users) {
    try {
      // Check if user already exists
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(userData.email);
        console.log(`⚠️  User ${userData.username} already exists (UID: ${userRecord.uid})`);
      } catch (error) {
        // User doesn't exist, create it
        userRecord = await auth.createUser({
          email: userData.email,
          password: userData.password,
          displayName: userData.displayName
        });
        console.log(`✅ Created auth user: ${userData.username} (UID: ${userRecord.uid})`);
      }

      // Create or update Firestore document
      await db.collection('users').doc(userRecord.uid).set({
        uid: userRecord.uid,
        username: userData.username,
        email: userData.email,
        displayName: userData.displayName,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      console.log(`✅ Created/updated Firestore doc for: ${userData.username}\n`);
    } catch (error) {
      console.error(`❌ Error creating ${userData.username}:`, error.message);
    }
  }

  console.log('🎉 User setup complete!');
  console.log('\n📝 Login credentials:');
  console.log('   Username: liam | Password: iloveyou');
  console.log('   Username: michelle | Password: iloveyou');
  console.log('\n⚠️  Remember to delete service-account-key.json after setup!');

  process.exit(0);
}

setupUsers().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
