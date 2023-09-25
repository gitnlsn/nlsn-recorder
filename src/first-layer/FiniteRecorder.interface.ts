import { RecordedAudioData } from "../common/RecordedAudioData.interface";

export interface FiniteRecorderProps {
  mediaStream: MediaStream;

  ttl: number;

  onTerminate: (recordedAudioData: RecordedAudioData) => void;
}
