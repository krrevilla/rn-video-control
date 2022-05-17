import React, {useState} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';

// import VideoControl from './VideoControl';
import VideoPlayer from 'rn-video-control';

const videoSample =
  'https://cdn.videvo.net/videvo_files/video/premium/video0231/large_watermarked/05_part_232_look_tv_preview.mp4';

const App = () => {
  const [paused, setPaused] = useState(true);

  const onPause = () => {
    setPaused(true);
  };

  const onPlay = () => {
    setPaused(false);
  };

  return (
    <SafeAreaProvider>
      <VideoPlayer
        onPause={onPause}
        onPlay={onPlay}
        repeat={true}
        paused={paused}
        source={{uri: videoSample}}
      />
    </SafeAreaProvider>
  );
};

export default App;
