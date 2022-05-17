import PropTypes from 'prop-types';
import React, {useEffect, useCallback, useState, useRef} from 'react';
import {
  Animated,
  ActivityIndicator,
  StyleSheet,
  View,
  Pressable,
  Dimensions,
  ViewPropTypes,
  Text,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Slider from '@react-native-community/slider';

const thumbImage = require('./thumb.png');

const formatTime = time => {
  let sec_num = parseInt(time, 10); // don't forget the second param
  let hours = Math.floor(sec_num / 3600);
  let minutes = Math.floor((sec_num - hours * 3600) / 60);
  let seconds = sec_num - hours * 3600 - minutes * 60;

  if (hours === 0) {
    hours = null;
  } else if (hours < 10) {
    hours = '0' + hours;
  }

  if (minutes < 10) {
    minutes = '0' + minutes;
  }
  if (seconds < 10) {
    seconds = '0' + seconds;
  }

  const displayedHours = hours ? `${hours}:` : '';

  return `${displayedHours}${minutes}:${seconds}`;
};

function VideoPlayer({
  minimumTrackTintColor = '#34e8eb',
  maximumTrackTintColor = '#fff',
  ...props
}) {
  const ref = useRef();

  const [displayReady, setDisplayReady] = useState(false);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0));
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      Animated.timing(fadeAnim.current, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 5000);

    return () => {
      clearTimeout(timerRef.current);
    };
  }, []);

  const onTap = () => {
    Animated.timing(fadeAnim.current, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      Animated.timing(fadeAnim.current, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 5000);
  };

  const onToggleFullscreen = useCallback(() => {
    ref.current?.presentFullscreenPlayer();
  }, []);

  const onReadyForDisplay = useCallback(() => {
    setDisplayReady(true);
  }, []);

  const onLoad = useCallback(event => {
    setDuration(Math.floor(event.duration));
  }, []);

  const onDrag = useCallback(value => {
    ref.current?.seek(value);
  }, []);

  const onProgress = useCallback(event => {
    setProgress(event.currentTime);
  }, []);

  const onEnd = () => {
    setProgress(0);
    props.onEnd && props.onEnd();
  };

  const onFullscreenPlayerWillPresent = () => {
    props.onPlay && props.onPlay();
  };

  const onFullscreenPlayerWillDismiss = () => {
    props.onPause && props.onPause();
  };

  return (
    <View style={[styles.container, props.style]}>
      <View style={styles.backgroundVideo}>
        <Video
          resizeMode="contain"
          onProgress={onProgress}
          ref={ref}
          onEnd={onEnd}
          style={styles.backgroundVideo}
          onFullscreenPlayerWillPresent={onFullscreenPlayerWillPresent}
          onFullscreenPlayerWillDismiss={onFullscreenPlayerWillDismiss}
          onLoad={onLoad}
          onReadyForDisplay={onReadyForDisplay}
          {...props}
        />
      </View>

      <Animated.View style={styles.header(fadeAnim.current)}>
        <View style={styles.footerIcons}>
          <Icon
            onPress={props.onBack}
            name="chevron-left"
            color="#fff"
            size={30}
          />
        </View>
      </Animated.View>

      <Pressable onPress={onTap} style={styles.filler}>
        {!displayReady && (
          <ActivityIndicator color="#fff" style={styles.loader} />
        )}
      </Pressable>

      <Animated.View style={styles.footer(fadeAnim.current)}>
        <Slider
          value={progress}
          onValueChange={onDrag}
          style={styles.slider}
          step={1}
          minimumValue={0}
          maximumValue={duration}
          minimumTrackTintColor={minimumTrackTintColor}
          maximumTrackTintColor={maximumTrackTintColor}
          thumbImage={thumbImage}
        />
        <View style={styles.footerIcons}>
          <Icon
            disabled={!displayReady}
            onPress={props.paused ? props.onPlay : props.onPause}
            name={props.paused ? 'play-arrow' : 'pause'}
            color="#fff"
            size={25}
          />

          <View style={styles.progressContainer}>
            <Text style={styles.progress}>
              {`${formatTime(progress)} / ${formatTime(duration)}`}
            </Text>
          </View>

          <Icon
            disabled={!displayReady}
            onPress={onToggleFullscreen}
            name="fullscreen"
            color="#fff"
            size={25}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width,
    paddingVertical: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  filler: {
    flex: 1,
    zIndex: 1,
  },
  header: animation => ({
    zIndex: 1,
    width: '100%',
    paddingHorizontal: 15,
    // transform: [
    //   {
    //     translateY: animation.interpolate({
    //       inputRange: [0, 1],
    //       outputRange: [-100, 0],
    //     }),
    //   },
    // ],
  }),
  footer: animation => ({
    zIndex: 1,
    width: '100%',
    paddingHorizontal: 15,
    justifyContent: 'center',
    // transform: [
    //   {
    //     translateY: animation.interpolate({
    //       inputRange: [0, 1],
    //       outputRange: [100, 0],
    //     }),
    //   },
    // ],
  }),
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundVideo: {
    backgroundColor: '#000',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  slider: {
    width: '100%',
  },
  footerIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progress: {
    color: '#fff',
    fontSize: 12,
  },
});

VideoPlayer.propTypes = {
  onBack: PropTypes.func,
  onPause: PropTypes.func,
  onPlay: PropTypes.func,
  onEnd: PropTypes.func,
  style: ViewPropTypes.style,

  maximumTrackTintColor: PropTypes.string,
  minimumTrackTintColor: PropTypes.string,
};

export default React.memo(VideoPlayer);
