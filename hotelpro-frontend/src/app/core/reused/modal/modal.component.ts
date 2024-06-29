import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() message?: string;
  @Input() headerMessage?: string;
  @Input() type: 'success' | 'error' | 'confirmation' = 'confirmation';
  @ViewChild('closeButton', { static: true }) closeButton!: ElementRef;

  constructor(
    public activeModal: NgbActiveModal,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    document.body.classList.add('modal-open');
    if (this.closeButton) {
      this.closeButton.nativeElement.focus();
    }
  }

  sanitizeMsg(message: string | undefined) {
    return message ? this.sanitizer.bypassSecurityTrustHtml(message) : '';
  }

  ngOnDestroy() {
    document.body.classList.remove('modal-open');
  }

  close(result: boolean): void {
    this.activeModal.close(result);
  }
}
