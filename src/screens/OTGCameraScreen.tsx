import {Button, Text, View} from 'react-native';
import {
  ExternalVideoSourceType,
  VideoFormat,
  VideoModulePosition,
  VideoPixelFormat,
  createAgoraRtcEngine,
  RtcSurfaceView,
  VideoSourceType,
  RenderModeType,
  ClientRoleType,
  ChannelProfileType,
} from 'react-native-agora';
import OTGCamera from '../nativemodules/OTGCamera';
import React, {useEffect} from 'react';

const OTGCameraScreen = () => {
  const engine = createAgoraRtcEngine();
  // engine.initialize({appId: '7cb84b69b92a41b2adc21a19e1a32e3e'});
  // engine.enableVideo();
  const videoTrackId = engine.createCustomVideoTrack();

  const startLocalStream = async () => {
    await engine.startPreview();
  };

  engine.addListener('onConnectionStateChanged', event => {
    console.log('onConnectionStateChanged', event);
  });
  function generateRandom4DigitNumber(): number {
    const min = 1000;
    const max = 9999;

    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomNumber;
  }

  const joinChannel = async () => {
    engine.initialize({appId: '7cb84b69b92a41b2adc21a19e1a32e3e'});

    engine.enableVideo();
    engine.setChannelProfile(ChannelProfileType.ChannelProfileLiveBroadcasting);
    const joinResult = engine.joinChannel(
      '007eJxTYNDjlZBzfvmnem2ry9Jbt9fNupU8U3HSjfelDT5bLhz/4LNBgcE8OcnCJMnMMsnSKNHEMMkoMSXZyDDR0DLVMNHYKNU4tWKfbFpDICODq709CyMDBIL4rAxF+fm5hgwMAAlgIV8=',
      'de2f5cd0-9691-41ab-bbc2-a3165dd1fdbf',
      generateRandom4DigitNumber(),
      {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      },
      {
        customVideoTrackId: videoTrackId,
        publishCustomVideoTrack: true,
      },
    );
    console.log('joinResult>>', joinResult);
  };

  useEffect(() => {
    engine
      .getMediaEngine()
      .setExternalVideoSource(true, false, ExternalVideoSourceType.VideoFrame);

    engine.registerEventHandler({
      onError: (errorCode, message) => {
        console.log({errorCode, message});
      },
      onLocalVideoStateChanged(source, state, _error) {
        console.log('onLocalVideoStateChanged', {source, state, _error});
      },
      onJoinChannelSuccess: connection => {
        console.log('onJoinChannelSuccess', {connection});
      },
      onStreamMessageError(
        connection,
        remoteUid,
        streamId,
        code,
        missed,
        cached,
      ) {
        console.log('Error  : ', {
          connection,
          remoteUid,
          streamId,
          code,
          missed,
          cached,
        });
      },
      onUserOffline: (_connection, Uid) => {
        console.log('onUserOffline', {_connection, Uid});
      },
      onUserJoined: (_connection, Uid) => {
        console.log('onUserJoined', {_connection, Uid});
      },
      onConnectionLost: connection => {
        console.log('onUserJoined', {connection});
      },
      onRemoteVideoStateChanged: (
        connection,
        remoteUid,
        state,
        reason,
        elapsed,
      ) => {
        console.log('onRemoteVideoStateChanged', {
          connection,
          remoteUid,
          state,
          reason,
          elapsed,
        });
      },
    });
    // startLocalStream();
  }, []);

  const pushFrame = (data: Uint8Array) => {
    engine.getMediaEngine().pushVideoFrame(
      {
        format: VideoPixelFormat.VideoPixelRgba,
        stride: 400,
        height: 400,
        textureId: 2,
        buffer: data,
      },
      videoTrackId,
    );
  };

  useEffect(() => {
    function createDummyRgbaFrame(width, height, red, green, blue, alpha) {
      // Calculate number of elements (pixels * 4 channels per pixel)
      const numElements = width * height * 4;

      // Create a new Uint8Array (unsigned 8-bit integers) for the byte array
      const frameData = new Uint8Array(numElements);

      // Loop through each element (i) in the byte array, filling with color values
      for (let i = 0; i < numElements; i += 4) {
        frameData[i] = red; // Set red channel value
        frameData[i + 1] = green; // Set green channel value
        frameData[i + 2] = blue; // Set blue channel value
        frameData[i + 3] = alpha; // Set alpha channel value
      }

      return frameData;
    }

    const width = 320;
    const height = 240;

    let currentColor = 0; // 0 - Red, 1 - Green, 2 - Blue

    function generateFrame() {
      let red, green, blue, alpha;
      switch (currentColor) {
        case 0:
          red = 255;
          green = 0;
          blue = 0;
          alpha = 255;
          break;
        case 1:
          red = 0;
          green = 255;
          blue = 0;
          alpha = 255;
          break;
        case 2:
          red = 0;
          green = 0;
          blue = 255;
          alpha = 255;
          break;
      }

      const frameData = createDummyRgbaFrame(
        width,
        height,
        red,
        green,
        blue,
        alpha,
      );
      console.log(frameData.toString());

      // Do something with the frameData (e.g., console.log or use it for display)

      currentColor = (currentColor + 1) % 3; // Cycle through colors (0, 1, 2)
    }

    // Set interval to generate frame every 1 second (adjust as needed)
    // const intervalId = setInterval(generateFrame, 1000);

    // Optionally, clear the interval to stop frame generation
    // clearInterval(intervalId);
  }, []);

  return (
    <View>
      <Text>OTG Camera</Text>
      <Button title="Join channel" onPress={joinChannel} />
      <RtcSurfaceView
        canvas={{
          backgroundColor: 0x123412,
          sourceType: VideoSourceType.VideoSourceCustom,
        }}
        style={{width: 100, height: 100}}
        // style={{width: 100, height: 100}}
        connection={{channelId: '123', localUid: 1}}

        // renderMode={}
      />
      <OTGCamera
        onPreviewData={data => {
          pushFrame(Uint8Array.from(atob(data), c => c.charCodeAt(0)));
        }}
      />
    </View>
  );
};

export default OTGCameraScreen;
