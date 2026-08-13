import React, { useRef } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';
import { colors } from '../utils/colors';

interface Props {
  value: number;
  minimumValue?: number;
  maximumValue?: number;
  onSlidingComplete?: (value: number) => void;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
  style?: any;
}

export default function ProgressSlider({
  value,
  minimumValue = 0,
  maximumValue = 1,
  onSlidingComplete,
  minimumTrackTintColor = colors.primary,
  maximumTrackTintColor = colors.surfaceBorder,
  thumbTintColor = colors.primary,
  style,
}: Props) {
  const widthRef = useRef(1);
  const onSlidingCompleteRef = useRef(onSlidingComplete);
  const minRef = useRef(minimumValue);
  const maxRef = useRef(maximumValue);
  onSlidingCompleteRef.current = onSlidingComplete;
  minRef.current = minimumValue;
  maxRef.current = maximumValue;

  const range = maximumValue - minimumValue || 1;
  const pct = Math.min(1, Math.max(0, (value - minimumValue) / range));

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const ratio = Math.min(1, Math.max(0, e.nativeEvent.locationX / widthRef.current));
        onSlidingCompleteRef.current?.(minRef.current + ratio * (maxRef.current - minRef.current));
      },
      onPanResponderMove: (e) => {
        const ratio = Math.min(1, Math.max(0, e.nativeEvent.locationX / widthRef.current));
        onSlidingCompleteRef.current?.(minRef.current + ratio * (maxRef.current - minRef.current));
      },
      onPanResponderRelease: (e) => {
        const ratio = Math.min(1, Math.max(0, e.nativeEvent.locationX / widthRef.current));
        onSlidingCompleteRef.current?.(minRef.current + ratio * (maxRef.current - minRef.current));
      },
    })
  ).current;

  return (
    <View
      style={[styles.hitbox, style]}
      onLayout={(e) => { widthRef.current = e.nativeEvent.layout.width; }}
      {...panResponder.panHandlers}
    >
      <View style={[styles.track, { backgroundColor: maximumTrackTintColor }]}>
        <View
          style={[
            styles.fill,
            { width: `${pct * 100}%`, backgroundColor: minimumTrackTintColor },
          ]}
        />
      </View>
      <View
        pointerEvents="none"
        style={[
          styles.thumb,
          {
            backgroundColor: thumbTintColor,
            left: `${pct * 100}%`,
            transform: [{ translateX: -8 }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hitbox: {
    height: 40,
    justifyContent: 'center',
  },
  track: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    top: '50%',
    marginTop: -8,
  },
});
