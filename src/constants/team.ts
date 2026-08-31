// ============================================================
// Project team shown on the "Developers" screen.
//
// The list is loaded from the Firestore `developers` collection
// (see services/api.ts -> getDevelopers). This array is only the
// DEMO data seeded on first run — edit the docs in the Firebase
// console to put in the real members.
//
// Each document has: name, id (student id), email, and optional
// photoUrl (any image URL, e.g. a Firebase Storage download link).
// ============================================================
export type Member = {
  name: string;
  id: string;
  email: string;
  photoUrl?: string;
};

export const DEMO_DEVELOPERS: Member[] = [
  { name: 'Member One', id: '0000000001', email: 'member1@example.com' },
  { name: 'Member Two', id: '0000000002', email: 'member2@example.com' },
  { name: 'Member Three', id: '0000000003', email: 'member3@example.com' },
  { name: 'Member Four', id: '0000000004', email: 'member4@example.com' },
];

export const PROJECT_TITLE = 'Railway Ticket Management';
export const PROJECT_SUBTITLE = 'A React Native + Firebase application';
