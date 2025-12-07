import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  template: `
    @if (isLoading()) {
    <div class="loading-overlay">
      <div class="loading-content">
        <p-progressSpinner styleClass="w-12 h-12" strokeWidth="4" animationDuration=".8s" />
      </div>
    </div>
    }
  `,
  styles: [
    `
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.4);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        backdrop-filter: blur(2px);
      }

      .loading-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }
    `,
  ],
})
export class LoadingComponent {
  isLoading = computed(() => this.loadingService.isLoading());

  constructor(private loadingService: LoadingService) {}
}
