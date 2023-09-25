import { FiniteRecorderProps } from "./FiniteRecorder.interface";
import { blobToAudioBuffer } from "../utils/blobToAudioBuffer";
import { calcRMS } from "../utils/calcRMS";

export class FiniteRecorder {
  private mediaRecorder: MediaRecorder;

  private timeoutId: number | undefined;

  private interrupted?: boolean;

  constructor(private props: FiniteRecorderProps) {
    this.mediaRecorder = new MediaRecorder(props.mediaStream);
    this.timeoutId = window.setTimeout(() => {
      this.mediaRecorder.stop();
    }, props.ttl);

    this.config();
  }

  private async config() {
    this.mediaRecorder.addEventListener("dataavailable", async (event) => {
      if (this.interrupted) {
        return;
      }

      const audioBuffer = await blobToAudioBuffer(event.data);
      const rms = calcRMS(audioBuffer);

      this.props.onTerminate({ rms, audioBuffer, blob: event.data });
    });

    this.mediaRecorder.addEventListener("stop", () => {
      window.clearTimeout(this.timeoutId);
    });
  }

  start() {
    this.mediaRecorder.start();
  }

  stop() {
    this.mediaRecorder.stop();
  }

  interrupt() {
    this.interrupted = true;
    this.mediaRecorder.stop();
  }
}
