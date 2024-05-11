import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import SpInAppUpdates, {
  AndroidInstallStatus,
} from 'sp-react-native-in-app-updates';
import CustomTextSemiBold from './ui/CustomTextSemiBold';
import {useMeetingOngoingStore} from '../utils/store/useMeetingOgoingStore';

const inAppUpdates = new SpInAppUpdates(true);

export default function AppUpdating() {
  const [totalSize, setTotalSize] = useState<number>(0);
  const [currentDownloaded, setCurrentDownloaded] = useState<number>(0);
  const [updateStatus, setUpdateStatus] = useState<AndroidInstallStatus>(0);
  const {isOngoingMeeting} = useMeetingOngoingStore();

  useEffect(() => {
    inAppUpdates.addStatusUpdateListener(param => {
      const {status, bytesDownloaded, totalBytesToDownload} = param;
      setUpdateStatus(status);
      setTotalSize(totalBytesToDownload);
      setCurrentDownloaded(bytesDownloaded);
    });

    return inAppUpdates.removeStatusUpdateListener(() => {});
  }, []);

  return updateStatus === 2 || updateStatus === 3 ? (
    <View
      className="absolute top-0 left-0 right-0 z-20 flex-row items-center p-4 text-center bg-secondary">
      <CustomTextSemiBold className="text-white">
        Update is in progress...
      </CustomTextSemiBold>
      <CustomTextSemiBold className="ml-auto text-white">
        {updateStatus === 2
          ? `${currentDownloaded} / ${totalSize}`
          : 'Installing'}
      </CustomTextSemiBold>
    </View>
  ) : (
    <></>
  );
}
