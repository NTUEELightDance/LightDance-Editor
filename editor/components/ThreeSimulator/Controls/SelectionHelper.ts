import { Vector2, type Renderer } from "three";

class SelectionHelper {
  renderer: Renderer;
  element: HTMLDivElement;
  startPoint: Vector2;
  pointTopLeft: Vector2;
  pointBottomRight: Vector2;
  isDown: boolean;

  constructor(renderer: Renderer, cssClassName: string) {
    this.isDown = false;

    this.element = document.createElement("div");
    this.element.classList.add(cssClassName);
    this.element.style.pointerEvents = "none";

    this.renderer = renderer;

    this.startPoint = new Vector2();
    this.pointTopLeft = new Vector2();
    this.pointBottomRight = new Vector2();
  }

  onSelectStart(event: PointerEvent) {
    this.element.style.display = "none";

    this.renderer.domElement.parentElement!.appendChild(this.element);

    this.element.style.left = event.clientX + "px";
    this.element.style.top = event.clientY + "px";
    this.element.style.width = "0px";
    this.element.style.height = "0px";

    this.startPoint.x = event.clientX;
    this.startPoint.y = event.clientY;
  }

  onSelectMove(event: PointerEvent) {
    this.element.style.display = "block";

    this.pointBottomRight.x = Math.max(this.startPoint.x, event.clientX);
    this.pointBottomRight.y = Math.max(this.startPoint.y, event.clientY);
    this.pointTopLeft.x = Math.min(this.startPoint.x, event.clientX);
    this.pointTopLeft.y = Math.min(this.startPoint.y, event.clientY);

    this.element.style.left = this.pointTopLeft.x + "px";
    this.element.style.top = this.pointTopLeft.y + "px";
    this.element.style.width =
      this.pointBottomRight.x - this.pointTopLeft.x + "px";
    this.element.style.height =
      this.pointBottomRight.y - this.pointTopLeft.y + "px";
  }

  onSelectOver() {
    if (this.element.parentElement) {
      this.element.parentElement.removeChild(this.element);
    }
  }
}

export { SelectionHelper };
