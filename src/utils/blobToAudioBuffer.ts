export const blobToAudioBuffer = async (blob: Blob): Promise<AudioBuffer> => {
  const arrayBuffer = await new Blob([blob]).arrayBuffer();
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  return audioBuffer;
};
