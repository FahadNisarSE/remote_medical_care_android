import React, {useState} from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import {RtcSurfaceView, VideoSourceType} from 'react-native-agora';

const {width, height} = Dimensions.get('window');

export default function ActiveVideo({
  remoteUsers,
  userId,
  activeVideo,
}: {
  remoteUsers: number[];
  userId: number;
  activeVideo: number | null;
}) {
  return (
    <View
      style={
        remoteUsers.length === 0 || !activeVideo
          ? styles.videoWrapperDefault
          : styles.videoViewWrapperPreview
      }>
      <RtcSurfaceView
        zOrderOnTop={true}
        canvas={{uid: userId, sourceType: VideoSourceType.VideoSourceCamera}}
        style={
          remoteUsers.length === 0 || !activeVideo
            ? styles.videoDefault
            : styles.videoViewPreview
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  videoViewPreview: {
    width: height * 0.25 * (3 / 4),
    height: height * 0.25,
    borderRadius: 10,
    overflow: 'hidden',
  },
  videoDefault: {
    width: width - 40,
    height: height * 0.6,
    borderRadius: 10,
    overflow: 'hidden',
  },
  videoViewWrapperPreview: {
    position: 'absolute',
    top: 20,
    right: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  videoWrapperDefault: {
    position: 'relative',
    top: 0,
    right: 0,
    margin: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
});
