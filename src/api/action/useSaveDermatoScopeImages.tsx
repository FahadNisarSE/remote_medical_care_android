import {useMutation} from '@tanstack/react-query';
import {DocumentPickerResponse} from 'react-native-document-picker';
import {PhotoFile} from 'react-native-vision-camera';

const variableName = 'DermatoScope';

async function saveDeramtoScopeImage(data: {
  galleryImage: DocumentPickerResponse[];
  cameraImage: PhotoFile[];
  appointmentTestId: string;
}) {
  try {
    const {galleryImage, cameraImage, appointmentTestId} = data;

    const formData = new FormData();
    formData.append('AppointmentTestId', String(appointmentTestId));

    for (let i = 0; i < galleryImage.length; i++) {
      const gallery_image = galleryImage[i];
      formData.append(`VariableName[${i}]`, variableName);
      formData.append(`VariableValue[${i}]`, {
        uri: gallery_image.uri,
        name: gallery_image.fileCopyUri ?? gallery_image.uri,
        type: gallery_image.type,
      });
    }

    for (let i = 0; i < cameraImage.length; i++) {
      const camera_image = cameraImage[i];
      formData.append(`VariableName[${i + galleryImage.length}]`, variableName);
      formData.append(`VariableValue[${i + galleryImage.length}]`, {
        uri: 'file://' + camera_image.path,
        name: 'camera_image' + appointmentTestId + i,
        type: 'type/heci',
      });
    }

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
    } else throw new Error(responseData.message);
  } catch (error) {
    console.log('error in uploading: ', error);
    throw error;
  }
}

const useSaveDermatoScopeImages = () => {
  return useMutation({
    mutationKey: ['save_dermatoscope_result'],
    mutationFn: saveDeramtoScopeImage,
  });
};

export default useSaveDermatoScopeImages;
