import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../core/services/chat';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './chatbot.html',
})
export class Chatbot implements AfterViewChecked {
  private chatService = inject(ChatService);
  
  isOpen = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  messages = signal<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: '¡Hola! Soy el asistente de Triptoyou. ¿En qué puedo ayudarte hoy? Puedo buscarte viajes, darte recomendaciones o resolver tus dudas.' }
  ]);
  currentInput = '';

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat() {
    this.isOpen.set(!this.isOpen());
  }

  sendMessage() {
    const text = this.currentInput.trim();
    if (!text || this.isLoading()) return;

    // Guardar mensaje del usuario
    this.messages.update(m => [...m, { role: 'user', text }]);
    this.currentInput = '';
    this.isLoading.set(true);

    const history = this.messages().slice(1, -1); // Omitimos el saludo inicial y el último mensaje para el historial si fuera necesario, o enviamos todo

    this.chatService.sendMessage(text, this.messages().slice(0, -1)).subscribe({
      next: (res) => {
        this.messages.update(m => [...m, { role: 'model', text: res.response }]);
        this.isLoading.set(false);
      },
      error: () => {
        this.messages.update(m => [...m, { role: 'model', text: 'Lo siento, ha ocurrido un error al conectar con el servidor. Inténtalo de nuevo más tarde.' }]);
        this.isLoading.set(false);
      }
    });
  }

  private scrollToBottom(): void {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    }
  }
}
