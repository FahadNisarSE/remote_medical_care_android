import {Dimensions, StyleSheet} from 'react-native';

const dimensions = Dimensions.get('window');

const globalStyles = StyleSheet.create({
  fontRegular: {
    fontFamily: 'Inter-Regular',
  },
  fontSemiBold: {
    fontFamily: 'Inter-SemiBold',
  },
  fontBold: {
    fontFamily: 'Inter-Bold',
  },
  fontMedium: {
    fontFamily: 'Inter-Medium',
  },
  fontThin: {
    fontFamily: 'Inter-Thin',
  },
  shadow: {
    shadowColor: '#fffff',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 1,
  },
});

export const meetingStyles = StyleSheet.create({
  selfVideoContainer: {},
  selfVideoContainerFloat: {
    elevation: 20,
    zIndex: 20,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 90,
    right: 5,
  },

  selfVideoPlayer: {
    width: dimensions.width,
    height: dimensions.height,
  },
  selfVideoPlayerFloat: {
    width: dimensions.width * 0.27,
    height: dimensions.height * 0.23,
  },
  menuButton: {
    flexBasis: '30%',
  },
  modal: {
    marginTop: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    overflow: 'hidden',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default globalStyles;
