import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-footer',
  template: `<div class="layout-footer">
    MAMBO by
    <a
      href="https://pumilabs.com"
      target="_blank"
      rel="noopener noreferrer"
      class="text-primary font-bold hover:underline"
      >PumiLabs</a
    >
  </div>`,
})
export class AppFooter {}
