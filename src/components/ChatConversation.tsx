import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Pressable,
  TextInput,
  View,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import * as Progress from 'react-native-progress';
import globalStyles from '../styles/style';
import CustomTextRegular from './ui/CustomTextRegular';
import CustomTextSemiBold from './ui/CustomTextSemiBold';

import {
  ChatClient,
  ChatConversationType,
  ChatError,
  ChatFileMessageBody,
  ChatImageMessageBody,
  ChatMessage,
  ChatMessageBody,
  ChatMessageChatType,
  ChatMessageType,
  ChatOptions,
  ChatSearchDirection,
  ChatTextMessageBody,
} from 'react-native-agora-chat';
import useGetChatTokens from '../api/query/useGetChatToken';
import {Doctor} from '../api/schema/Appointment';
import {agoraChatConfig} from '../constant/agoraConfig';
import saveImage from '../utils/SaveImage';
import {BASE_IMG_URL} from '../utils/config';
import {useChatStatus} from '../utils/store/useChatStatus';
import {useSignInStore} from '../utils/store/useSignInStore';
import {timeSinceWithTime} from '../utils/timeFunctions';
import Error from './ui/Error';
import Loader from './ui/Loader';

const dimensions = Dimensions.get('window');

interface ChatConversationProps {
  goback: () => void;
  doctor: Doctor;
}

