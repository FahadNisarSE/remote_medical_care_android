import {PermissionsAndroid, ToastAndroid} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';

export default async function saveImage(url: string, filename: string) {
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    {
      title: 'Allow Storage Permission',
      message:
        'Please allow this app to write to your storage to save this file.',
      buttonNeutral: 'Ask me later',
      buttonNegative: 'Cancel',
      buttonPositive: 'Ok',
    },
  );
  if (granted === PermissionsAndroid.RESULTS.GRANTED) {
    const {config, fs} = RNFetchBlob;
    const fileDir = fs.dirs.DownloadDir;

    config({
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        path: fileDir + '/rmc/' + filename,
        description: 'File is downloading...',
      },
    })
      .fetch('GET', url)
      .then(() => {
        console.log('Downloaded successfully...');
      })
      .catch(() => {
        console.log('Downloaded failed...');
      });
  } else {
    ToastAndroid.show('Permission Denied...', 1000);
  }
}
