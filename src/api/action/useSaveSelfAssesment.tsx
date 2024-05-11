import {useMutation} from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

async function saveSelfAssessment(data: {
  imageUri: string;
  filename: string;
  type: string;
  appointmentTestId: string;
}) {
  const {imageUri, filename, type, appointmentTestId} = data;

  const formData = new FormData();
  formData.append('AppointmentTestId', String(appointmentTestId));
  formData.append('VariableName[0]', 'Self Assessment');
  formData.append('VariableValue[0]', {
    uri: imageUri,
    name: filename,
    type: type,
  });

  const response = await fetch(
    'https://staging.remotemedtech.com/api/save_test_result',
    {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data;',
      },
    },
  );

  const responseData = await response.json();

  if (
    responseData?.status === 200 ||
    responseData?.status === 201 ||
    responseData?.status === 204
  ) {
    return responseData;
  } else throw new Error('Something went wrong...');
}

const useSaveSelfAssessment = () => {
  return useMutation({
    mutationKey: ['save_self_assesment'],
    mutationFn: saveSelfAssessment,
  });
};

export default useSaveSelfAssessment;
