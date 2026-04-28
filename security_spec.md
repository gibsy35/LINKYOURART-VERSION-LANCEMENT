# Security Specification: Elite Institutional Rules

## Data Invariants
1. **User Identity Invariant**: A user profile CANNOT be modified by anyone except the owner. The `role` and `isPro` fields are immutable for non-admins to prevent privilege escalation.
2. **Project Integrity Invariant**: Only owners or admins can modify a project. Document IDs must be strictly validated.
3. **Message Confidentiality Invariant**: Messages are ONLY readable by the `fromId` or `toId`. Users cannot spoof `fromId`.
4. **Relational Integrity**: A project must have a valid `issuerUid` matching the creator.

## The "Dirty Dozen" Payloads (Attack Vectors)
1. **Privilege Escalation**: Non-admin user tries to set `role: 'ADMIN'` in their profile.
2. **Identity Spoofing (User)**: User A tries to update User B's profile. 
3. **Identity Spoofing (Message)**: User A tries to send a message with `fromId: 'user_B_id'`.
4. **Message Snooping**: User C tries to read a message between User A and User B.
5. **Orphaned Writes**: Creating a project with a random `issuerUid` that doesn't exist or doesn't match the current user.
6. **Shadow Fields**: Adding `isVerified: true` to a profile update when it's not in the whitelist.
7. **Resource Poisoning**: Sending a 1MB string as a `displayName`.
8. **ID Poisoning**: Using a 1KB string as a `projectId` path variable.
9. **Terminal State Bypass**: Attempting to move a project from `REJECTED` back to `PENDING`.
10. **Timestamp Manipulation**: Sending a client-side `createdAt` set to the future.
11. **PII Leak**: Authenticated user trying to list all users' emails.
12. **Batch Bypass**: Trying to delete a project the user doesn't own.

## Test Runner Logic (firestore.rules.test.ts summary)
- `test('escalation')`: Deny `update` on `/users/{id}` if `request.resource.data.role` changes to ADMIN.
- `test('spoofing')`: Deny `create` on `/messages/{id}` if `request.resource.data.fromId != request.auth.uid`.
- `test('confidentiality')`: Deny `get` on `/messages/{id}` if `request.auth.uid` is neither `fromId` nor `toId`.
- `test('integrity')`: Deny `create` on `/projects/{id}` if `request.resource.data.issuerUid != request.auth.uid`.
- `test('schema')`: Deny `update` on `/users/{id}` if `request.resource.data.keys().hasOnly(['displayName', 'bio', ...])` is violated.