export default function ChatConversation({
  goback,
  doctor,
}: ChatConversationProps) {
  const chatClient = useMemo(() => ChatClient.getInstance(), []);
  const chatManager = useMemo(() => chatClient.chatManager, []);
  const {isLoggedIn, isInitialized, setIsLoggedIn, setIsInitialized} =
    useChatStatus();
  const [ImageProgress, setImageProgress] = useState<number | null>(null);
  const [fileProgress, setFileProgress] = useState<number | null>(null);
  const [converstion, setConversation] = useState<ChatMessage[]>([]);
  const textMessage = useRef('');
  const flatListRef = useRef<FlatList | null>(null);
  const textInputRef = useRef<TextInput | null>(null);
  const {userData} = useSignInStore();
  const [error, setError] = useState('');
  const {data, isLoading, isError, isSuccess} = useGetChatTokens(userData?.Id!);

  // Adding event listener for messages
  useEffect(() => {
    const setMessageListener = () => {
      chatManager.removeAllMessageListener();

      chatManager.addMessageListener({
        onMessagesReceived: messages => {
          console.log('Recieved a new message: ', messages);
          setConversation(prev => [...prev, ...messages]);
          flatListRef?.current?.scrollToEnd({animated: true});
        },
        onMessagesRead: messages => console.log('Message Read: ', messages),
        onMessagesDelivered: messages =>
          console.log('Message Deliverd: ', messages),
        onConversationsUpdate: () => console.log('conversation update: '),
      });
    };

    // Initialize the sdk
    const init = async () => {
      if (isInitialized) return;
      const conn = new ChatOptions({
        autoLogin: false,
        appKey: agoraChatConfig.APP_KEY,
      });

      chatClient.removeAllConnectionListener();

      try {
        await chatClient.init(conn);
        setIsInitialized(true);

        chatClient.addConnectionListener({
          onTokenWillExpire: () => console.log('Toke will soon expire'),
          onTokenDidExpire: () => console.log('Toke expired'),
          onConnected: () => setMessageListener(),
          onDisconnected: () => console.log('Disconnected from server'),
        });

        await Login();
      } catch (error) {
        console.log('Something went wrong');
        setError('Something went wrong.');
      }
    };

    if (isSuccess) init();
  }, [chatClient, chatManager, isSuccess]);

  useEffect(() => {
    if (isInitialized && isLoggedIn && !converstion.length) getConversation();
  }, []);

  async function Login() {
    if (isLoggedIn) return;
    try {
      if (userData?.Id && data?.userToken) {
        await chatClient.loginWithAgoraToken(userData?.Id!, data?.userToken!);
        setIsLoggedIn(true);
        await getConversationFormServer();
        await getConversation();
      }
    } catch (error) {
      console.log('Failed to login', error);
      setError('Something went wrong while logging in.');
    }
  }

  async function getConversation() {
    const conversation = await chatManager.getConversation(
      doctor.UserId,
      ChatConversationType.PeerChat,
    );
    const messages = await conversation?.getMessages(
      '',
      ChatSearchDirection.UP,
      20,
    );

    if (messages) {
      setConversation(prev => [...prev, ...messages]);
    }
  }

  async function getConversationFormServer() {
    try {
      const conversation = await chatManager.fetchHistoryMessages(
        doctor.UserId,
        ChatConversationType.PeerChat,
        {
          startMsgId: '',
          pageSize: 20,
          direction: ChatSearchDirection.UP,
        },
      );

      if (conversation?.list) {
        const messages = conversation?.list;
        // setConversation(prev => [...prev, ...messages]);
      }
    } catch (error) {
      console.log('Something went wrong: get conver for server', error);
    }
  }

  async function Logout() {
    if (isInitialized) {
      try {
        await chatClient.logout();
        console.log('logged in successfully....');
      } catch (error) {
        console.log('Logged out successfully....');
      }
    }
  }

  async function sendTextMessage() {
    if (isInitialized && textMessage.current) {
      const message = ChatMessage.createTextMessage(
        doctor.UserId,
        textMessage.current,
        ChatMessageChatType.PeerChat,
      );

      await chatClient.chatManager.sendMessage(
        message,
        new (class {
          onProgress(locaMsgId: string, progress: number) {
            console.log('Progress', {locaMsgId, progress});
          }
          onError(locaMsgId: string, error: ChatError) {
            console.log('Error', {locaMsgId, error});
          }
          onSuccess(message: ChatMessage) {
            setConversation(prev => [...prev, message]);
            textMessage.current = '';
            textInputRef.current?.clear();
          }
        })(),
      );
    }
  }

  async function sendImageMessage() {
    try {
      const image = await DocumentPicker.pickSingle({
        type: DocumentPicker.types.images,
        copyTo: 'documentDirectory',
      });
      console.log("Image form picker: ", image)
      if (isInitialized && image?.uri && image.size) {
        const message = ChatMessage.createImageMessage(
          doctor.UserId,
          image.fileCopyUri ?? image.uri,
          ChatMessageChatType.PeerChat,
          {
            displayName: 'image',
            width: image?.size,
            height: image?.size,
          },
        );

        await chatClient.chatManager.sendMessage(
          message,
          new (class {
            onProgress(locaMsgId: string, progress: number) {
              setImageProgress(progress);
              console.log('Progress', {locaMsgId, progress});
            }
            onError(locaMsgId: string, error: ChatError) {
              console.log('Error', {locaMsgId, error});
            }
            onSuccess(message: ChatMessage) {
              setImageProgress(null);
              setConversation(prev => [...prev, message]);
            }
          })(),
        );
      }
    } catch (error) {
      console.log("Error in sending image....")
    }
  }

  async function sendFileMessage() {
    try {
      const document = await DocumentPicker.pickSingle({
        type: [
          DocumentPicker.types.docx,
          DocumentPicker.types.doc,
          DocumentPicker.types.pdf,
          DocumentPicker.types.xls,
          DocumentPicker.types.xlsx,
        ],
        copyTo: 'documentDirectory',
      });

      if (isInitialized && document.fileCopyUri && document.size) {
        const message = ChatMessage.createFileMessage(
          doctor.UserId,
          document.fileCopyUri,
          ChatMessageChatType.PeerChat,
          {
            displayName: document.name ? document.name : '',
            fileSize: document.size,
          },
        );

        await chatClient.chatManager.sendMessage(
          message,
          new (class {
            onProgress(locaMsgId: string, progress: number) {
              setFileProgress(progress);
              console.log('Progress', {locaMsgId, progress});
            }
            onError(locaMsgId: string, error: ChatError) {
              console.log('Error', {locaMsgId, error});
            }
            onSuccess(message: ChatMessage) {
              setFileProgress(null);
              setConversation(prev => [...prev, message]);
            }
          })(),
        );
      }
    } catch (error) {}
  }

  if (isError || error) return <Error />;

  if (isLoading || !isInitialized || !isLoggedIn) return <Loader size={50} />;

  return (
    <View className="relative flex-1 w-full">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2">
        <Pressable
          onPress={() => goback()}
          className="flex items-center justify-center w-10 h-10 -ml-4">
          <Image
            className="w-5 h-5"
            source={require('../assets/icons/chevron-left.png')}
            alt="go back"
          />
        </Pressable>
        <Image
          source={{uri: BASE_IMG_URL + doctor.ProfileImg}}
          alt={`${doctor.Firstname} ${doctor.Lastname}`}
          className="w-10 h-10 rounded-full"
          style={{objectFit: 'cover'}}
        />
        <View className="flex justify-start flex-1 ml-2">
          <CustomTextSemiBold className="text-text">
            {`${doctor.Firstname} ${doctor.Lastname}`}
          </CustomTextSemiBold>
          <CustomTextSemiBold className="mt-[0.5] text-xs text-primary">
            Online
          </CustomTextSemiBold>
        </View>
      </View>

      {/* Conversation Container */}
      <FlatList
        ref={flatListRef}
        style={{maxHeight: '85%'}}
        showsVerticalScrollIndicator={false}
        data={converstion}
        keyExtractor={item => item.msgId}
        renderItem={({item}) => <SingleMessage item={item} doctor={doctor} />}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({animated: true})
        }
      />

      {/* Input Feids */}

      <KeyboardAvoidingView>
        <View className="flex-row items-center">
          <Pressable
            disabled={fileProgress !== null}
            onPress={() => sendFileMessage()}
            className={`${
              fileProgress !== null ? 'p-1.5' : 'p-2'
            } mt-4 mr-2 rounded-xl bg-primmary`}>
            {fileProgress !== null ? (
              <Progress.Circle
                progress={fileProgress / 100}
                size={25}
                color="white"
              />
            ) : (
              <Image
                className="w-5 h-5"
                source={require('../assets/icons/paperclip.png')}
                alt="add attachment"
              />
            )}
          </Pressable>
          <TextInput
            style={globalStyles.fontRegular}
            onChangeText={value => (textMessage.current = value)}
            ref={textInputRef}
            keyboardType="default"
            placeholder="Type your message here..."
            className="flex-1 h-12 px-4 py-1 mt-4 border border-gray-200 rounded-full text-text"
          />
          <Pressable
            onPress={() => sendTextMessage()}
            className="p-2 mt-4 ml-2 rounded-xl bg-primmary">
            <Image
              className="w-5 h-5"
              source={require('../assets/icons/send.png')}
              alt="add images"
            />
          </Pressable>
          <Pressable
            onPress={() => sendImageMessage()}
            disabled={ImageProgress !== null}
            className={`${
              ImageProgress !== null ? 'p-1.5' : 'p-2'
            } mt-4 ml-2 rounded-xl bg-primmary`}>
            {ImageProgress !== null ? (
              <Progress.Circle
                progress={ImageProgress / 100}
                size={25}
                color="white"
              />
            ) : (
              <Image
                className="w-5 h-5"
                source={require('../assets/icons/image-plus.png')}
                alt="add images"
              />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function MessageBodyRender(messageBody: ChatMessageBody) {
  const [hideLargeText, setHideLargeText] = useState(true);

  if (messageBody.type === ChatMessageType.TXT) {
    const textMessageBody = messageBody as ChatTextMessageBody;

    return textMessageBody.content.length > 100 ? (
      <View className="px-3 py-2">
        <CustomTextRegular className="mb-5 text-white">
          {hideLargeText
            ? textMessageBody.content.substring(0, 100)
            : textMessageBody.content}
        </CustomTextRegular>
        <Pressable
          className="absolute bottom-0 left-0 p-2"
          onPress={() => setHideLargeText(!hideLargeText)}>
          <CustomTextSemiBold className="text-white">
            {hideLargeText ? 'More...' : 'Less...'}
          </CustomTextSemiBold>
        </Pressable>
      </View>
    ) : (
      <CustomTextRegular className="px-3 py-2 text-white">
        {textMessageBody.content}
      </CustomTextRegular>
    );
  } else if (messageBody.type === ChatMessageType.IMAGE) {
    const imageMessageBody = messageBody as ChatImageMessageBody;
    return (
      <View className="p-[2px] overflow-hidden rounded-xl relative">
        {imageMessageBody.remotePath ? (
          <>
            <Pressable
              className="absolute z-10 p-2 bg-white top-2 right-2 rounded-xl"
              onPress={() =>
                saveImage(
                  imageMessageBody.remotePath,
                  imageMessageBody.displayName,
                )
              }>
              <Image
                source={require('../assets/icons/download.png')}
                alt="donwload"
                className="w-5 h-5"
              />
            </Pressable>
            <Image
              className="rounded-xl"
              source={{uri: imageMessageBody.remotePath}}
              alt={imageMessageBody.displayName}
              width={dimensions.width * 0.5}
              height={dimensions.height * 0.5}
            />
          </>
        ) : (
          <View className='flex-row items-center p-2'>
            <Image
              className="w-5 h-5 rounded-xl"
              source={require('../assets/icons/image-off.png')}
              alt={imageMessageBody.displayName}
            />
            <CustomTextSemiBold className='ml-2 text-white'>Damaged Image</CustomTextSemiBold>
          </View>
        )}
      </View>
    );
  } else if (messageBody.type === ChatMessageType.FILE) {
    const fileMessageBody = messageBody as ChatFileMessageBody;
    return (
      <View className="relative flex-row items-center px-3 py-2 rounded-xl">
        <Pressable
          className="p-1 bg-white rounded"
          onPress={() =>
            saveImage(fileMessageBody.remotePath, fileMessageBody.displayName)
          }>
          <Image
            source={require('../assets/icons/download.png')}
            alt="donwload"
            className="w-4 h-4"
          />
        </Pressable>
        <CustomTextRegular className="ml-2 text-white">
          {fileMessageBody.displayName.length > 20
            ? fileMessageBody.displayName.substring(0, 20) + '...'
            : fileMessageBody.displayName}
        </CustomTextRegular>
      </View>
    );
  }
}

function SingleMessage({item, doctor}: {item: ChatMessage; doctor: Doctor}) {
  const {userData} = useSignInStore();
  const hostMessage = item.from !== userData?.Id;

  return (
    <View className={`mt-4 ${hostMessage ? 'flex-row ' : 'flex-row-reverse'}`}>
      <Image
        className="w-10 h-10 bg-gray-600 rounded-full"
        style={{objectFit: 'cover'}}
        source={{
          uri: hostMessage
            ? `${BASE_IMG_URL}${doctor?.ProfileImg}`
            : `${BASE_IMG_URL}${userData.ProfileImg}`,
        }}
        alt={
          hostMessage
            ? `${doctor.Firstname} ${doctor.Lastname}`
            : `${userData?.Firstname} ${userData?.Lastname}`
        }
      />
      <View className={hostMessage ? 'ml-3' : 'mr-3'}>
        <View
          style={{
            maxWidth: dimensions.width * 0.65,
          }}
          className={`rounded-xl ${
            hostMessage ? 'bg-blue-400' : 'bg-primmary'
          }`}>
          {MessageBodyRender(item.body)}
        </View>
        <CustomTextRegular
          className={`text-[10px] text-text mt-1 ${
            hostMessage ? 'text-left' : 'text-right'
          }`}>
          {timeSinceWithTime(item.localTime)}
        </CustomTextRegular>
      </View>
    </View>
  );
}
