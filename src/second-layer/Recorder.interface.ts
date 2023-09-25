import { RecordedAudioData } from "../common/RecordedAudioData.interface";

export interface RecorderProps {
  mediaStream: MediaStream;

  silenceWindowThreshold: number;
  silenceVolumeThreshold: number;
  onDataSegmentation: (recorderAudioData: RecordedAudioData) => void;
  onTerminate: (recorderAudioData: RecordedAudioData) => void;

  maxRecordingTime: number;
}
