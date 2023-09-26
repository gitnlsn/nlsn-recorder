export const calcRMS = (audioBuffer: AudioBuffer): number => {
  const channelData = Array.from(
    Array(audioBuffer.numberOfChannels).keys()
  ).map((index) => audioBuffer.getChannelData(index));

  const squaredSum = channelData
    .map((data) => {
      // Integration: trapezoidal rule
      return data.reduce<number>((acc, current, index, array) => {
        // - skipś last element
        if (index === array.length - 1) {
          return acc;
        }

        const next = array[index + 1];
        const meanValue = (next + current) / 2;
        const square = meanValue * meanValue;
        return acc + square;
      }, 0);
    })
    // Summation of each channel
    .reduce<number>((acc, next) => {
      return acc + next;
    }, 0);

  return Math.sqrt(
    squaredSum / (audioBuffer.length * audioBuffer.numberOfChannels)
  );
};
