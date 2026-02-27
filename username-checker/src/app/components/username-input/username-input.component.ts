import { Component, forwardRef, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-username-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './username-input.component.html',
  styleUrl: './username-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UsernameInputComponent),
      multi: true
    }
  ]
})
export class UsernameInputComponent implements ControlValueAccessor {
  // Inputs
  placeholder = input<string>('Enter username');
  label = input<string>('Username');
  minLength = input<number>(3);
  maxLength = input<number>(20);
  
  // Validation state inputs
  showErrors = input<boolean>(false);
  errors = input<Record<string, unknown> | null>(null);
  touched = input<boolean>(false);
  
  // Internal state
  value = signal<string>('');
  disabled = signal<boolean>(false);
  focused = signal<boolean>(false);

  // ControlValueAccessor callbacks
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value.set(value || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  // Event handlers
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value.set(input.value);
    this.onChange(input.value);
  }

  onBlur(): void {
    this.focused.set(false);
    this.onTouched();
  }

  onFocus(): void {
    this.focused.set(true);
  }

  // Helper methods
  hasError(errorKey: string): boolean {
    return this.errors()?.[errorKey] !== undefined;
  }

  get isInvalid(): boolean {
    return this.showErrors() && this.touched() && Object.keys(this.errors() || {}).length > 0;
  }

  get isValid(): boolean {
    return this.touched() && !!this.value() && !this.isInvalid;
  }
}
