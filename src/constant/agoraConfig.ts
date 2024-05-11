import {VideoContentHint} from 'react-native-agora';

function generateRandom4DigitNumber(): number {
  const min = 1000;
  const max = 9999;

  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomNumber;
}

const agoraConfig = {
  token:
    '007eJxTYDhpdPWM542MNet9OZt/8fQun50ysUu1103d64M1c9xLIQYFhlSjxDTzlGRDMwNTQxNL06Sk5MRkc0Mz8zRzA/NkA8PEqTfepjYEMjL8WqvPxMgAgSA+C0NuYmYeAwMAQo0fqg==',
  appId: 'e2af7dc16051495bbcac7167f707c01a',
  channelName: 'main',
  uid: generateRandom4DigitNumber(),
  uid2: generateRandom4DigitNumber(),
  product: null as any,
};

const user1 = {
  id: 'user_1',
  token:
    '007eJxTYFjdHsB6NfqevdKcXutgtbJD/zeuf2jPIXX+85afbqdPrWRRYEg1SkwzT0k2NDMwNTSxNE1KSk5MNjc0M08zNzBPNjBMXCj4JrUhkJGB2eg4EyMDKwMjEIL4KgwWRibJSZYpBropySbGuoaGqam6lsaG5rrmxgbmlmamJoYGxkYAyQ8nGg==',
};

const user2 = {
  id: 'user_2',
  token:
    '007eJxTYFCcoXVmb1//py7v6kW3uWOCP1TWRpbMSunZOM3J3O6nzj0FhlSjxDTzlGRDMwNTQxNL06Sk5MRkc0Mz8zRzA/NkA8PEg4JvUhsCGRnebe5gZWRgZWAEQhBfhcHSPDnVzCzNQDcl2cRY19AwNVXXwtg0WdfM0CjJ3CzZMjnVJBEA/kspMg==',
};

const agoraChatConfig = {
  APP_KEY: '71999694#1297490',
  WS_ADDRESS: 'msynic-api-61.chat.agora.io',
  REST_API: 'a61.chat.agora.io',
};

const screenSharingConfig = {
  sampleRate: 16000,
  channels: 2,
  captureSignalVolume: 100,
  width: 1280,
  height: 720,
  frameRate: 15,
  bitrate: 0,
  contentHint: VideoContentHint.ContentHintMotion,
  captureAudio: true,
  captureVideo: true,
};

export {agoraConfig, screenSharingConfig, user1, user2, agoraChatConfig};
