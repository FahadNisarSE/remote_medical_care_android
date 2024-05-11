import React, {useEffect, useState} from 'react';
import CustomTextSemiBold from './ui/CustomTextSemiBold';
import {useMeetingOngoingStore} from '../utils/store/useMeetingOgoingStore';

export const formatTime = (milliseconds: number) => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes} : ${
    remainingSeconds < 10 && remainingSeconds >= 0 ? '0' : ''
  }${remainingSeconds < 0 ? -remainingSeconds : remainingSeconds}`;
};

export default function MeetingTimer({meetingEndTime}: {meetingEndTime: Date}) {
  const {isOngoingMeeting, setRemaingingTime} = useMeetingOngoingStore();
  const [timeRemaining, setTimeRemaining] = useState(
    meetingEndTime.getTime() - Date.now(),
  );

  useEffect(() => {
    const timerId = setTimeout(() => {
      const remaingingTime = timeRemaining - 1000;
      setTimeRemaining(remaingingTime);
      if (isOngoingMeeting) setRemaingingTime(remaingingTime);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeRemaining]);

  return (
    <CustomTextSemiBold className="px-3 py-1 mr-auto text-white rounded-full bg-accent">
      {formatTime(timeRemaining)}
    </CustomTextSemiBold>
  );
}
