# Multi-User Test Plan

## Goal
Verify multiple users can post notes/alerts and see each other's data.

## Setup
1. Run against one shared backend URL (not separate local instances).
2. Use at least 3 clients:
   - Browser window A
   - Incognito/private window B
   - Phone browser C
3. Set all clients to the same location/radius in Preferences.

## Test Cases
1. Signal propagation
   - A drops a signal.
   - B and C should see it within polling interval (30s) or on refresh.
2. Static alert propagation
   - B posts a static report.
   - A and C should receive it in feed/map after poll.
3. Reactions
   - C reacts to A's signal.
   - A and B should show updated counts after poll.
4. Resolve workflow
   - A resolves B's report.
   - Report should move to resolved state for all clients.
5. Location isolation
   - Move C to a different location/radius.
   - C should no longer see distant items outside selected radius.
6. News relevance sanity check
   - Security tab should show local crime-related headlines only.

## Pass Criteria
- Shared items become visible across clients.
- No client-specific divergence after two poll cycles.
- No blocking errors in browser console.
