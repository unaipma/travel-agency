import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/navbar/navbar';
import { Footer } from './shared/footer/footer';
import { Chatbot } from './shared/chatbot/chatbot';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, Chatbot],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('frontend');
}
