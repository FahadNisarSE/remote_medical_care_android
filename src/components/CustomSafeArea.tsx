import {ReactNode} from 'react';
import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export default function CustomSafeArea({
  children,
  stylesClass,
}: {
  children: ReactNode;
  stylesClass?: string;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={stylesClass}
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}>
      {children}
    </View>
  );
}
