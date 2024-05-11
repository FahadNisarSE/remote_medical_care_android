import { isAfter, isBefore, parseISO } from 'date-fns';

function timeSinceWithTime(timestampInMs: number) {
  const now = Date.now();
  const seconds = Math.floor((now - timestampInMs) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const years = Math.floor(days / 365);

  const date = new Date(timestampInMs);
  const hours12 = date.getHours() % 12 || 12;
  const minutesFormatted = date.getMinutes().toString().padStart(2, '0');
  const timeString = `${hours12}:${minutesFormatted}`;

  if (years > 0) {
    return `${years}y ${timeString}`;
  } else if (days > 0) {
    return `${days}d ${timeString}`;
  } else if (hours > 0) {
    return `${hours}h ${timeString}`;
  } else if (minutes > 0) {
    return `${minutes}m ${timeString}`;
  } else {
    return `${seconds}s ${timeString}`;
  }
}

function convertTo24HourFormat(timeString: string): string {
  let trimmedTimeString = timeString.replace(/ PM$/, '');
  trimmedTimeString = trimmedTimeString.replace(/ AM$/, '');

  const [hours, minutes] = trimmedTimeString.split(':');

  const isPM = trimmedTimeString.includes('PM');

  let convertedHours = parseInt(hours);

  if (isPM && convertedHours !== 12) {
    convertedHours += 12; // Add 12 for PM times except noon (12:00 PM)
  } else if (!isPM && convertedHours === 12) {
    convertedHours = 0; // Convert 12:00 AM to 00:00
  }

  return `${convertedHours.toString().padStart(2, '0')}:${minutes}`;
}

function BetweenTimes(
  startTime: string | undefined,
  endTime: string | undefined,
  date: string | undefined,
): string {
  if (!startTime || !endTime || !date) return 'Join Now';

  console.log('Start Time', {startTime, endTime, date});

  // Combine date and time strings
  const startTimeString = `${date} ${convertTo24HourFormat(startTime)}`;
  const endTimeString = `${date} ${convertTo24HourFormat(endTime)}`;

  const startDateObject = parseISO(startTimeString);
  const endDateObject = parseISO(endTimeString);

  const currentDate = new Date();

  if (isBefore(currentDate, startDateObject)) return 'Not yet';

  if (isAfter(currentDate, endDateObject)) return 'Expired';

  return 'Join Now';
}

export { BetweenTimes, timeSinceWithTime };
