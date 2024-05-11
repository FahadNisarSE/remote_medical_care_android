import {DrawerToggleButton} from '@react-navigation/drawer';
import {useIsFocused} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useCallback, useEffect, useRef, useState} from 'react';
import {
  Alert,
  AppState,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
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
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';

import {queryClient} from '../../App';
import useSaveDermatoScopeImages from '../api/action/useSaveDermatoScopeImages';
import Button from '../components/ui/Button';
import CustomTextRegular from '../components/ui/CustomTextRegular';
import CustomTextSemiBold from '../components/ui/CustomTextSemiBold';
import {meetingStyles} from '../styles/style';
import {HomeStackNavigatorParamList} from '../utils/AppNavigation';
import {useAppointmentDetailStore} from '../utils/store/useAppointmentDetailStore';

const {width, height} = Dimensions.get('window');

type DermatoScopeProps = NativeStackScreenProps<
  HomeStackNavigatorParamList,
  'DermatoScope'
>;

export default function DermatoScope({navigation, route}: DermatoScopeProps) {
  const {hasPermission, requestPermission} = useCameraPermission();
  const [allowedPermission, setAllowedPermission] = useState(hasPermission);
  const isFocused = useIsFocused();
  const isActive = isFocused && AppState.currentState === 'active';
  const cameraRef = useRef<Camera>(null);
  const [isInitalized, setIsInitalized] = useState(false);
  const [galleryImage, setGalleryImage] = useState<DocumentPickerResponse[]>(
    [],
  );
  const [cameraImage, setCameraImage] = useState<PhotoFile[]>([]);
  const {mutate, isPending} = useSaveDermatoScopeImages();
  const {appointmentDetail} = useAppointmentDetailStore();
  const [takingPhoto, setTakingPhoto] = useState(false);
  const [instructionModal, setInstructionModal] = useState(true);

  const device = useCameraDevice('back');

  const {appointmentTestId, testName} = route.params;

  async function requestCameraPermissions() {
    const result = await requestPermission();
    setAllowedPermission(result);
  }

  async function saveResult() {
    if (cameraImage.length + galleryImage.length > 3)
      Toast.show({
        type: 'error',
        text1: 'You can upload only 3 images.',
        text2: 'Please delete irrelevant images before saving test result.',
      });
    else if (galleryImage.length === 0 && cameraImage.length === 0)
      Toast.show({
        type: 'error',
        text1: 'Image not found.',
        text2: 'Please take or upload a image before saving.',
      });
    else {
      mutate(
        {
          galleryImage,
          cameraImage,
          appointmentTestId,
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
            setGalleryImage([]);
            setCameraImage([]);
            Toast.show({
              type: 'success',
              text1: 'Success in saving result.',
            });
            setGalleryImage([]);
            setCameraImage([]);
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
    }
  }

  async function takePhoto() {
    try {
      if (galleryImage.length + cameraImage.length === 3) {
        Alert.alert(
          'Max 3 image',
          'You can upload maximum 3 images. Please delete previous before taking new one.',
        );

        return;
      }

      setTakingPhoto(true);
      const photo = await cameraRef.current?.takePhoto({
        qualityPrioritization: 'balanced',
        enableAutoStabilization: true,
        flash: 'auto',
        enableShutterSound: true,
        enableAutoDistortionCorrection: true,
      });
      setTakingPhoto(false);

      if (photo) setCameraImage(prev => [...prev, photo]);
    } catch (error) {
      setTakingPhoto(false);
    }
  }

  async function pickImage(limit: number) {
    if (galleryImage.length + cameraImage.length === 3) {
      Alert.alert(
        'Max 3 image',
        'You can upload maximum 3 images. Please delete previous before taking new one.',
      );

      return;
    }
    try {
      const images = await DocumentPicker.pick({
        type: DocumentPicker.types.images,
        copyTo: 'documentDirectory',
        presentationStyle: 'formSheet',
        transitionStyle: 'coverVertical',
        allowMultiSelection: true,
      });

      if (!(images.length <= 3 - limit)) {
        Alert.alert(
          'Max 3 image',
          'You can upload maximum 3 images. Please delete previous before taking new one.',
        );

        return;
      }

      setGalleryImage(prev => {
        if (images && images.length !== 0) {
          return [...prev, ...images];
        } else {
          return prev;
        }
      });
    } catch (error) {
      setGalleryImage([]);
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

  const ImageDisplay = useCallback(() => {
    return (
      <View className="flex-1 w-full">
        <ScrollView
          scrollEnabled
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-1 w-full p-0.5">
          {galleryImage?.map((image, index) => (
            <View
              style={{width: width * 0.25, height: width * 0.3}}
              className="relative ml-2 bg-gray-400 rounded"
              key={image.uri ?? 'gallery' + index}>
              <Image
                source={{uri: image.uri}}
                alt="Gallery Image"
                className="w-full h-full rounded-lg"
                style={{objectFit: 'contain'}}
              />
              <TouchableOpacity
                onPress={() =>
                  setGalleryImage(prev => prev.filter((_, i) => i !== index))
                }
                className="absolute p-2 bg-gray-700 rounded bottom-1 right-1">
                <Image
                  source={require('../assets/icons/trash.png')}
                  alt="delete image"
                  className="w-4 h-4"
                />
              </TouchableOpacity>
            </View>
          ))}
          {cameraImage?.map((image, index) => (
            <View
              style={{width: width * 0.25, height: width * 0.3}}
              className="relative ml-2 bg-gray-400 rounded"
              key={image.path + index}>
              <Image
                source={{uri: `file://${image.path}`}}
                alt="Gallery Image"
                className="w-full h-full rounded-lg"
                style={{objectFit: 'cover'}}
              />
              <TouchableOpacity
                onPress={() =>
                  setCameraImage(prev => prev.filter((_, i) => i !== index))
                }
                className="absolute p-2 bg-gray-700 rounded bottom-1 right-1">
                <Image
                  source={require('../assets/icons/trash.png')}
                  alt="delete image"
                  className="w-4 h-4"
                />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }, [cameraImage, galleryImage, cameraImage.length, galleryImage.length]);

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
          Toast.show({
            type: 'error',
            text1: "Couldn't access camera",
            text2: error.message,
          });

          console.log('first', error);
        }}
        onInitialized={() => setIsInitalized(true)}
        ref={cameraRef}
        photo={true}
        isActive={isActive}
      />
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
            {!isInitalized
              ? 'Three was an error while starting camera'
              : !hasPermission
              ? 'Please allow camera permissions for camera to work'
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
          disabled={takingPhoto || isPending}
          onPress={() => pickImage(galleryImage.length + cameraImage.length)}
          className="p-2 py-3 ml-2 rounded-lg bg-primmary">
          <Image
            source={require('../assets/icons/images.png')}
            alt="open gallery"
            className="w-5 h-5"
          />
        </Pressable>
      </View>

      <ImageDisplay />

      {/* Save Test Result */}
      <View className="flex-row items-center mt-auto mb-4">
        <Button
          disabled={isPending}
          text={isPending ? 'Saving...' : 'Save Result'}
          onPress={() => saveResult()}
          className="flex-1"
        />
      </View>

      {/* MODAL HERE */}
      <Modal
        visible={instructionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setInstructionModal(false)}>
        <Pressable
          onPress={() => setInstructionModal(false)}
          className="w-full h-full bg-black opacity-50"></Pressable>
        <View
          style={{
            ...meetingStyles.modal,
            backgroundColor: 'white',
            height: useWindowDimensions().height * 0.4,
          }}
          className="p-4 bg-slate-100">
          <View className="flex-1 w-full">
            <View className="flex-row items-center justify-center m6-4">
              <Image
                source={require('../assets/icons/dermatology_lens.png')}
                alt="Dermatology lens"
                className="w-8 h-8"
              />
              <CustomTextSemiBold className="ml-2 text-xl text-text">
                DermatoScope
              </CustomTextSemiBold>
            </View>
            <CustomTextRegular
              className="my-auto mx-4 text-[14px] text-text text-center"
              style={{lineHeight: 20}}>
              To use the dermatoscope, first, attach the dermatoscope lens to
              your mobile phone's rear (primary) camera. Then, connect the
              dermatoscope's USB cable to your mobile phone. You are all set to
              use dermatoscope, press below button to get started.
            </CustomTextRegular>
            <Pressable
              onPress={() => setInstructionModal(false)}
              className="flex-row items-center p-2 px-4 mx-auto mt-4 rounded-lg bg-primmary">
              <CustomTextSemiBold className="mx-auto text-lg text-white">
                Get Started
              </CustomTextSemiBold>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
