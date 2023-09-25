export const calcRMS = (audioBuffer: AudioBuffer): number => {
  const channelData = Array.from(
    Array(audioBuffer.numberOfChannels).keys()
  ).map((index) => audioBuffer.getChannelData(index));

  const area = channelData
    .map((data) => {
      return data.reduce<number>((acc, current) => {
        return acc + current;
      }, 0);
    })
    .reduce<number>((acc, next) => {
      return acc + next;
    }, 0);

  return area / (audioBuffer.length * audioBuffer.numberOfChannels);
};
