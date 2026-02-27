import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-debug',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-debug.component.html',
  styleUrl: './form-debug.component.scss'
})
export class FormDebugComponent {
  status = input<string>('idle');
  message = input<string>('');
  isLoading = input<boolean>(false);
  formValid = input<boolean>(false);
  formTouched = input<boolean>(false);
  formDirty = input<boolean>(false);
  formValue = input<Record<string, unknown>>({});
  formErrors = input<Record<string, unknown> | null>(null);
}
