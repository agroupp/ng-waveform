import { Directive, HostListener, Output, EventEmitter, ElementRef } from '@angular/core';


/** Directive to host drag and drop of region borders */
@Directive({
  selector: '[libDragDrop]'
})
export class DragDropDirective {
  private isDragging = false;

  @Output() dragging = new EventEmitter<number>();
  @Output() dragFinished = new EventEmitter<number>();

  @HostListener('window:mousedown', ['$event.target']) onMouseDown(target: HTMLElement) {
    if (this.hostElement.nativeElement.contains(target)) {
      this.isDragging = true;
    }
  }

  @HostListener('window:mousemove', ['$event.x']) onMouseMove(x: number) {
    if (this.isDragging) {
      this.dragging.emit(x);
    }
  }

  @HostListener('window:mouseup', ['$event.x']) onMouseUp(x: number) {
    if (this.isDragging) {
      this.isDragging = false;
      this.dragFinished.emit(x);
    }
  }

  constructor(private hostElement: ElementRef) { }
}
