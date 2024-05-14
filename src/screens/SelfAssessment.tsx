import {DrawerToggleButton} from '@react-navigation/drawer';
import {useIsFocused} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEffect, useRef, useState} from 'react';
import {
  AppState,
  Dimensions,
  Image,
  Pressable,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import DocumentPicker, {
  DocumentPickerResponse,
} from 'react-native-document-picker';
import Toast from 'react-native-toast-message';
import {
  Camera,
  PhotoFile,
  getCameraDevice,
  useCameraDevice,
  useCameraDevices,
  useCameraPermission,
} from 'react-native-vision-camera';

import {queryClient} from '../../App';
import useSaveSelfAssessment from '../api/action/useSaveSelfAssesment';
import Button from '../components/ui/Button';
import CustomTextRegular from '../components/ui/CustomTextRegular';
import CustomTextSemiBold from '../components/ui/CustomTextSemiBold';
import {HomeStackNavigatorParamList} from '../utils/AppNavigation';
import {useAppointmentDetailStore} from '../utils/store/useAppointmentDetailStore';

const {width, height} = Dimensions.get('window');

type TakePhotosProps = NativeStackScreenProps<
  HomeStackNavigatorParamList,
  'SelfAssessment'
>;

export default function SelfAssessment({navigation, route}: TakePhotosProps) {
  const {hasPermission, requestPermission} = useCameraPermission();
  const [allowedPermission, setAllowedPermission] = useState(hasPermission);
  const isFocused = useIsFocused();
  const isActive = isFocused && AppState.currentState === 'active';
  const [isInitalized, setIsInitalized] = useState(false);
  const [galleryImage, setGalleryImage] =
    useState<DocumentPickerResponse | null>(null);
  const [cameraImage, setCameraImage] = useState<PhotoFile | undefined>();
  const {mutate, isPending} = useSaveSelfAssessment();
  const devices = useRef(Camera.getAvailableCameraDevices());
  const [device, setDevice] = useState(
    getCameraDevice(devices.current, 'back'),
  );
  const [takingPhoto, setTakingPhoto] = useState(false);

  const {appointmentDetail} = useAppointmentDetailStore();
  const cameraRef = useRef<Camera>(null);
  const errorRef = useRef('');

  const {appointmentTestId, testName} = route.params;

  async function requestCameraPermissions() {
    const result = await requestPermission();
    setAllowedPermission(result);
    devices.current = Camera.getAvailableCameraDevices();
    setDevice(getCameraDevice(devices.current, 'back'));
  }

  async function saveResult() {
    if (cameraImage && galleryImage)
      Toast.show({
        type: 'error',
        text1: 'You can upload only one image.',
        text2: 'Please delete irrelevant images before saving test result.',
      });
    else if (cameraImage) {
      mutate(
        {
          appointmentTestId,
          imageUri: `file://${cameraImage.path}`,
          filename: `self_assement_${appointmentTestId}`,
          type: 'image/jpeg',
        },
        {
          onError: () => {
            Toast.show({
              type: 'error',
              text1: 'Error While saving image.',
              text2: 'Something went wrong while saving test result..',
            });
          },
          onSuccess: () => {
            Toast.show({
              type: 'success',
              text1: 'Success in saving result.',
            });
            setGalleryImage(null);
            setCameraImage(undefined);
            queryClient.invalidateQueries({
              queryKey: [
                `get_appointment_details_${appointmentDetail?.AppointmentId}`,
              ],
            });
            navigation.navigate('AppointmentDetail', {
              id: appointmentDetail?.AppointmentId!,
            });
          },
        },
      );
    } else if (galleryImage)
      mutate(
        {
          appointmentTestId,
          imageUri: galleryImage.fileCopyUri ?? galleryImage.uri,
          filename: galleryImage.name || `self_assement_${appointmentTestId}`,
          type: galleryImage?.type || 'image/jpeg',
        },
        {
          onError: () => {
            Toast.show({
              type: 'error',
              text1: 'Error While saving image.',
              text2: 'Something went wrong while saving test result..',
            });
          },
          onSuccess: () => {
            setGalleryImage(null);
            setCameraImage(undefined);
            Toast.show({
              type: 'success',
              text1: 'Success in saving result.',
            });
            queryClient.invalidateQueries({
              queryKey: [
                `get_appointment_details_${appointmentDetail?.AppointmentId}`,
              ],
            });
            navigation.navigate('AppointmentDetail', {
              id: appointmentDetail?.AppointmentId!,
            });
          },
        },
      );
    else
      Toast.show({
        type: 'error',
        text1: 'Image not found.',
        text2: 'Please take or upload a image before saving.',
      });
  }

  async function takePhoto() {
    try {
      setTakingPhoto(true);
      const photo = await cameraRef.current?.takePhoto({
        qualityPrioritization: 'balanced',
        enableAutoStabilization: true,
        flash: 'auto',
        enableShutterSound: true,
        enableAutoDistortionCorrection: true,
      });
      setTakingPhoto(false);

      setCameraImage(photo);
    } catch (error) {
      setTakingPhoto(false);
      setCameraImage(undefined);
    }
  }

  async function pickImage() {
    try {
      const image = await DocumentPicker.pickSingle({
        type: DocumentPicker.types.images,
        copyTo: 'documentDirectory',
        presentationStyle: 'formSheet',
        transitionStyle: 'coverVertical',
        allowMultiSelection: false,
      });
      setGalleryImage(image);
    } catch (error) {
      setGalleryImage(null);
    }
  }

  useEffect(() => {
    if (!hasPermission) requestCameraPermissions();
    else setAllowedPermission(true);
  }, [hasPermission]);

  if (device === null) {
    <View className="items-center justify-center flex-1">
      <Image
        source={require('../assets/images/error.png')}
        className="w-40 h-40"
        resizeMode="contain"
        alt="Something went wrong."
      />
      <CustomTextSemiBold className="mt-2 text-base text-center text-text">
        Whoops! No camera was found on this device.
      </CustomTextSemiBold>
    </View>;
  }

  return (
    <View className="flex-1 mx-5">
      <View className="flex-row items-center py-4">
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Image
            source={require('../assets/icons/chevron-left.png')}
            alt="Go back"
            className="w-5 h-5"
          />
        </TouchableOpacity>
        <View className="px-4">
          <CustomTextSemiBold
            className="mx-auto text-lg text-center text-text"
            style={{width: useWindowDimensions().width * 0.6}}>
            {testName}
          </CustomTextSemiBold>
        </View>
        <DrawerToggleButton />
      </View>
      {(hasPermission || allowedPermission) && (
        <Camera
          className="my-4"
          style={{
            width: width * 0.9,
            height: height * 0.5,
            display:
              isInitalized && (hasPermission || allowedPermission)
                ? 'flex'
                : 'none',
          }}
          device={device!}
          onError={error => {
            if (
              error.code === 'session/camera-cannot-be-opened' ||
              (error.name === 'session/camera-cannot-be-opened' &&
                !errorRef.current)
            ) {
              errorRef.current = error.code;
              devices.current = Camera.getAvailableCameraDevices();
              setDevice(getCameraDevice(devices.current, 'front'));
              setTimeout(
                () => setDevice(getCameraDevice(devices.current, 'back')),
                1000,
              );
            } else {
              Toast.show({
                type: 'error',
                text1: "Couldn't access camera",
                text2: error.message,
              });
            }
          }}
          onInitialized={() => setIsInitalized(true)}
          ref={cameraRef}
          photo={true}
          isActive={
            navigation.getState().routes[navigation.getState().index].name ===
              'SelfAssessment' && isActive
          }
        />
      )}
      {(!isInitalized || !hasPermission || !allowedPermission) && (
        <View
          className="items-center justify-center flex-1 mx-auto my-4 rounded-lg bg-slate-800"
          style={{width: width * 0.7, height: height * 0.6}}>
          <Image
            className="w-40 h-40"
            resizeMode="contain"
            source={require('../assets/images/error.png')}
            alt="No Appointment to show"
          />
          <CustomTextRegular
            style={{width: width * 0.6}}
            className="mx-auto mt-2 text-base text-center text-white">
            {!hasPermission
              ? 'Please allow camera permissions for camera to work.'
              : !isInitalized
              ? 'Three was an error while starting camera.'
              : 'Whoops! Something went wrong.'}
          </CustomTextRegular>
        </View>
      )}

      {/* Take image or upload one */}
      <View className="flex-row items-center mb-4">
        <Button
          disabled={!isInitalized || takingPhoto || isPending}
          text={
            isInitalized
              ? takingPhoto
                ? 'Capturing Photo'
                : 'Take Photo'
              : 'Loading...'
          }
          onPress={takePhoto}
          className="flex-1"
        />
        <Pressable
          disabled={takingPhoto}
          onPress={() => pickImage()}
          className="p-2 py-3 ml-2 rounded-lg bg-primmary">
          <Image
            source={require('../assets/icons/images.png')}
            alt="open gallery"
            className="w-5 h-5"
          />
        </Pressable>
      </View>

      {/* Image display */}
      <View className="flex-row items-center flex-1 mb-4">
        {galleryImage ? (
          <View
            className="relative w-1/3 h-full"
            style={{maxHeight: height * 0.3}}>
            <Image
              source={{uri: galleryImage.uri}}
              alt="Gallery Image"
              className="w-full h-full rounded-lg"
              style={{objectFit: 'cover'}}
            />
            <TouchableOpacity
              onPress={() => setGalleryImage(null)}
              className="absolute bottom-1 right-1">
              <Image
                source={require('../assets/icons/trash.png')}
                alt="delete image"
              />
            </TouchableOpacity>
          </View>
        ) : (
          <></>
        )}
        {cameraImage ? (
          <View
            className="relative w-1/3 h-full ml-3"
            style={{maxHeight: height * 0.3}}>
            <Image
              source={{uri: `file://${cameraImage?.path}`}}
              alt="Gallery Image"
              className="w-full h-full rounded-lg"
              style={{objectFit: 'cover'}}
            />
            <TouchableOpacity
              onPress={() => setCameraImage(undefined)}
              className="absolute bottom-1 right-1">
              <Image
                source={require('../assets/icons/trash.png')}
                alt="delete image"
              />
            </TouchableOpacity>
          </View>
        ) : (
          <></>
        )}
      </View>

      {/* Save Test Result */}
      <View className="flex-row items-center mt-auto mb-4">
        <Button
          disabled={isPending}
          text={isPending ? 'Saving...' : 'Save Result'}
          onPress={() => saveResult()}
          className="flex-1"
        />
      </View>
    </View>
  );
}
