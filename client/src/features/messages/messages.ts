import { Component, inject, OnInit, signal } from '@angular/core';
import { MessageService } from '../../core/services/message-service';
import { PaginatedResult } from '../../types/pagination';
import { Message } from '../../types/message';
import { Paginator } from '../../shared/paginator/paginator';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-messages',
  imports: [Paginator, RouterLink, DatePipe],
  templateUrl: './messages.html',
  styleUrl: './messages.css',
})
export class Messages implements OnInit {
  private messageService = inject(MessageService);
  protected container = 'Inbox';
  protected fetchedContainer = 'Inbox';
  protected pageNumber = 1;
  protected pageSize = 10;
  protected paginatedMessages = signal<PaginatedResult<Message> | null>(null);

  tabs = [
    { label: 'Inbox', value: 'Inbox' },
    { label: 'Outbox', value: 'Outbox' },
  ];

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages() {
    this.messageService
      .getMessages(this.container, this.pageNumber, this.pageSize)
      .subscribe({
        next: (response) => {
          this.paginatedMessages.set(response);
          this.fetchedContainer = this.container;
        },
      });
  }

  deleteMessage(id: string) {
    this.messageService.deleteMessage(id).subscribe({
      next: () => {
        this.paginatedMessages.update((prev) => {
          if (!prev) return null;
          const newItems = prev.items.filter((x) => x.id !== id);
          const newTotalCount = prev.metadata.totalCount - 1;
          const newTotalPages = Math.ceil(newTotalCount / prev.metadata.pageSize);
          const newCurrentPage = Math.min(
            prev.metadata.currentPage,
            Math.max(1, newTotalPages)
          );
          return {
            items: newItems,
            metadata: {
              ...prev.metadata,
              totalCount: newTotalCount,
              totalPages: newTotalPages,
              currentPage: newCurrentPage,
            },
          };
        });
      },
      error: (err) => console.error('Failed to delete message:', err),
    });
  }

  get isInbox() {
    return this.fetchedContainer === 'Inbox';
  }

  setContainer(container: string) {
    this.container = container;
    this.pageNumber = 1;
    this.loadMessages();
  }

  onPageChange(event: { pageNumber: number; pageSize: number }) {
    this.pageSize = event.pageSize;
    this.pageNumber = event.pageNumber;
    this.loadMessages();
  }
}
