# Design Doc: Logging System & Console Cleanup

**Date:** 2025-05-15
**Topic:** Task 2 - Logging System & Console Cleanup

## Goal
Centralize logging in the SyncStyle project by implementing a robust `logger` utility and replacing all direct `console` calls with it. This ensures cleaner production logs and better developer experience in dev mode.

## Architecture
- **Logger Utility**: A singleton-like export in `src/utils/logger.ts` that wraps `console` methods.
- **Development vs Production**: 
    - `info` logs are only shown in development.
    - `warn` and `error` logs are shown in both environments (but can be extended to send to external services in production).
- **Global Replacement**: Systematic identification and replacement of `console.log`, `console.warn`, and `console.error` across the `src` directory.

## Implementation Details

### 1. Logger Utility
The logger will provide three levels:
- `info`: For general information (Dev only).
- `warn`: For non-critical issues.
- `error`: For critical failures.

### 2. File Identification
We will use `grep` and potentially ESLint to find all instances of `console`.

### 3. TDD Approach
- Create a test file `src/utils/logger.test.ts`.
- Mock `console` methods.
- Verify that `logger` calls the correct `console` methods based on the environment.

## Success Criteria
- [ ] `src/utils/logger.ts` matches the provided spec.
- [ ] No direct `console.log` calls remain in the `src` directory (excluding comments/examples).
- [ ] All tests pass.
- [ ] The app still functions correctly.
