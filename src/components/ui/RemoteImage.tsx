import { useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { optimizeUrl } from '@/utils/cloudinary';

interface RemoteImageProps {
  uri: string;
  /** Fixed box height - the image is fitted inside it (used for option tiles so they all match). */
  fixedHeight?: number;
  /** Without fixedHeight, the image is shown at its natural size, shrunk only if it exceeds these caps. */
  maxHeight?: number;
  maxWidth?: number;
  /** White rounded frame - keeps images with a white background looking intentional on the grey screen. */
  framed?: boolean;
  style?: StyleProp<ViewStyle>;
}

const PLACEHOLDER_HEIGHT = 80;

export function RemoteImage({
  uri,
  fixedHeight,
  maxHeight = 150,
  maxWidth = 260,
  framed,
  style,
}: RemoteImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);

  const widthHint = Math.round((fixedHeight ?? maxHeight) * 2);
  const optimizedUri = optimizeUrl(uri, widthHint);

  let boxStyle: ViewStyle;
  if (fixedHeight) {
    boxStyle = { width: '100%', height: fixedHeight };
  } else if (status === 'loaded' && natural) {
    const scale = Math.min(1, maxHeight / natural.h, maxWidth / natural.w);
    boxStyle = { width: natural.w * scale, height: natural.h * scale };
  } else {
    boxStyle = { width: '100%', height: PLACEHOLDER_HEIGHT };
  }

  return (
    <View style={[styles.wrap, framed && styles.frame, style]}>
      <View style={[styles.box, boxStyle]}>
        {status !== 'error' && (
          <Image
            source={{ uri: optimizedUri }}
            style={StyleSheet.absoluteFill}
            contentFit="contain"
            transition={200}
            cachePolicy="memory-disk"
            onLoad={(e) => {
              const { width, height } = e.source;
              if (width && height) setNatural({ w: width, h: height });
              setStatus('loaded');
            }}
            onError={(e) => {
              console.warn('[RemoteImage] failed to load:', optimizedUri, e.error);
              setStatus('error');
            }}
          />
        )}
        {status === 'loading' && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}
        {status === 'error' && (
          <View style={styles.center}>
            <Text style={styles.errorText}>Image could not be loaded</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', alignItems: 'center' },
  frame: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  box: { overflow: 'hidden' },
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  errorText: { ...typography.caption, color: colors.textMuted },
});