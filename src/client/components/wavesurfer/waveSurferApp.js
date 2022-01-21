"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const wavesurfer_js_1 = __importDefault(require("wavesurfer.js"));
const wavesurfer_cursor_1 = __importDefault(require("wavesurfer.js/dist/plugin/wavesurfer.cursor"));
const regions_1 = __importDefault(require("wavesurfer.js/src/plugin/regions"));
// redux
const store_1 = __importDefault(require("../../store"));
const globalSlice_1 = require("../../slices/globalSlice");
// constant
const constants_1 = require("../../constants");
const localStorage_1 = require("../../utils/localStorage");
/**
 * control 3rd party package, WaveSurfer
 */
class WaveSurferApp {
    constructor() {
        this.waveSurfer = null;
        this.from = constants_1.WAVESURFERAPP;
        this.ready = false;
    }
    /**
     * Initiate waveSurfer with CursorPlugin, TimelinePlugin
     * @function
     */
    init() {
        // create
        this.waveSurfer = wavesurfer_js_1.default.create({
            container: "#waveform",
            waveColor: "#5bc1f0",
            progressColor: "#1883b5",
            cursorColor: "#edf0f1",
            // height: screen.height * 0.08,
            plugins: [
                wavesurfer_cursor_1.default.create({
                    showTime: true,
                    opacity: 1,
                    color: "#edf0f1",
                    customShowTimeStyle: {
                        "background-color": "#000",
                        color: "#fff",
                        padding: "2px",
                        "font-size": "10px",
                    },
                }),
                regions_1.default.create({
                    regionsMinLength: 0,
                }),
                MarkersPlugin.create({
                    markers: [
                        {
                            time: 0,
                            // label: "Begin",
                            color: "#8AE5C8",
                            position: "bottom",
                        },
                    ],
                }),
            ],
        });
        // load music
        this.waveSurfer.load(store_1.default.getState().load.music);
        // get ready
        this.waveSurfer.on("ready", () => {
            this.ready = true;
            const region = JSON.parse((0, localStorage_1.getItem)("region"));
            region.map((r) => this.addRegion(r.Start, r.End));
        });
        // Listener for seek event
        // waveSurfer.on("seek") will conflict
        this.addClickEvent();
        // Listener when playing, which will update time
        this.waveSurfer.on("audioprocess", () => {
            store_1.default.dispatch((0, globalSlice_1.setTime)({
                from: this.from,
                time: Math.round(this.waveSurfer.getCurrentTime() * 1000),
            }));
        });
    }
    /**
     * Play or Pause the music
     * @function
     */
    playPause() {
        this.waveSurfer.playPause();
        store_1.default.dispatch((0, globalSlice_1.playPause)(this.waveSurfer.isPlaying()));
    }
    /**
     * Play the music
     * @function
     */
    play() {
        this.waveSurfer.play();
        store_1.default.dispatch((0, globalSlice_1.playPause)(this.waveSurfer.isPlaying()));
    }
    /**
     * Pause the music
     * @function
     */
    pause() {
        this.waveSurfer.pause();
        store_1.default.dispatch((0, globalSlice_1.playPause)(this.waveSurfer.isPlaying()));
    }
    /**
     * Play the region repeatly
     * @function
     */
    playLoop() {
        const Regions = Object.values(this.waveSurfer.regions.list);
        let Region = null;
        const setRegion = (r) => {
            if (this.waveSurfer.getCurrentTime() <= r.end &&
                this.waveSurfer.getCurrentTime() >= r.start)
                Region = r;
        };
        Regions.map((r) => setRegion(r));
        if (Region)
            Region.playLoop();
    }
    /**
     * Stop the music
     * @function
     */
    stop() {
        this.waveSurfer.stop();
        store_1.default.dispatch((0, globalSlice_1.playPause)(this.waveSurfer.isPlaying()));
        store_1.default.dispatch((0, globalSlice_1.setTime)({
            from: this.from,
            time: Math.round(this.waveSurfer.getCurrentTime() * 1000),
        }));
    }
    /**
     * Seek to time
     * @param {number} time
     */
    seekTo(time) {
        if (!this.ready)
            return;
        const duration = this.waveSurfer.getDuration();
        this.waveSurfer.seekTo(Number.parseFloat(time) / 1000 / duration);
    }
    /**
     * click on waveform to get time by cursor
     * origin wavesurfer.on("seek", callback) will dispatch time again
     * @function
     */
    addClickEvent() {
        document.getElementById("waveform").addEventListener("click", (e) => {
            // From CursorPlugin Source Code
            const bbox = this.waveSurfer.container.getBoundingClientRect();
            const xpos = e.clientX - bbox.left;
            const duration = this.waveSurfer.getDuration();
            const elementWidth = this.waveSurfer.drawer.width / this.waveSurfer.params.pixelRatio;
            const scrollWidth = this.waveSurfer.drawer.getScrollX();
            const scrollTime = (duration / this.waveSurfer.drawer.width) * scrollWidth;
            const timeValue = Math.max(0, (xpos / elementWidth) * duration) + scrollTime;
            store_1.default.dispatch((0, globalSlice_1.setTime)({
                from: this.from,
                time: Math.round(timeValue * 1000),
            }));
        });
    }
    addRegion(start, end) {
        this.waveSurfer.addRegion({
            start: start / 1000,
            end: end / 1000,
            loop: false,
            color: "hsla(400, 100%, 30%, 0.5)",
        });
    }
    /**
     * create a new marker
     * @param { number } time  - time where marker created
     * @param { number } index - marker's label
     */
    addMarkers(start, index) {
        this.waveSurfer.addMarker({
            time: start,
            color: "#8AE5C8",
            // label: index ? index : "Begin",
            position: "top",
        });
    }
    /**
     * create markers according to all dancer's status
     * @param { Array<{}> } controlRecord - array of all dancer's status
     */
    updateMarkers(controlRecord) {
        this.waveSurfer.clearMarkers();
        controlRecord.map((e, index) => {
            this.addMarkers(e.start / 1000, index);
        });
    }
    /**
     * clear all markers
     * @function
     */
    clearMarker() {
        this.waveSurfer.clearMarkers();
    }
    zoom(newValue) {
        this.waveSurfer.zoom((newValue *
            (window.screen.availWidth - this.waveSurfer.params.minPxPerSec)) /
            50);
    }
    clickLast(last) {
        this.waveSurfer.setCurrentTime(last);
        store_1.default.dispatch((0, globalSlice_1.playPause)(this.waveSurfer.isPlaying()));
        store_1.default.dispatch((0, globalSlice_1.setTime)({
            from: this.from,
            time: Math.round(this.waveSurfer.getCurrentTime() * 1000),
        }));
    }
    clickNext(next) {
        this.waveSurfer.setCurrentTime(next);
        store_1.default.dispatch((0, globalSlice_1.playPause)(this.waveSurfer.isPlaying()));
        store_1.default.dispatch((0, globalSlice_1.setTime)({
            from: this.from,
            time: Math.round(this.waveSurfer.getCurrentTime() * 1000),
        }));
    }
}
exports.default = WaveSurferApp;
