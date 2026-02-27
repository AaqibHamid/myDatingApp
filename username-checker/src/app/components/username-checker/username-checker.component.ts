import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable, of, Subject, Subscription, timer } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, map, catchError, switchMap } from 'rxjs/operators';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { UsernameValidatorService, UsernameStatus, UsernameValidationResult } from '../../services/username-validator.service';
import { StatusIndicatorComponent } from '../status-indicator/status-indicator.component';
import { FormDebugComponent } from '../form-debug/form-debug.component';
import { UsernameInputComponent } from '../username-input/username-input.component';

@Component({
  selector: 'app-username-checker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StatusIndicatorComponent, FormDebugComponent, UsernameInputComponent],
  templateUrl: './username-checker.component.html',
  styleUrl: './username-checker.component.css'
})
export class UsernameCheckerComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private validatorService = inject(UsernameValidatorService);

  usernameForm!: FormGroup;
  minLength = 3;
  maxLength = 20;

  status = signal<UsernameStatus>('idle');
  message = signal<string>('');
  isLoading = signal<boolean>(false);
  saveSuccess = signal<boolean>(false);
  savedPayload = signal<string>('');

  private destroy$ = new Subject<void>();
  private subscriptions: Subscription[] = [];

  constructor() {
    this.initializeForm();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private initializeForm(): void {
    this.usernameForm = this.fb.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(this.minLength),
          Validators.maxLength(this.maxLength),
          Validators.pattern(/^[a-zA-Z0-9_]+$/)
        ]
      ]
    });

    this.usernameControl?.setAsyncValidators(this.availabilityValidator);
    
    // Listen to value changes to reset status when empty or has sync errors
    this.usernameControl?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe((value) => {
      const trimmedValue = value?.trim() || '';
      
      // Reset status if empty
      if (!trimmedValue) {
        this.status.set('idle');
        this.message.set('');
        return;
      }
      
      // Reset status if has sync validation errors
      const hasMinLengthError = trimmedValue.length < this.minLength;
      const hasMaxLengthError = trimmedValue.length > this.maxLength;
      const hasPatternError = !/^[a-zA-Z0-9_]+$/.test(trimmedValue);
      
      if (hasMinLengthError || hasMaxLengthError || hasPatternError) {
        this.status.set('idle');
        this.message.set('');
      }
    });
  }

  /**
   * Async validator with built-in debounce (500ms)
   * This ensures we minimize API calls as per requirements
   */
  private availabilityValidator = (control: AbstractControl): Observable<ValidationErrors | null> => {
    const value = control.value?.trim();
    
    // Reset status and return null for empty values
    if (!value) {
      this.status.set('idle');
      this.message.set('');
      return of(null);
    }

    // Check if control has sync validation errors manually
    const hasMinLengthError = value.length < this.minLength;
    const hasMaxLengthError = value.length > this.maxLength;
    const hasPatternError = !/^[a-zA-Z0-9_]+$/.test(value);

    if (hasMinLengthError || hasMaxLengthError || hasPatternError) {
      this.status.set('idle');
      this.message.set('');
      return of(null);
    }

    // Set checking state immediately for user feedback
    this.status.set('checking');
    this.message.set('Checking availability...');

    // Debounce: wait 500ms before making the API call
    return timer(500).pipe(
      switchMap((): Observable<UsernameValidationResult | null> => {
        // Double-check value hasn't changed during debounce
        const currentValue = control.value?.trim();
        if (currentValue !== value) {
          this.status.set('idle');
          this.message.set('');
          return of(null);
        }

        return this.validatorService.checkUsernameAvailability(value);
      }),
      map((result): ValidationErrors | null => {
        // Handle null result (value changed during debounce)
        if (!result) {
          return null;
        }

        // Verify value hasn't changed while API was processing
        if (control.value?.trim() !== value) {
          this.status.set('idle');
          this.message.set('');
          return null;
        }
        
        // Check for sync errors that may have appeared
        const stillHasPatternError = !/^[a-zA-Z0-9_]+$/.test(control.value?.trim() || '');
        if (stillHasPatternError) {
          this.status.set('idle');
          this.message.set('');
          return null;
        }
        
        if (result.isAvailable) {
          this.status.set('available');
          this.message.set(result.message);
          return null;
        } else {
          this.status.set('taken');
          this.message.set(result.message);
          return { usernameTaken: true };
        }
      }),
      catchError((error: any) => {
        console.error('Validation error:', error);
        this.status.set('error');
        this.message.set(error.message || 'Failed to check username availability.');
        return of(null);
      })
    );
  };

  get usernameControl() {
    return this.usernameForm.get('username');
  }

  canSubmit(): boolean {
    return this.usernameForm?.valid && this.status() === 'available' && !this.isLoading();
  }

  onSubmit(): void {
    if (!this.canSubmit()) return;

    const username = this.usernameControl?.value;
    if (!username) return;

    this.isLoading.set(true);
    this.saveSuccess.set(false);

    const subscription = this.validatorService.saveUsername(username)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Username Saved Successfully!');
          console.log('Payload:', JSON.stringify(response.payload, null, 2));
          
          this.saveSuccess.set(true);
          this.savedPayload.set(JSON.stringify(response.payload, null, 2));
          this.isLoading.set(false);

          setTimeout(() => {
            this.saveSuccess.set(false);
          }, 5000);
        },
        error: (error: any) => {
          console.error('Error saving username:', error);
          this.status.set('error');
          this.message.set('Failed to save username. Please try again.');
          this.isLoading.set(false);
        }
      });

    this.subscriptions.push(subscription);
  }

  resetForm(): void {
    this.usernameForm.reset();
    this.status.set('idle');
    this.message.set('');
    this.saveSuccess.set(false);
    this.savedPayload.set('');
  }
}

