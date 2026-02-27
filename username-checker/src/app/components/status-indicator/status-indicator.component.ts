import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatusType = 'idle' | 'checking' | 'available' | 'taken' | 'error';

@Component({
  selector: 'app-status-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="status-indicator" 
         [class.idle]="status() === 'idle'"
         [class.checking]="status() === 'checking'"
         [class.available]="status() === 'available'"
         [class.taken]="status() === 'taken'"
         [class.error]="status() === 'error'">
      
      <span class="status-icon">
        @switch (status()) {
          @case ('idle') { <span class="icon">○</span> }
          @case ('checking') { <span class="icon spin">◐</span> }
          @case ('available') { <span class="icon">✓</span> }
          @case ('taken') { <span class="icon">✗</span> }
          @case ('error') { <span class="icon">⚠</span> }
        }
      </span>

      <span class="status-text">
        {{ message() }}
      </span>
    </div>
  `,
  styles: [`
    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      margin-top: 10px;
      transition: all 0.3s ease;
    }

    .status-icon {
      display: flex;
      align-items: center;
      font-size: 18px;
    }

    .status-text {
      flex: 1;
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .idle {
      background-color: #f3f4f6;
      color: #6b7280;
      border: 1px solid #e5e7eb;
    }

    .checking {
      background-color: #fef3c7;
      color: #92400e;
      border: 1px solid #fcd34d;
    }

    .available {
      background-color: #d1fae5;
      color: #065f46;
      border: 1px solid #6ee7b7;
    }

    .taken {
      background-color: #fee2e2;
      color: #991b1b;
      border: 1px solid #fca5a5;
    }

    .error {
      background-color: #fee2e2;
      color: #991b1b;
      border: 1px solid #fca5a5;
    }
  `]
})
export class StatusIndicatorComponent {
  status = input.required<StatusType>();
  message = input<string>('');
}

