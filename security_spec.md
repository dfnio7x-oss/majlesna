# Firestore Security Rules Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Default Deny**: Unmatched Firestore paths deny all reads and writes unconditionally.
2. **Verified Identity**: Write operations require a signed-in Firebase Auth user with `request.auth.token.email_verified == true`.
3. **PII Isolation**: `/users/{userId}/private/{docId}` (email, preferences) is readable and writable exclusively by the authenticated owner (`request.auth.uid == userId`).
4. **Immutable Ownership & Timestamps**: `uid` and `createdAt` cannot be modified after creation; `createdAt` and `updatedAt` must equal `request.time`.
5. **Bounded Types & Strict Keys**: Every create enforces exact `keys().hasAll(...)` and `keys().hasOnly(...)`; every update enforces `isValid[Entity](incoming())` alongside `affectedKeys().hasOnly(...)`.
6. **Match History Integrity**: Match documents in `/users/{userId}/matches/{matchId}` require parent `/users/{userId}` existence and cannot be tampered with once recorded (create-only for owner).

## 2. Dirty Dozen Adversarial Payloads (Expected: PERMISSION_DENIED)
1. **Identity Spoofing Create**: Authenticated user A attempts to create `/users/userB` with `uid: "userB"`.
2. **Shadow Field Injection**: Owner creates `/users/userA` including undeclared `"isAdmin": true`.
3. **Oversized Path Poisoning**: User attempts `get` on `/users/` + 500-char random ID.
4. **Unverified Email Write**: Signed-in user with `email_verified: false` attempts to write `/users/userA`.
5. **PII Cross-Read**: Authenticated user B attempts to read `/users/userA/private/account`.
6. **Blanket List Query Scraping**: Authenticated user B runs `list` on `/users` without owner filter.
7. **Timestamp Forgery**: Owner sends custom past `createdAt` instead of `serverTimestamp()`.
8. **Immutable Field Mutation**: Owner updates `/users/userA` changing `createdAt` or `uid`.
9. **Value Type Poisoning**: Owner updates `totalPoints` on `/users/userA` to `"999999"` (string) or `-50`.
10. **Username Boundary Overflow**: Owner sets `username` to 2 chars or 40 chars (outside `3..16`).
11. **Array Exhaustion Attack**: Owner pushes > 50 elements or non-string element into `unlockedAchievements`.
12. **Orphan Match Record**: User creates `/users/userA/matches/m1` before `/users/userA` exists, or mutates an existing match record.
