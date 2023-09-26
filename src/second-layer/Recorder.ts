import { FiniteRecorder } from "../first-layer/FiniteRecorder";
import { RecorderProps } from "./Recorder.interface";

export class Recorder {
  private globalFiniteRecorder: FiniteRecorder | undefined;
  private audioSementationRecorder: FiniteRecorder | undefined;
  private silenceCheckRecorder: FiniteRecorder | undefined;

  private intervalId: number | undefined;

  constructor(private props: RecorderProps) {}

  private setGlobalFiniteRecorder() {
    this.globalFiniteRecorder = new FiniteRecorder({
      mediaStream: this.props.mediaStream,
      ttl: this.props.maxRecordingTime,

      onTerminate: (audioData) => {
        this.props.onTerminate(audioData);

        this.interrupt();
      },
    });

    this.globalFiniteRecorder.start();
  }

  private setAudiosegmentationRecorder() {
    this.audioSementationRecorder = new FiniteRecorder({
      mediaStream: this.props.mediaStream,
      ttl: this.props.maxRecordingTime,

      onTerminate: (audioData) => {
        this.props.onDataSegmentation(audioData);
      },
    });

    this.audioSementationRecorder.start();
  }

  private setSilenceWindowInspector() {
    this.silenceCheckRecorder = new FiniteRecorder({
      mediaStream: this.props.mediaStream,
      ttl: this.props.silenceWindowThreshold,
      onTerminate: ({ rms }) => {
        if (rms < this.props.silenceVolumeThreshold) {
          this.audioSementationRecorder?.stop();
        }
        this.silenceCheckRecorder = undefined;
      },
    });

    this.silenceCheckRecorder.start();
  }

  private setMicroRecorder() {
    this.intervalId = window.setInterval(() => {
      new FiniteRecorder({
        mediaStream: this.props.mediaStream,
        ttl: this.props.silenceWindowThreshold / 10,

        onTerminate: ({ rms }) => {
          const lowRMS = rms < this.props.silenceVolumeThreshold;

          const isSegmentingAudioData =
            this.audioSementationRecorder !== undefined;

          const notCheckingSilence = this.silenceCheckRecorder === undefined;

          if (lowRMS && isSegmentingAudioData && notCheckingSilence) {
            this.setSilenceWindowInspector();
          }

          if (!lowRMS) {
            this.silenceCheckRecorder?.interrupt();

            this.setAudiosegmentationRecorder();
          }
        },
      }).start();
    }, this.props.silenceWindowThreshold / 10);
  }

  start() {
    this.setGlobalFiniteRecorder();
    this.setMicroRecorder();
  }

  stop() {
    this.globalFiniteRecorder?.stop();
    this.audioSementationRecorder?.stop();
    this.silenceCheckRecorder?.stop();

    window.clearInterval(this.intervalId);
  }

  interrupt() {
    this.globalFiniteRecorder?.interrupt();
    this.audioSementationRecorder?.interrupt();
    this.silenceCheckRecorder?.interrupt();

    window.clearInterval(this.intervalId);
  }
}
