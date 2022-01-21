"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
// mui
const Slider_1 = __importDefault(require("@material-ui/core/Slider"));
const Typography_1 = __importDefault(require("@material-ui/core/Typography"));
const DialogContent_1 = __importDefault(require("@material-ui/core/DialogContent"));
const DialogTitle_1 = __importDefault(require("@material-ui/core/DialogTitle"));
const TextField_1 = __importDefault(require("@material-ui/core/TextField"));
const Select_1 = __importDefault(require("@material-ui/core/Select"));
const MenuItem_1 = __importDefault(require("@material-ui/core/MenuItem"));
const Dialog_1 = __importDefault(require("@material-ui/core/Dialog"));
const Accordion_1 = __importDefault(require("@material-ui/core/Accordion"));
const AccordionSummary_1 = __importDefault(require("@material-ui/core/AccordionSummary"));
const AccordionDetails_1 = __importDefault(require("@material-ui/core/AccordionDetails"));
const Settings_1 = __importDefault(require("@material-ui/icons/Settings"));
const IconButton_1 = __importDefault(require("@material-ui/core/IconButton"));
const SkipNext_1 = __importDefault(require("@material-ui/icons/SkipNext"));
const SkipPrevious_1 = __importDefault(require("@material-ui/icons/SkipPrevious"));
const Delete_1 = __importDefault(require("@material-ui/icons/Delete"));
const Add_1 = __importDefault(require("@material-ui/icons/Add"));
const Done_1 = __importDefault(require("@material-ui/icons/Done"));
// constant
const core_1 = require("@material-ui/core");
const load_json_1 = __importDefault(require("../../../../data/load.json"));
// local storage
const localStorage_1 = require("../../utils/localStorage");
function Timeline({ wavesurfer }) {
    /**
     * params
     */
    const music = new (window.AudioContext || window.webkitAudioContext)();
    const [DATA, setDATA] = (0, react_1.useState)();
    const [thrRatio, setThrRatio] = (0, react_1.useState)(10);
    const [region, setRegion] = (0, react_1.useState)([]);
    const [peak, setPeak] = (0, react_1.useState)();
    const [filterNow, setFilterNow] = (0, react_1.useState)("lowpass");
    const [open, setOpen] = (0, react_1.useState)(false);
    const [subThrRatioChange, setSubThrRatio] = (0, react_1.useState)(false);
    const [newStart, setNewStart] = (0, react_1.useState)("");
    const [newEnd, setNewEnd] = (0, react_1.useState)("");
    const [ratio, setRatio] = (0, react_1.useState)(0);
    const [start, setStart] = (0, react_1.useState)("");
    const [end, setEnd] = (0, react_1.useState)("");
    const [expanded, setExpanded] = (0, react_1.useState)(false);
    // const upperBPM = 200;
    // const lowerBPM = 90;
    function loadMusic(url, filterType) {
        const request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.responseType = "arraybuffer";
        request.onload = () => {
            music.decodeAudioData(request.response, (buffer) => {
                // Create offline context
                const offlineContext = new OfflineAudioContext(1, buffer.length, buffer.sampleRate);
                // Create buffer source
                const source = offlineContext.createBufferSource();
                source.buffer = buffer;
                // Create filter
                const filter = offlineContext.createBiquadFilter();
                filter.type = filterType;
                // Pipe the song into the filter, and the filter into the offline context
                source.connect(filter);
                filter.connect(offlineContext.destination);
                // Schedule the song to start playing at time:0
                source.start(0);
                // Render the song
                offlineContext.startRendering();
                // Act on the result
                offlineContext.oncomplete = (e) => {
                    // Filtered buffer!
                    const filteredBuffer = e.renderedBuffer;
                    const data = filteredBuffer.getChannelData(0);
                    setDATA(data);
                };
            });
        };
        request.send();
    }
    const musicProcessing = (Data) => {
        const square = [];
        const difference = [];
        let mean = 0;
        /**
         * square every point to get magnitude
         * calculate the difference of every point and it previous point,
         * if > 0, store the difference, if < 0, store 0.
         */
        for (let i = 0; i < Data.length; i += 1) {
            square.push(Data[i] ** 2);
        }
        for (let i = 0; i < square.length - 1; i += 1) {
            if (square[i + 1] - square[i] > 0)
                difference.push(square[i + 1] - square[i]);
            else
                difference.push(0);
        }
        // calculate the mean of magnitude, and get the threashold
        for (let i = 0; i < square.length; i += 1)
            mean += square[i];
        const Threashold = (mean / square.length) * thrRatio;
        // const Subthreashold = mean / square.length / 10000;
        // return [difference, Threashold, Subthreashold, square];
        return [difference, Threashold, square];
    };
    function getPeaksAtThreshold(musicdata, threashold, originaldata) {
        let peaksArray = [];
        const { length } = originaldata;
        /**
         * if data[i] > threashold && data[i] is peak, let it be the beat point
         */
        for (let i = 0; i < length; i += 1) {
            if (originaldata[i] > threashold &&
                musicdata[i - 1] > musicdata[i] &&
                musicdata[i] === 0) {
                peaksArray.push(i / 44100);
                i += 4410;
                // Skip forward ~ 1/4s to get past this peak.
            }
        }
        /**
         * calculate the beat points on specific region
         */
        for (let i = 0; i < region.length; i += 1) {
            const s = Math.round(region[i].Start * 44.1);
            const e = Math.round(region[i].End * 44.1);
            let regionMean = 0;
            for (let j = s; j < e; j += 1)
                regionMean += originaldata[j];
            regionMean /= e - s;
            const thr = regionMean * region[i].ThreashRatio;
            const subPeak = [];
            for (let t = s; t < e; t += 1) {
                if (originaldata[t] > thr &&
                    musicdata[t - 1] > musicdata[t] &&
                    musicdata[t] === 0) {
                    subPeak.push(t / 44100);
                    t += 4410;
                    // Skip forward ~ 1/4s to get past this peak.
                }
            }
            const front = peaksArray.filter((time) => time < region[i].Start / 1000);
            const back = peaksArray.filter((time) => time > region[i].End / 1000);
            peaksArray = front.concat(subPeak).concat(back);
        }
        // console.log(peaksArray);
        return peaksArray;
    }
    /**
     * count BPM but seems to be useless QQ
     */
    // function countIntervalsBetweenNearbyPeaks(peaks) {
    //   const intervals = [];
    //   peaks.forEach((Peak, index) => {
    //     for (let i = 0; i < 10; i += 1) {
    //       let int = 60 / (peaks[index + i] - Peak);
    //       if (int !== Infinity && int !== 0) {
    //         while (int < lowerBPM) int *= 2;
    //       }
    //       if (int <= upperBPM) intervals.push(Math.round(int));
    //     }
    //   });
    //   const intervalCounts = [];
    //   for (let i = 0; i < intervals.length; i += 1) {
    //     const thisInt = intervals[i];
    //     const foundInterval = intervalCounts.some((intervalCount) => {
    //       if (intervalCount.interval === thisInt) {
    //         intervalCount.count += 1;
    //         return true;
    //       }
    //       return false;
    //     });
    //     if (!foundInterval) {
    //       intervalCounts.push({
    //         interval: thisInt,
    //         count: 1,
    //       });
    //     }
    //   }
    //   return intervalCounts;
    // }
    /**
     * Find peaks
     */
    const findPeakAndCountBPM = () => {
        const data2 = musicProcessing(DATA);
        const b = getPeaksAtThreshold(data2[0], data2[1], data2[2]);
        setPeak(b);
        (0, localStorage_1.setItem)("peak", b);
        /**
         * count BPM
         */
        // const c = countIntervalsBetweenNearbyPeaks(b);
        // let MaxInt = 0;
        // let MaxCou = 0;
        // for (let i = 1; i < c.length; i += 1) {
        //   if (c[i].count > MaxCou) {
        //     MaxCou = c[i].count;
        //     MaxInt = c[i].interval;
        //   }
        // }
    };
    (0, react_1.useEffect)(() => {
        loadMusic(load_json_1.default.Music, filterNow);
        if ((0, localStorage_1.getItem)("peak"))
            setPeak((0, localStorage_1.getItem)("peak"));
        if ((0, localStorage_1.getItem)("region"))
            setRegion(JSON.parse((0, localStorage_1.getItem)("region")));
    }, []);
    (0, react_1.useEffect)(() => {
        if (DATA)
            findPeakAndCountBPM(DATA);
    }, [DATA]);
    (0, react_1.useEffect)(() => {
        if (DATA) {
            findPeakAndCountBPM(DATA);
        }
    }, thrRatio);
    const handelExpanded = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
        const index = panel[panel.length - 1];
        setNewStart(region[index].Start);
        setNewEnd(region[index].End);
    };
    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
        if (subThrRatioChange) {
            findPeakAndCountBPM(DATA);
            setSubThrRatio(false);
        }
    };
    const updateRegion = (regionID) => {
        const Region = Object.values(wavesurfer.waveSurfer.regions.list)[regionID];
        Region.update({ start: newStart / 1000, end: newEnd / 1000 });
        const sub = region;
        sub[regionID].Start = newStart;
        sub[regionID].End = newEnd;
        setRegion(sub);
        (0, localStorage_1.setItem)("region", JSON.stringify(sub));
        setExpanded(false);
        setNewStart("");
        setNewEnd("");
    };
    const deleteRegion = (regionID) => {
        const Region = Object.values(wavesurfer.waveSurfer.regions.list)[regionID];
        Region.remove();
        let sub = region;
        sub = sub.filter((item) => {
            return item.Value !== regionID;
        });
        for (let i = 0; i < sub.length; i += 1) {
            if (sub[i].Value > regionID)
                sub[i].Value -= 1;
        }
        setRegion(sub);
        (0, localStorage_1.setItem)("region", JSON.stringify(sub));
        if (sub[regionID]) {
            setNewStart(sub[regionID].Start);
            setNewEnd(sub[regionID].End);
        }
        else {
            setNewStart("");
            setNewEnd("");
            setExpanded(false);
        }
    };
    const Regions = region.map((r) => (react_1.default.createElement(Accordion_1.default, { expanded: expanded === `panel${r.Value}`, onChange: handelExpanded(`panel${r.Value}`), key: `panel${r.Value}` },
        react_1.default.createElement(AccordionSummary_1.default, { "aria-controls": "panel1a-content", id: "panel1a-header" },
            react_1.default.createElement(Typography_1.default, null,
                "Accordion ",
                r.Value)),
        react_1.default.createElement(AccordionDetails_1.default, null,
            react_1.default.createElement(TextField_1.default, { label: "Start", placeholder: "start", value: newStart, onChange: (e) => {
                    setNewStart(e.target.value);
                }, style: { width: 100, marginRight: 10 } }),
            react_1.default.createElement(TextField_1.default, { label: "End", placeholder: "end", value: newEnd, onChange: (e) => {
                    setNewEnd(e.target.value);
                }, style: { width: 100, marginRight: 10 } }),
            react_1.default.createElement("div", null,
                react_1.default.createElement(Typography_1.default, { id: "discrete-slider-small-steps", gutterBottom: true },
                    "Threashhold Ratio: ",
                    r.ThreashRatio),
                react_1.default.createElement(Slider_1.default, { key: `slider-${r.ThreashRatio}`, defaultValue: r.ThreashRatio, max: 35, min: 5, step: 1, onChange: (event, newValue) => {
                        const sub = region;
                        // console.log("change", sub[r.Value].ThreashRatio);
                        sub[r.Value].ThreashRatio = newValue;
                        setRegion(sub);
                        (0, localStorage_1.setItem)("region", JSON.stringify(sub));
                        setSubThrRatio(true);
                    }, "aria-labelledby": "discrete-slider-small-steps", valueLabelDisplay: "auto", marks: true })),
            react_1.default.createElement(IconButton_1.default, { color: "primary", onClick: () => {
                    updateRegion(r.Value);
                }, style: { marginLeft: 10 } },
                react_1.default.createElement(Done_1.default, null)),
            react_1.default.createElement(IconButton_1.default, { color: "primary", onClick: () => {
                    deleteRegion(r.Value);
                } },
                react_1.default.createElement(Delete_1.default, null))))));
    const handleChange = (event, newValue) => {
        setRatio(newValue);
        wavesurfer.zoom(newValue);
    };
    const newRatio = (event, newValue) => {
        setThrRatio(newValue);
    };
    const findPosLast = (currentTime) => {
        let lowerLimit = 0;
        let HigherLimit = peak.length;
        while (lowerLimit !== HigherLimit) {
            const mid = Math.floor((lowerLimit + HigherLimit) / 2);
            if (peak[mid] > currentTime)
                HigherLimit = mid;
            else
                lowerLimit = mid + 1;
        }
        if (lowerLimit > 0) {
            while (peak[lowerLimit] - currentTime >= -0.0001 && lowerLimit > 0)
                lowerLimit -= 1;
            return peak[lowerLimit];
        }
        return 0;
    };
    const findPosNext = (currentTime) => {
        let lowerLimit = 0;
        let HigherLimit = peak.length;
        while (lowerLimit !== HigherLimit) {
            const mid = Math.floor((lowerLimit + HigherLimit) / 2);
            if (peak[mid] > currentTime)
                HigherLimit = mid;
            else
                lowerLimit = mid + 1;
        }
        if (Math.abs(peak[lowerLimit] - currentTime) < 0.00001) {
            return peak[lowerLimit + 1];
        }
        return peak[lowerLimit];
    };
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(IconButton_1.default, { onClick: () => {
                if (wavesurfer) {
                    wavesurfer.clickLast(findPosLast(wavesurfer.waveSurfer.getCurrentTime()));
                }
            }, style: { position: "fixed", zIndex: 10, right: 120 } },
            react_1.default.createElement(SkipPrevious_1.default, null)),
        react_1.default.createElement(IconButton_1.default, { onClick: () => {
                if (wavesurfer) {
                    wavesurfer.clickNext(findPosNext(wavesurfer.waveSurfer.getCurrentTime()));
                }
            }, style: { position: "fixed", zIndex: 10, right: 90 } },
            react_1.default.createElement(SkipNext_1.default, null)),
        react_1.default.createElement(IconButton_1.default, { onClick: handleClickOpen, style: { position: "fixed", zIndex: 10, right: 48 } },
            react_1.default.createElement(Settings_1.default, null)),
        react_1.default.createElement(Dialog_1.default, { open: open, onClose: handleClose, "aria-labelledby": "max-width-dialog-title" },
            react_1.default.createElement(DialogTitle_1.default, { id: "max-width-dialog-title" }, "Settings"),
            react_1.default.createElement(DialogContent_1.default, null,
                Regions,
                react_1.default.createElement("div", null,
                    react_1.default.createElement("div", null,
                        react_1.default.createElement(TextField_1.default, { label: "Start", placeholder: "start", value: start, onChange: (e) => {
                                setStart(e.target.value);
                            }, style: { marginRight: 10, width: 100 } }),
                        react_1.default.createElement(TextField_1.default, { label: "End", placeholder: "end", value: end, onChange: (e) => {
                                setEnd(e.target.value);
                            }, style: { marginRight: 10, width: 100 } }),
                        react_1.default.createElement(IconButton_1.default, { color: "primary", onClick: () => {
                                wavesurfer.addRegion(start, end);
                                setRegion([
                                    ...region,
                                    {
                                        Start: start,
                                        End: end,
                                        Value: region.length,
                                        ThreashRatio: thrRatio,
                                    },
                                ]);
                                (0, localStorage_1.setItem)("region", JSON.stringify([
                                    ...region,
                                    {
                                        Start: start,
                                        End: end,
                                        Value: region.length,
                                        ThreashRatio: thrRatio,
                                    },
                                ]));
                                setStart("");
                                setEnd("");
                            }, style: { marginTop: 12 } },
                            react_1.default.createElement(Add_1.default, null)),
                        react_1.default.createElement("span", { style: { marginLeft: 80 } },
                            react_1.default.createElement(core_1.FormControl, null,
                                react_1.default.createElement(core_1.InputLabel, { htmlFor: "uncontrolled-native", style: { marginTop: 5 } }, "filter type"),
                                react_1.default.createElement(Select_1.default, { labelId: "demo-simple-select-label", id: "demo-simple-select", value: filterNow, onChange: (e) => {
                                        setFilterNow(e.target.value);
                                        loadMusic(load_json_1.default.Music, e.target.value);
                                    } },
                                    react_1.default.createElement(MenuItem_1.default, { value: "lowpass" }, "lowpass"),
                                    react_1.default.createElement(MenuItem_1.default, { value: "highpass" }, "highpass"),
                                    react_1.default.createElement(MenuItem_1.default, { value: "notch" }, "notch"))))),
                    wavesurfer === undefined ? null : (react_1.default.createElement("div", null,
                        react_1.default.createElement(Typography_1.default, { id: "discrete-slider-small-steps", gutterBottom: true },
                            "zoom: ",
                            ratio),
                        react_1.default.createElement(Slider_1.default, { defaultValue: 0, max: 10, min: 0, step: 1, onChange: handleChange, "aria-labelledby": "discrete-slider-small-steps", valueLabelDisplay: "auto", marks: true, value: ratio }),
                        react_1.default.createElement(Typography_1.default, { id: "discrete-slider-small-steps", gutterBottom: true },
                            "Threashhold Ratio: ",
                            thrRatio),
                        react_1.default.createElement(Slider_1.default, { value: thrRatio, max: 25, min: 5, step: 1, onChange: newRatio, "aria-labelledby": "discrete-slider-small-steps", valueLabelDisplay: "auto", marks: true }))))))));
}
exports.default = Timeline;
