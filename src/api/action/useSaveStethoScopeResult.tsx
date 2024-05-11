import {useMutation} from '@tanstack/react-query';

type StethoScopeResult = {
  video?: {
    uri: string;
    filename: string;
    type: string;
  };
  audio: {
    uri: string;
    filename: string;
    type: string;
  };
  appointmentTestId: string;
  VariableName: string[];
  VariableValue: string[];
};

const saveStethoScopeResult = async (data: StethoScopeResult) => {
  const {video, audio, appointmentTestId, VariableName, VariableValue} = data;

  try {
    const formData = new FormData();
    formData.append('AppointmentTestId', appointmentTestId);

    VariableName.forEach((name, index) => {
      formData.append(`VariableName[${index}]`, name);
      formData.append(`VariableValue[${index}]`, VariableValue[index]);
    });

    formData.append(
      `VariableName[${VariableName.length}]`,
      'StethoScope Audio',
    );
    formData.append(`VariableValue[${VariableName.length}]`, {
      uri: audio.uri,
      name: audio?.filename,
      type: audio?.type,
    });

    formData.append(
      `VariableName[${VariableName.length + 1}]`,
      'Patient Video',
    );
    formData.append(`VariableValue[${VariableName.length + 1}]`, {
      uri: video?.uri,
      name: video?.filename,
      type: video?.type,
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
      responseData?.status === 201 ||
      responseData?.status === 204 ||
      responseData?.status === 200
    ) {
      return responseData.message;
    } else {
      console.log('Response Data: ', response);
      throw new Error(responseData.message);
    }
  } catch (error) {
    console.log('Error: ', error);
    throw error;
  }
};

const useSaveStethoScopeResult = () => {
  return useMutation({
    mutationKey: ['save_stetho_scope_result'],
    mutationFn: saveStethoScopeResult,
  });
};

export default useSaveStethoScopeResult;
