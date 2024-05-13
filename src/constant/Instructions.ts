export const TemperatureInstruction = [
  {
    id: '1',
    title: 'Begin Test',
    description:
      'Tap the "Start Test" button to initiate the measurement process.',
    image: require('../assets/images/step_0.jpeg'),
  },
  {
    id: '2',
    title: 'Connect to Device',
    description:
      'Ensure Bluetooth is enabled. Find and select your device from the list. Wait for connection confirmation.',
    image: require('../assets/images/step_1_mintti.jpg'),
  },
  {
    id: '3',
    title: 'Place the Equipment',
    description:
      'The distance between the side of the device with the infrared sensor and the head is two fingers.',
    image: require('../assets/images/temperature/step_02.jpeg'),
  },
  {
    id: '4',
    title: 'Start Measurement',
    description:
      'Follow the on-screen instructions specific to the measurement type.',
    image: require('../assets/images/temperature/step_03.jpg'),
  },
  {
    id: '5',
    title: 'Save Results',
    description:
      'Review and confirm the accuracy of the data, then tap "Save" to store it securely.',
    image: require('../assets/images/temperature/step_04.jpg'),
  },
];

export const BloodPressureInstruction = [
  {
    id: '1',
    title: 'Begin Test',
    description:
      'Tap the "Start Test" button to initiate the measurement process.',
    image: require('../assets/images/step_0.jpeg'),
  },
  {
    id: '2',
    title: 'Connect to Device',
    description:
      'Ensure Bluetooth is enabled. Find and select your device from the list. Wait for connection confirmation.',
    image: require('../assets/images/step_1_mintti.jpg'),
  },
  {
    id: '3',
    title: 'Fixed Equipment',
    description:
      'Fix the device on the device card slot of the sleeve, make sure the round hole of the device is aligned with hole on the sleeve.',
    image: require('../assets/images/bloodpressure/step_02.jpeg'),
  },
  {
    id: '4',
    title: 'Wear a sleeve',
    description:
      'Enter from the end of the red arrow on the cuff, put the cuff on the upper arm, the palm of the hand is up, the arm is flat, and the device on the cuff is facing up.',
    image: require('../assets/images/bloodpressure/step_03.jpeg'),
  },
  {
    id: '5',
    title: 'Arms flat',
    description: "Keep calm, sit down and don't talk.",
    image: require('../assets/images/bloodpressure/step_04.jpeg'),
  },
  {
    id: '6',
    title: 'Start Measurement',
    description:
      'Follow the on-screen instructions specific to the measurement type.',
    image: require('../assets/images/bloodpressure/step_05.jpg'),
  },
  {
    id: '7',
    title: 'Save Results',
    description:
      'Review and confirm the accuracy of the data, then tap "Save" to store it securely.',
    image: require('../assets/images/bloodpressure/step_06.jpg'),
  },
];

export const oxygernSaturationInstruction = [
  {
    id: '1',
    title: 'Begin Test',
    description:
      'Tap the "Start Test" button to initiate the measurement process.',
    image: require('../assets/images/step_0.jpeg'),
  },
  {
    id: '2',
    title: 'Connect to Device',
    description:
      'Ensure Bluetooth is enabled. Find and select your device from the list. Wait for connection confirmation.',
    image: require('../assets/images/step_1_mintti.jpg'),
  },
  {
    id: '3',
    title: 'Finger Placement',
    description:
      'Gently place the index finger (regardless of left and right hands) on the heart rate sensor on the device.',
    image: require('../assets/images/oxygen/step_02.png'),
  },
  {
    id: '5',
    title: 'Start Measurement',
    description:
      'Follow the on-screen instructions specific to the measurement type.',
    image: require('../assets/images/oxygen/step_03.jpg'),
  },
  {
    id: '6',
    title: 'Save Results',
    description:
      'Review and confirm the accuracy of the data, then tap "Save" to store it securely.',
    image: require('../assets/images/oxygen/step_04.jpg'),
  },
];

export const ECGInstructions = [
  {
    id: '1',
    title: 'Begin Test',
    description:
      'Tap the "Start Test" button to initiate the measurement process.',
    image: require('../assets/images/step_0.jpeg'),
  },
  {
    id: '2',
    title: 'Connect to Device',
    description:
      'Ensure Bluetooth is enabled. Find and select your device from the list. Wait for connection confirmation.',
    image: require('../assets/images/step_1_mintti.jpg'),
  },
  {
    id: '3',
    title: 'Place the Equipment',
    description:
      'Place the thumb of the left hand on the heart rate sensor, then put the fingers of the right hand (the number of fingers is not limited) on the iron plate on the back.',
    image: require('../assets/images/ecg/step_03.png'),
  },
  {
    id: '4',
    title: 'Start Measurement',
    description:
      'Follow the on-screen instructions specific to the measurement type.',
    image: require('../assets/images/ecg/step_04.jpg'),
  },
  {
    id: '5',
    title: 'Save Results',
    description:
      'Review and confirm the accuracy of the data, then tap "Save" to store it securely.',
    image: require('../assets/images/ecg/step_05.jpg'),
  },
];

export const SmarthoInstruction = [
  {
    id: '1',
    title: 'Begin Test',
    description:
      'Tap the "Start Test" button to initiate the measurement process.',
    image: require('../assets/images/step_0.jpeg'),
  },
  {
    id: '2',
    title: 'Connect to Device',
    description:
      'Ensure Bluetooth is enabled. Find and select your device from the list. Wait for connection confirmation.',
    image: require('../assets/images/step_1.png'),
  },
  {
    id: '3',
    title: 'Start Measurement',
    description:
      'Follow the on-screen instructions specific to the measurement type.',
    image: require('../assets/images/step_2.jpeg'),
  },
  {
    id: '4',
    title: 'Save Results',
    description:
      'Review and confirm the accuracy of the data, then tap "Save" to store it securely.',
    image: require('../assets/images/step_3.jpeg'),
  },
];

export type TTemperatureInstruction = typeof TemperatureInstruction;
