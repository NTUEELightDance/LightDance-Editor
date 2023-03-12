import type { PluginParams } from "wavesurfer.js/types/plugin";

export type FilterType = "lowpass" | "highpass" | "notch";

export interface MarkerParams<D = unknown> {
  time: number;
  label?: string;
  color?: string;
  key?: string | number;
  position?: "top" | "bottom";
  offset?: number;
  draggable?: boolean;
  markerElement?: HTMLElement;
  data?: D;
}

export interface Marker<D = unknown> {
  time: number;
  label: string;
  color: string;
  draggable: boolean;
  position: "top" | "bottom";
  offset?: number;
  el: HTMLElement;
  data?: D;
}

export interface MarkersPluginParams extends PluginParams {
  markers?: MarkerParams[];
}

import { waveSurferAppInstance } from "../WaveSurferApp";
import type { WaveSurferPlugin } from "wavesurfer.js/types/plugin";
import WaveSurfer from "wavesurfer.js";

const DEFAULT_FILL_COLOR = "#D8D8D8";
const DEFAULT_POSITION = "bottom";

export default class MarkersPlugin implements WaveSurferPlugin {
  params: MarkersPluginParams;
  wavesurfer: WaveSurfer;
  util: (typeof WaveSurfer)["util"];
  style: (typeof WaveSurfer)["util"]["style"];
  wrapper: HTMLElement | null;
  markerLineWidth: number;
  markerWidth: number;
  markerHeight: number;
  markers: Marker[];
  showMarkers: boolean;
  dragging: boolean;
  selectedMarker: Marker | null;
  _onResize: () => void;
  _onBackendCreated: () => void;
  _onReady: () => void;
  onMouseMove?: (e: MouseEvent) => void;
  onMouseUp?: (e: MouseEvent) => void;

