import { Injectable } from '@angular/core';
import { Observable, of, throwError, timer } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

// Types
export type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error';

export interface UsernameValidationResult {
  isAvailable: boolean;
  username: string;
  message: string;
  timestamp: Date;
}

export interface SaveUsernameResponse {
  success: boolean;
  payload: {
    username: string;
    checkedAt: string;
  };
  savedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsernameValidatorService {
  // Simulated reserved usernames (like admin, root, etc.)
  private reservedUsernames = new Set([
    'admin', 'root', 'system', 'administrator', 'test'
  ]);

  /**
   * Check if username is available
   * Uses RxJS operators to simulate network delay and server response
   * 
   * Special usernames for testing error handling:
   * - 'timeout' - simulates network timeout
   * - 'error' - simulates server error (500)
   */
  checkUsernameAvailability(username: string): Observable<UsernameValidationResult> {
    // Normalize username
    const normalizedUsername = username.toLowerCase().trim();

    // Simulate network latency (500ms - 1500ms random)
    const networkDelay = Math.floor(Math.random() * 1000) + 500;

    return timer(networkDelay).pipe(
      switchMap(() => {
        // Simulate network timeout
        if (normalizedUsername === 'timeout') {
          return throwError(() => new Error('Request timed out. Please check your connection and try again.'));
        }
        
        // Simulate server error
        if (normalizedUsername === 'error') {
          return throwError(() => new Error('Server error (500). Please try again later.'));
        }

        // Check if username is reserved
        if (this.reservedUsernames.has(normalizedUsername)) {
          return of({
            isAvailable: false,
            username: normalizedUsername,
            message: `"${username}" is already taken (reserved username)`,
            timestamp: new Date()
          } as UsernameValidationResult);
        }

        // Check username length requirements
        if (normalizedUsername.length < 3) {
          return of({
            isAvailable: false,
            username: normalizedUsername,
            message: 'Username must be at least 3 characters long',
            timestamp: new Date()
          } as UsernameValidationResult);
        }

        // Simulate taken usernames (for demo purposes)
        const takenUsernames = ['john', 'jane', 'bob', 'alice', 'testuser'];
        if (takenUsernames.includes(normalizedUsername)) {
          return of({
            isAvailable: false,
            username: normalizedUsername,
            message: `"${username}" is already taken`,
            timestamp: new Date()
          } as UsernameValidationResult);
        }

        // Username is available
        return of({
          isAvailable: true,
          username: normalizedUsername,
          message: `"${username}" is available!`,
          timestamp: new Date()
        } as UsernameValidationResult);
      }),
      catchError(error => {
        console.error('Error checking username:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Simulate saving the username
   * Throws error if username is 'savefail' for testing
   */
  saveUsername(username: string): Observable<SaveUsernameResponse> {
    const networkDelay = 800;

    return timer(networkDelay).pipe(
      switchMap(() => {
        // Simulate save failure for testing
        if (username.toLowerCase() === 'savefail') {
          return throwError(() => new Error('Failed to save username. Database connection error.'));
        }

        return of({
          success: true,
          payload: {
            username: username,
            checkedAt: new Date().toISOString()
          },
          savedAt: new Date().toISOString()
        } as SaveUsernameResponse);
      })
    );
  }
}

