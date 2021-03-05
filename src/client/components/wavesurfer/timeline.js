import React, { useEffect, useState } from "react";

// mui
import Slider from "@material-ui/core/Slider";
import Typography from "@material-ui/core/Typography";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Dialog from "@material-ui/core/Dialog";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Button from "@material-ui/core/Button";
import SettingsIcon from "@material-ui/icons/Settings";
import IconButton from "@material-ui/core/IconButton";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import SkipPreviousIcon from "@material-ui/icons/SkipPrevious";
import PublishIcon from "@material-ui/icons/Publish";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";

// constant
import { FormControl, InputLabel } from "@material-ui/core";
import load from "../../../../data/load.json";

// local storage
import { setItem, getItem } from "../../utils/localStorage";

export default function Timeline(props) {
  /**
   * params
   */
  const music = new (window.AudioContext || window.webkitAudioContext)();
  const [DATA, setDATA] = useState();
  const [thrRatio, setThrRatio] = useState(10);
  const [region, setRegion] = useState([]);
  const [peak, setPeak] = useState();
  const [filterNow, setFilterNow] = useState("lowpass");
  const [open, setOpen] = useState(false);
  const [subThrRatioChange, setSubThrRatio] = useState(false);
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [ratio, setRatio] = useState(0);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [expanded, setExpanded] = useState(false);

  const { wavesurfer } = props;

  // const upperBPM = 200;
  // const lowerBPM = 90;

  function loadMusic(url, filterType) {
    const request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    request.onload = () => {
      music.decodeAudioData(request.response, (buffer) => {
        // Create offline context
        const offlineContext = new OfflineAudioContext(
          1,
          buffer.length,
          buffer.sampleRate
        );

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
      else difference.push(0);
    }

    // calculate the mean of magnitude, and get the threashold
    for (let i = 0; i < square.length; i += 1) mean += square[i];
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
      if (
        originaldata[i] > threashold &&
        musicdata[i - 1] > musicdata[i] &&
        musicdata[i] === 0
      ) {
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
      for (let j = s; j < e; j += 1) regionMean += originaldata[j];
      regionMean /= e - s;
      const thr = regionMean * region[i].ThreashRatio;

      const subPeak = [];
      for (let t = s; t < e; t += 1) {
        if (
          originaldata[t] > thr &&
          musicdata[t - 1] > musicdata[t] &&
          musicdata[t] === 0
        ) {
          subPeak.push(t / 44100);
          t += 4410;
          // Skip forward ~ 1/4s to get past this peak.
        }
      }
      const front = peaksArray.filter((time) => time < region[i].Start / 1000);
      const back = peaksArray.filter((time) => time > region[i].End / 1000);
      peaksArray = front.concat(subPeak).concat(back);
    }
    console.log(peaksArray);
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
    setItem("peak", b);

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

  useEffect(() => {
    loadMusic(load.Music, filterNow);
    if (getItem("peak")) setPeak(getItem("peak"));
    if (getItem("region")) setRegion(JSON.parse(getItem("region")));
  }, []);

  useEffect(() => {
    if (DATA) findPeakAndCountBPM(DATA);
  }, [DATA]);

  useEffect(() => {
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
    setItem("region", JSON.stringify(sub));
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
      if (sub[i].Value > regionID) sub[i].Value -= 1;
    }
    setRegion(sub);
    setItem("region", JSON.stringify(sub));
    if (sub[regionID]) {
      setNewStart(sub[regionID].Start);
      setNewEnd(sub[regionID].End);
    } else {
      setNewStart("");
      setNewEnd("");
      setExpanded(false);
    }
  };

  const Regions =
    region === []
      ? ""
      : region.map((r) => (
          <Accordion
            expanded={expanded === `panel${r.Value}`}
            onChange={handelExpanded(`panel${r.Value}`)}
            key={`panel${r.Value}`}
          >
            <AccordionSummary
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography>Accordion {r.Value}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                label="Start"
                placeholder="start"
                value={newStart}
                onChange={(e) => {
                  setNewStart(e.target.value);
                }}
                style={{ width: 100, marginRight: 10 }}
              />
              <TextField
                label="End"
                placeholder="end"
                value={newEnd}
                onChange={(e) => {
                  setNewEnd(e.target.value);
                }}
                style={{ width: 100, marginRight: 10 }}
              />
              <div>
                <Typography id="discrete-slider-small-steps" gutterBottom>
                  Threashhold Ratio: {r.ThreashRatio}
                </Typography>
                <Slider
                  key={`slider-${r.ThreashRatio}`}
                  defaultValue={r.ThreashRatio}
                  max={35}
                  min={5}
                  step={1}
                  onChange={(event, newValue) => {
                    const sub = region;
                    // console.log("change", sub[r.Value].ThreashRatio);
                    sub[r.Value].ThreashRatio = newValue;
                    setRegion(sub);
                    setItem("region", JSON.stringify(sub));
                    setSubThrRatio(true);
                  }}
                  aria-labelledby="discrete-slider-small-steps"
                  valueLabelDisplay="auto"
                  marks
                />
              </div>
              <IconButton
                color="primary"
                onClick={() => {
                  updateRegion(r.Value);
                }}
              >
                <PublishIcon />
              </IconButton>
              <IconButton
                color="primary"
                onClick={() => {
                  deleteRegion(r.Value);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </AccordionDetails>
          </Accordion>
        ));

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
      if (peak[mid] > currentTime) HigherLimit = mid;
      else lowerLimit = mid + 1;
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
      if (peak[mid] > currentTime) HigherLimit = mid;
      else lowerLimit = mid + 1;
    }
    if (Math.abs(peak[lowerLimit] - currentTime) < 0.00001) {
      return peak[lowerLimit + 1];
    }
    return peak[lowerLimit];
  };

  return (
    <div>
      <IconButton
        onClick={() => {
          if (wavesurfer) {
            wavesurfer.clickLast(
              findPosLast(wavesurfer.waveSurfer.getCurrentTime())
            );
          }
        }}
        style={{ position: "fixed", zIndex: 10, right: 120 }}
      >
        <SkipPreviousIcon />
      </IconButton>
      <IconButton
        onClick={() => {
          if (wavesurfer) {
            wavesurfer.clickNext(
              findPosNext(wavesurfer.waveSurfer.getCurrentTime())
            );
          }
        }}
        style={{ position: "fixed", zIndex: 10, right: 90 }}
      >
        <SkipNextIcon />
      </IconButton>
      <IconButton
        onClick={handleClickOpen}
        style={{ position: "fixed", zIndex: 10, right: 48 }}
      >
        <SettingsIcon />
      </IconButton>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="max-width-dialog-title"
      >
        <DialogTitle id="max-width-dialog-title">Settings</DialogTitle>
        <DialogContent>
          {Regions}
          <div>
            <div>
              <TextField
                label="Start"
                placeholder="start"
                value={start}
                onChange={(e) => {
                  setStart(e.target.value);
                }}
                style={{ marginRight: 10, width: 100 }}
              />
              <TextField
                label="End"
                placeholder="end"
                value={end}
                onChange={(e) => {
                  setEnd(e.target.value);
                }}
                style={{ marginRight: 10, width: 100 }}
              />
              <IconButton
                color="primary"
                onClick={() => {
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

                  setItem(
                    "region",
                    JSON.stringify([
                      ...region,
                      {
                        Start: start,
                        End: end,
                        Value: region.length,
                        ThreashRatio: thrRatio,
                      },
                    ])
                  );

                  setStart("");
                  setEnd("");
                }}
                style={{ marginTop: 12 }}
              >
                <AddIcon />
              </IconButton>

              <span style={{ marginLeft: 80 }}>
                <FormControl>
                  <InputLabel
                    htmlFor="uncontrolled-native"
                    style={{ marginTop: 5 }}
                  >
                    filter type
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={filterNow}
                    onChange={(e) => {
                      setFilterNow(e.target.value);
                      loadMusic(load.Music, e.target.value);
                    }}
                  >
                    <MenuItem value="lowpass">lowpass</MenuItem>
                    <MenuItem value="highpass">highpass</MenuItem>
                    <MenuItem value="notch">notch</MenuItem>
                  </Select>
                </FormControl>
              </span>
            </div>

            {wavesurfer === undefined ? (
              ""
            ) : (
              <div>
                <Typography id="discrete-slider-small-steps" gutterBottom>
                  zoom: {ratio}
                </Typography>
                <Slider
                  defaultValue={0}
                  max={10}
                  min={0}
                  step={1}
                  onChange={handleChange}
                  aria-labelledby="discrete-slider-small-steps"
                  valueLabelDisplay="auto"
                  marks
                  value={ratio}
                />
                <Typography id="discrete-slider-small-steps" gutterBottom>
                  Threashhold Ratio: {thrRatio}
                </Typography>
                <Slider
                  value={thrRatio}
                  max={25}
                  min={5}
                  step={1}
                  onChange={newRatio}
                  aria-labelledby="discrete-slider-small-steps"
                  valueLabelDisplay="auto"
                  marks
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