  static create(params: MarkersPluginParams) {
    return {
      name: "markers",
      deferInit: false,
      params,
      staticProps: {
        addMarker(options: MarkerParams) {
          if (!this.initialisedPluginList.markers) {
            this.initPlugin("markers");
          }
          return this.markers.add(options);
        },
        clearMarkers() {
          this.markers && this.markers.clear();
        },
        toggleMarkers(showMarkers: boolean) {
          this.markers && this.markers.toggle(showMarkers);
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      instance: MarkersPlugin,
    };
  }

  constructor(params: MarkersPluginParams, ws: WaveSurfer) {
    this.params = params;
    this.wavesurfer = ws;
    this.util = ws.util;
    this.style = this.util.style;
    this.markerLineWidth = 1;
    this.markerWidth = 7;
    this.markerHeight = 20;
    this.showMarkers = true;
    this.dragging = false;
    this.wrapper = null;
    this.markers = [];
    this.selectedMarker = null;

    this._onResize = ws.util.debounce(() => {
      this._updateMarkerPositions();
    });

    this._onBackendCreated = () => {
      this.wrapper = this.wavesurfer.drawer.wrapper;
      if (this.params.markers != null) {
        this.params.markers.forEach((marker) => this.add(marker));
      }
      window.addEventListener("resize", this._onResize, true);
      window.addEventListener("orientationchange", this._onResize, true);
      this.wavesurfer.on("zoom", this._onResize);

      this.onMouseMove = (e) => {
        this._onMouseMove(e);
      };
      window.addEventListener("mousemove", this.onMouseMove);

      this.onMouseUp = (e) => {
        this._onMouseUp(e);
      };
      window.addEventListener("mouseup", this.onMouseUp);
    };

    this._onReady = () => {
      this.wrapper = this.wavesurfer.drawer.wrapper;
      this._updateMarkerPositions();
    };
  }

  init(): void {
    // Check if ws is ready
    if (this.wavesurfer.isReady) {
      this._onBackendCreated();
      this._onReady();
    } else {
      this.wavesurfer.once("backend-created", this._onBackendCreated);
      this.wavesurfer.once("waveform-ready", this._onReady);
    }
  }

  destroy(): void {
    this.wavesurfer.un("waveform-ready", this._onReady);
    this.wavesurfer.un("backend-created", this._onBackendCreated);

    this.wavesurfer.un("zoom", this._onResize);

    window.removeEventListener("resize", this._onResize, true);
    window.removeEventListener("orientationchange", this._onResize, true);

    if (this.onMouseMove != null) {
      window.removeEventListener("mousemove", this.onMouseMove);
    }
    if (this.onMouseUp != null) {
      window.removeEventListener("mouseup", this.onMouseUp);
    }

    this.clear();
  }

  add(params: MarkerParams): Marker {
    const marker = {
      time: params.time,
      label: params.label ?? "",
      color: params.color ?? DEFAULT_FILL_COLOR,
      position: params.position ?? DEFAULT_POSITION,
      draggable: !!params.draggable,
      data: params.data,
    } as Marker;
    marker.el = this._createMarkerElement(marker, params.markerElement);

    this.wrapper!.appendChild(marker.el);
    this.markers.push(marker);
    this._updateMarkerPositions();

    return marker;
  }

  remove(index: number): void {
    const marker = this.markers[index];
    if (!marker || this.wrapper == null) {
      return;
    }

    this.wrapper.removeChild(marker.el);
    this.markers.splice(index, 1);
  }

  _createPointerSVG(color: string, position: "top" | "bottom"): SVGElement {
    const svgNS = "http://www.w3.org/2000/svg";

    const el = document.createElementNS(svgNS, "svg");
    const polygon = document.createElementNS(svgNS, "polygon");

    el.setAttribute("viewBox", "0 0 40 80");

    polygon.setAttribute("id", "polygon");
    polygon.setAttribute("stroke", "#979797");
    polygon.setAttribute("fill", color);
    polygon.setAttribute("points", "20 0 40 30 40 80 0 80 0 30");
    if (position == "top") {
      polygon.setAttribute("transform", "rotate(180, 20 40)");
    }

    el.appendChild(polygon);

    // @ts-expect-error SVGElements also work
    this.style(el, {
      width: this.markerWidth + "px",
      height: this.markerHeight + "px",
      "min-width": this.markerWidth + "px",
      "margin-right": "5px",
      "z-index": 4,
    });
    return el;
  }

  _createMarkerElement(marker: Marker, markerElement?: HTMLElement) {
    const label = marker.label;

    const el = document.createElement("marker");
    el.className = "wavesurfer-marker";

    this.style(el, {
      position: "absolute",
      height: "100%",
      display: "flex",
      overflow: "hidden",
      "flex-direction": marker.position == "top" ? "column-reverse" : "column",
    });

    el.onmouseover = (e) => {
      (e?.target as HTMLElement).style.filter = "brightness(60%)";
      (e?.target as HTMLElement).style.zIndex = "5";
    };

    el.onmouseout = (e) => {
      (e?.target as HTMLElement).style.removeProperty("filter");
      (e?.target as HTMLElement).style.zIndex = "4";
    };

    const line = document.createElement("div");
    const width = this.markerWidth;
    marker.offset = (width + this.markerLineWidth) / 2;
    this.style(line, {
      "flex-grow": "1",
      "margin-left": marker.offset + "px",
      background: "black",
      width: this.markerLineWidth + "px",
      opacity: "0.1",
    });
    el.appendChild(line);

    const labelDiv = document.createElement("div");
    const point =
      markerElement ?? this._createPointerSVG(marker.color, marker.position);
    if (marker.draggable) {
      // @ts-expect-error SVGElements also work
      point.draggable = false;
    }
    labelDiv.appendChild(point);

    if (label) {
      const labelEl = document.createElement("span");
      labelEl.innerText = label;
      this.style(labelEl, {
        "font-family": "monospace",
        "font-size": "90%",
      });
      labelDiv.appendChild(labelEl);
    }

    this.style(labelDiv, {
      display: "flex",
      "align-items": "center",
      cursor: "pointer",
    });

    el.appendChild(labelDiv);

    labelDiv.addEventListener("click", (e) => {
      e.stopPropagation();
      // Click event is caught when the marker-drop event was dispatched.
      // Drop event was dispatched at this moment, but this.dragging
      // is waiting for the next tick to set as false
      if (this.dragging) {
        return;
      }
      this.wavesurfer.setCurrentTime(marker.time);
      waveSurferAppInstance.setTime(marker.time * 1000); // set outer instance time for state updating
      this.wavesurfer.fireEvent("marker-click", marker, e);
    });

    if (marker.draggable) {
      labelDiv.addEventListener("mousedown", () => {
        this.selectedMarker = marker;
      });
    }
    return el;
  }

  _updateMarkerPositions(): void {
    for (let i = 0; i < this.markers.length; i++) {
      const marker = this.markers[i];
      this._updateMarkerPosition(marker);
    }
  }

  _updateMarkerPosition(params: Marker): void {
    const duration = this.wavesurfer.getDuration();
    const elementWidth =
      this.wavesurfer.drawer.width / this.wavesurfer.params.pixelRatio;

    const positionPct = Math.min(params.time / duration, 1);
    const leftPx = elementWidth * positionPct - (params.offset as number);
    this.style(params.el, {
      left: leftPx + "px",
      "max-width": elementWidth - leftPx + "px",
    });
  }

  _onMouseMove(event: MouseEvent): void {
    if (!this.selectedMarker) {
      return;
    }
    if (!this.dragging) {
      this.dragging = true;
      this.wavesurfer.fireEvent("marker-drag", this.selectedMarker, event);
    }
    this.selectedMarker.time =
      this.wavesurfer.drawer.handleEvent(event) * this.wavesurfer.getDuration();
    this._updateMarkerPositions();
  }

  _onMouseUp(event: MouseEvent): void {
    if (this.selectedMarker) {
      setTimeout(() => {
        this.selectedMarker = null;
        this.dragging = false;
      }, 0);
    }

    if (!this.dragging) {
      return;
    }

    event.stopPropagation();
    const duration = this.wavesurfer.getDuration();
    (this.selectedMarker as Marker).time =
      this.wavesurfer.drawer.handleEvent(event) * duration;
    this._updateMarkerPositions();
    this.wavesurfer.fireEvent("marker-drop", this.selectedMarker, event);
  }

  toggle(showMarkers: boolean): void {
    if (this.showMarkers == showMarkers) return;

    this.showMarkers = showMarkers;
    this.markers.forEach((marker) => {
      this.style(marker.el, {
        display: this.showMarkers ? "flex" : "none",
      });
    });
    this._updateMarkerPositions();
  }

  clear(): void {
    while (this.markers.length > 0) {
      this.remove(0);
    }
  }
}
