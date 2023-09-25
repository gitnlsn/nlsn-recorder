# nlsn-recorder

Native Web Audio Api implementation of recorder for browsers.

1. `FiniteRecorder` will take a prefixed ttl (time to live) duration to record audio.
2. `Recorder` is a FiniteRecorder composed class that takes audio streams and detects whether sound is silent or not. It will call a callback with the audio segmentations where the RMS is not below threshold. Volume threshold, silence window duration, max ttl are customised.

This lib tries to solve the problem of capturing audio and removing silence windows on the fly. It converts audio data to PCM with native Web Audio Api and calculates RMS on audio segmented data.

# Architecture

### 1. FiniteRecorder

FiniteRecorder has simple constructor interface

```ts
interface FiniteRecorderProps {
  mediaStream: MediaStream;
  ttl: number;
  onTerminate: (recordedAudioData: RecordedAudioData) => void;
}
```

FiniteRecorder is implemented on top of native `MediaRecorder`.

- `mediaStream` is the stream consumed by native MediaRecorder.
- `ttl` is sets the recording duration. At the end of ttl time it will trigger MediaRecorder stop method and data will be available on onTerminate callback.
- `onTerminate` callback is called at the end of ttl time or if stop method is called. If interrupt method is called, onTerminate method should not be called.

`RecorderAudioData` is an interface that contains usefull audio processed data.

```ts
interface RecordedAudioData {
  rms: number;
  blob: Blob;
  audioBuffer: AudioBuffer;
}
```

- `rms` is the Root mean square value.
- `blob` is the original and untouched blob input that comes from MediaRecorder dataavaliable event listener.
- `audioBuffer` is the outpout of `AudioContext.decodeAudioData` method. It contains stereo or mono `PCM` data structured in channels, `sampleRate`, `duration`, `length`, according to native Web Audio API.

FiniteRecorder class has this simple api.

```ts
class FiniteRecorder {
  start();
  stop();
  interrupt();
}
```

- `start` method starts MediaRecorder recording on MediaStream.
- `stop` method calls stop method on MediaRecorder.
- `ìnterrupt` method calls stop and prevents onTerminate callback.

### 2. Recorder

`Recorder` has 4 parallel layers of audio processing.

1. The first layer is the `global layer`. It records the full audio from media stream given the ttl time.
2. The second layer is the `audio segmentation layer`. It is activated when, after a silence period, it is detected an audio with RMS value above threshold.
3. The thrid layer is the `silence window detection layer`. It is activated when, during a audio segmentation layer execution, it is detected an audio with RMS below threshold.
4. The forth layer is the `micro recorder layer`. It is an always active layer that captures micro segments from media stream, checking the RMS value, triggering or not the second and third layer.

All four layers capture audio from the same media stream.

Recorder has this constructor interface.

```ts
interface RecorderProps {
  mediaStream: MediaStream;

  silenceWindowThreshold: number;
  silenceVolumeThreshold: number;
  onDataSegmentation: (recorderAudioData: RecordedAudioData) => void;
  onTerminate: (recorderAudioData: RecordedAudioData) => void;

  maxRecordingTime: number;
}
```

- `mediaStream` is the stream consumed by native MediaRecorder.
- `silenceWindowThreshold` is the silence duration threshold that defines when segmentation should occur.
- `silenceVolumeThreshold` is the RMS volume that defines when sound is below or above threshold.
- `onDataSegmentation` is the callback called then second layer detects audio segments separated by silence windows.
- `onTerminate` is the callback triggered when global layer provides the full audio recording.
- `maxRecordingTime` is the global layer recording ttl.

Record class has same class api from FiniteRecorder.

```ts
class Recorder {
  start();
  stop();
  interrupt();
}
```

- `start` method starts all four recorind layers.
- `stop` method calls stop method on all four layers.
- `ìnterrupt` method calls interrupt on all four layers.

# Usage

```ts
import { Recorder } from "nlsn-recorder";

const main = async () => {
  const mediaStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });

  const recorder = new Recorder({
    mediaStream,

    silenceWindowThreshold: 1000; // 1 second
    silenceVolumeThreshold: 100; // 100ms
    onDataSegmentation: ({blob, rms, audioBuffer}: RecordedAudioData) => {
        console.log({
            blob,
            rms,
            audioBuffer
        })
    },
    onTerminate:({blob, rms, audioBuffer}: RecordedAudioData) => {
        console.log({
            blob,
            rms,
            audioBuffer
        })
    },

    maxRecordingTime: 7200 // 2hours
  });

  recorder.start()

  // Finishes the recording and get the callbacks value
  recorder.stop()

  // Interrupts the recording and get rid of the callbacks
  recorder.interrupt()
};
```
