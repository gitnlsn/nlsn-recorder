# nlsn-recorder

Native web audio api implementation of recorder.

1. FiniteRecorder will take a prefixed ttl (time to live) duration to take the recording.
2. Recorder is a FiniteRecorder composed class that takes audio streams and detects whether sound is silent or not. It will call a callback with the audio segment where the RMS is not below threshold. volume threshold, silence window duration, max ttl are customised.

# ISSUES

### 1. Audio data segmentation should detect silence level
