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

export type TSmarthoInstuction = typeof SmarthoInstruction;