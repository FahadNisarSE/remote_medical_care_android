import {useMutation} from '@tanstack/react-query';

export async function saveTestResult(data: {
  AppointmentTestId: string;
  VariableName: string[];
  VariableValue: string[];
}) {
  const {AppointmentTestId, VariableName, VariableValue} = data;

  try {
    const formData = new FormData();
    formData.append('AppointmentTestId', AppointmentTestId);

    VariableName.forEach((name, index) => {
      formData.append(`VariableName[${index}]`, name);
      formData.append(`VariableValue[${index}]`, VariableValue[index]);
    });

    let response = await fetch(
      'https://staging.remotemedtech.com/api/save_test_result',
      {
        method: 'POST',
        body: formData,
      },
    );

    const data = await response.json();

    if (data?.status === 200 || data?.status === 201 || data?.status === 204) {
      return 'Test result saved successfully.';
    } else {
      throw new Error('Oops! Something went wrong.');
    }
  } catch (error) {
    console.log('Error: ', error);
    throw error;
  }
}

export default function useSaveTestResults() {
  return useMutation({
    mutationKey: ['save_test_result'],
    mutationFn: saveTestResult,
  });
}
