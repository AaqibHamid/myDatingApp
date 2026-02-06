# TODO - Fix deleteMessage TypeScript Error

## Task: Fix TypeScript error in messages.ts `deleteMessage` function

### Issues:
1. `metadata` can be `undefined` but `PaginatedResult<Message>` requires `Pagination`
2. Pagination calculation logic needs fixing

### Steps:
- [x] Understand the error and read relevant files
- [x] Create plan and get user approval
- [x] Fix the deleteMessage function in messages.ts

## Fix Plan:
1. Always return `metadata: Pagination` (never undefined) when `prev` exists
2. Fix pagination calculation:
   - `newTotalCount = prev.metadata.totalCount - 1`
   - `newTotalPages = Math.ceil(newTotalCount / prev.metadata.pageSize)`
   - `newCurrentPage = Math.min(prev.metadata.currentPage, Math.max(1, newTotalPages))`
3. Add error callback to handle API failures

