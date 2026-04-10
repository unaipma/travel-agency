import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(value: string | undefined): SafeHtml {
    if (!value) return '';

    // Convertidor básico de Markdown a HTML
    let html = value
      // Escapar HTML básico para seguridad (excepto lo que nosotros vamos a crear)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Negritas (**texto**)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Cursivas (*texto*)
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Listas con viñetas (*)
      .replace(/^\* (.*)/gm, '<li class="ml-4 list-disc">$1</li>')
      // Saltos de línea
      .replace(/\n/g, '<br>');

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
