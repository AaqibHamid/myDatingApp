# Username Checker

A simple Angular app to check if a username is available. Built this to practice reactive forms, async validators, and signals.

## What it does

- Type a username and it checks if it's available (with a fake delay to simulate an API)
- Shows validation errors for things like min/max length, invalid characters
- Has a debug panel at the bottom so you can see what's happening with the form state

## Quick start

```bash
cd username-checker
npm install
ng serve
```

Then open http://localhost:4200

## Project structure

```
src/app/
├── components/
│   ├── username-checker/   # main form
│   ├── username-input/     # reusable input field
│   ├── status-indicator/   # shows checking/available/taken status
│   └── form-debug/         # debug panel
└── services/
    └── username-validator.service.ts
```

## Reusability

All components are designed to be reusable across the application:

### UsernameInputComponent
- Implements `ControlValueAccessor` - works with any reactive form using `formControlName`
- Configurable via inputs: `label`, `placeholder`, `minLength`, `maxLength`
- Can be dropped into any form that needs username input

```html
<!-- Use it anywhere -->
<app-username-input
  formControlName="username"
  label="Choose Username"
  [minLength]="4"
  [maxLength]="15"
/>
```

### StatusIndicatorComponent
- Generic status display - not tied to username validation
- Accepts any status string and message
- Reusable for any async operation feedback

```html
<!-- Use for any async status -->
<app-status-indicator [status]="'loading'" [message]="'Processing...'"/>
```

### FormDebugComponent
- Works with any reactive form
- Pass any form's state to visualize it
- Useful for debugging any form in development

### UsernameValidatorService
- Injectable anywhere via `inject(UsernameValidatorService)`
- Returns Observables - easy to compose with other streams
- Swap implementation without changing components

## Error Handling

The app handles error conditions gracefully:

### Simulated Error Scenarios
Test error handling by typing these usernames:

| Username | Error Type | Message |
|----------|-----------|---------|
| `timeout` | Network Timeout | "Request timed out. Please check your connection..." |
| `error` | Server Error | "Server error (500). Please try again later." |

### How Errors are Handled

1. **In the async validator** - `catchError` catches any thrown errors:
```typescript
catchError((error: any) => {
  this.status.set('error');
  this.message.set(error.message || 'Failed to check username availability.');
  return of(null);
})
```

2. **In the service** - Errors thrown with descriptive messages:
```typescript
if (normalizedUsername === 'timeout') {
  return throwError(() => new Error('Request timed out...'));
}
```

3. **In the UI** - Status indicator shows error state with red styling

## Architectural Decisions

### Why Signals for State Management?

I chose Angular Signals (`signal()`) over traditional approaches like:

- **BehaviorSubject/Observable**: Signals are simpler, no need to manage subscriptions or use async pipe everywhere. They just work.
- **Component properties**: Signals give us fine-grained reactivity. When `status()` changes, only the parts of the template using it re-render.
- **NgRx/other state libs**: Overkill for this size of app. Signals handle local component state really well without the boilerplate.

```typescript
status = signal<UsernameStatus>('idle');
// Update: this.status.set('checking');
// Read in template: {{ status() }}
```

### Why Reactive Forms over Template-Driven?

Reactive Forms made sense here because:

1. **Async validators** - Way easier to set up with reactive forms. Just pass a function that returns an Observable.
2. **Programmatic control** - I needed to manually trigger validation, reset the form, check validity - all cleaner with reactive forms.
3. **Testability** - Can unit test the form logic without touching the DOM.

### Why ControlValueAccessor for the Input?

Made `UsernameInputComponent` implement `ControlValueAccessor` so it works seamlessly with `formControlName`. This way:

- The parent doesn't need to know about the input's internal implementation
- Validation errors flow through automatically
- Can reuse it anywhere that needs a username field

### Why Debounce in the Async Validator?

Put the debounce (`timer(500)`) inside the async validator itself rather than in `valueChanges`. Here's why:

```typescript
// Inside availabilityValidator:
return timer(500).pipe(
  switchMap(() => this.validatorService.checkUsernameAvailability(value))
);
```

- The validator gets called on every keystroke anyway (Angular's behavior)
- By debouncing inside, we control exactly when the API call happens
- `switchMap` cancels pending requests if user keeps typing

### Why Mock the HTTP Service This Way?

Used `timer()` + `switchMap` + `of()` to simulate realistic API behavior:

```typescript
return timer(networkDelay).pipe(
  switchMap(() => of({ isAvailable: true, ... }))
);
```

- `timer()` simulates network latency (random 500-1500ms)
- Returns proper Observable so the component code is identical to real HTTP calls
- Easy to swap for real `HttpClient` later - just change the service

### Why Standalone Components?

All components use `standalone: true` because:

- No NgModule boilerplate
- Explicit imports - you see exactly what each component needs
- Better tree-shaking
- It's the direction Angular is heading anyway

## Validation rules

- Required
- 3-20 characters
- Only letters, numbers, underscores (no spaces or special chars)
- Checks availability after sync validation passes

## Test usernames

| Try typing... | What happens |
|---------------|--------------|
| `admin`, `system`, `test` | Shows as reserved |
| `john`, `jane`, `bob` | Shows as taken |
| `mycoolusername` | Should be available |
| `ab` | Too short error |
| `user@name` | Invalid character error |
| `timeout` | Network timeout error |
| `error` | Server error (500) |

## How it works

1. You type something
2. Sync validators run immediately (required, length, pattern)
3. If those pass, async validator kicks in
4. Debounce waits 500ms
5. Then calls the mock service (another 500-1500ms delay)
6. Status updates to available/taken/error

## Things I learned building this

- How to wire up async validators with reactive forms
- Using `ControlValueAccessor` to make a reusable input component
- Angular signals for state instead of BehaviorSubjects
- The new `@if` syntax is way cleaner than `*ngIf`
- RxJS `takeUntil` pattern for cleaning up subscriptions

## Notes

- The "API" is just a mock service with `timer()` to fake network delay
- No actual backend - everything is client side
- The form debug component is just for development, you'd remove it in production

## Built with

- Angular 21
- RxJS
- TypeScript
