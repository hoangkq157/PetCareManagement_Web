import { Component, inject, signal, viewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage } from '../../../core/chat.service';

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot-widget.html',
  styleUrl: './chatbot-widget.css'
})
export class ChatbotWidgetComponent {
  private chatSvc = inject(ChatService);
  private bodyRef = viewChild<ElementRef<HTMLDivElement>>('chatBody');

  open    = signal(false);
  loading = signal(false);
  input   = signal('');
  messages = signal<ChatMessage[]>([
    { role: 'assistant', content: 'Xin chào! Mình là trợ lý PetCare 🐾. Bạn cần tư vấn gì cho bé cưng nào?' }
  ]);

  toggle() { this.open.update(v => !v); }

  send() {
    const text = this.input().trim();
    if (!text || this.loading()) return;

    const history = this.messages();                 // lịch sử TRƯỚC tin nhắn này
    this.messages.update(m => [...m, { role: 'user', content: text }]);
    this.input.set('');
    this.loading.set(true);
    this.scrollToBottom();

    this.chatSvc.send(text, history).subscribe({
      next: res => {
        this.messages.update(m => [...m, { role: 'assistant', content: res.reply }]);
        this.loading.set(false);
        this.scrollToBottom();
      },
      error: () => {
        this.messages.update(m => [...m, { role: 'assistant', content: 'Xin lỗi, mình đang gặp sự cố. Bạn thử lại sau nhé!' }]);
        this.loading.set(false);
        this.scrollToBottom();
      }
    });
  }

  private scrollToBottom() {
    setTimeout(() => {
      const el = this.bodyRef()?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }
}
