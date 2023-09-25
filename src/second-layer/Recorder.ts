import { FiniteRecorder } from "../first-layer/FiniteRecorder";
import { RecorderProps } from "./Recorder.interface";

export class Recorder {
  private globalFiniteRecorder: FiniteRecorder | undefined;
  private audioSementationRecorder: FiniteRecorder | undefined;
  private microRecorder: FiniteRecorder | undefined;
  private silenceCheckRecorder: FiniteRecorder | undefined;

  private intervalId: number | undefined;

  constructor(private props: RecorderProps) {}

  private setGlobalFiniteRecorder() {
    this.globalFiniteRecorder = new FiniteRecorder({
      mediaStream: this.props.mediaStream,
      ttl: this.props.maxRecordingTime,

      onTerminate: (audioData) => {
        this.props.onTerminate(audioData);

        this.clear();
      },
    });

    this.globalFiniteRecorder.start();
  }

  private setAudiosegmentationRecorder() {
    if (this.audioSementationRecorder !== undefined) {
      return;
    }

    this.audioSementationRecorder = new FiniteRecorder({
      mediaStream: this.props.mediaStream,
      ttl: this.props.maxRecordingTime,

      onTerminate: (audioData) => {
        this.props.onDataSegmentation(audioData);

        this.setAudiosegmentationRecorder;
      },
    });
  }

  private setSilenceWindowInspector() {
    this.silenceCheckRecorder = new FiniteRecorder({
      mediaStream: this.props.mediaStream,
      ttl: this.props.silenceWindowThreshold,
      onTerminate: () => {
        this.audioSementationRecorder!.stop();
        this.silenceCheckRecorder = undefined;
      },
    });
  }

  private setMicroRecorder() {
    this.intervalId = window.setInterval(() => {
      new FiniteRecorder({
        mediaStream: this.props.mediaStream,
        ttl: this.props.silenceVolumeThreshold / 10,
        onTerminate: (data) => {
          if (data.rms < this.props.silenceVolumeThreshold) {
            this.setSilenceWindowInspector();
          }
        },
      });
    }, this.props.silenceWindowThreshold / 10);
  }

  start() {
    this.setGlobalFiniteRecorder();
    this.setAudiosegmentationRecorder();
    this.setMicroRecorder();
  }

  stop() {
    this.clear();
  }

  clear() {
    this.globalFiniteRecorder?.stop();
    this.audioSementationRecorder?.stop();
    this.microRecorder?.stop();
    this.silenceCheckRecorder?.stop();

    window.clearInterval(this.intervalId);
  }
}
