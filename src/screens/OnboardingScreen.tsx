import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const BG = require('../assets/background.png');

const SLIDES = [
  {
    key: 's1',
    img: require('../assets/onboard1.png'),
    title: 'Frame Niagara',
    desc: 'Explore Niagara through carefully selected viewpoints and quiet perspectives.',
  },
  {
    key: 's2',
    img: require('../assets/onboard2.png'),
    title: 'Discover with Intention',
    desc: 'Use the Viewfinder to reveal a random location and observe Niagara without distractions.',
  },
  {
    key: 's3',
    img: require('../assets/onboard3.png'),
    title: 'Save What Matters',
    desc: 'Keep the views that resonate with you and return to them anytime, even offline.',
  },
] as const;

export default function OnboardingScreen({ navigation }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);

  const isSmall = height < 700 || width < 360;
  const isSE = height <= 667 || width <= 320;
  const fs = (n: number) => (isSE ? n - 2 : isSmall ? n - 1 : n);

  const hero = useMemo(() => {
    const src = Image.resolveAssetSource(SLIDES[index].img);
    const padH = 32; 
    const maxW = Math.min(width - padH, 500);
    const aspect = src.width && src.height ? src.width / src.height : 16 / 9;
    const rawH = maxW / aspect;
    const maxH = Math.min(520, Math.round(height * (isSE ? 0.48 : isSmall ? 0.54 : 0.58)));
    const minH = isSE ? 220 : isSmall ? 260 : 300;

    return {
      w: maxW,
      h: Math.max(Math.min(rawH, maxH), minH),
      aspect,
    };
  }, [index, width, height]);

  const isLast = index === SLIDES.length - 1;

  const onNext = () => {
    if (!isLast) setIndex((i) => i + 1);
    else navigation.replace('Tabs');
  };

  return (
    <ImageBackground source={BG} style={styles.bg} imageStyle={styles.bgImg} resizeMode="cover">
      <View style={[styles.content, { paddingTop: insets.top + (isSE ? 8 : 12) }]}>
        <View style={styles.heroWrap}>
          <Image
            source={SLIDES[index].img}
            style={{
              width: hero.w,
              height: hero.h,
              borderRadius: 14,
            }}
            resizeMode="contain"
          />
        </View>

        <View
          style={[
            styles.bottomCard,
            {
              marginTop: -16,
              marginHorizontal: 16,
              padding: isSE ? 14 : isSmall ? 16 : 20,
              marginBottom: Math.max(isSE ? 16 : 20, insets.bottom + (isSE ? 10 : 18)),
            },
          ]}
        >
          <Text style={[styles.title, { fontSize: fs(22) }]}>{SLIDES[index].title}</Text>
          <Text style={[styles.desc, { fontSize: fs(15), lineHeight: fs(21) }]}>
            {SLIDES[index].desc}
          </Text>

          <View style={[styles.dots, { marginTop: isSE ? 10 : 14, marginBottom: isSE ? 12 : 16 }]}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    width: isSE ? 6 : 8,
                    height: isSE ? 6 : 8,
                    borderRadius: isSE ? 3 : 4,
                    opacity: i === index ? 1 : 0.35,
                  },
                  i === index && styles.dotActive,
                ]}
              />
            ))}
          </View>

          <Pressable
            onPress={onNext}
            style={({ pressed }) => [
              styles.btn,
              {
                paddingVertical: isSE ? 10 : 14,
                borderRadius: isSE ? 22 : 26,
              },
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text style={[styles.btnText, { fontSize: fs(16) }]}>
              {isLast ? 'Start Exploring' : 'Next'}
            </Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  bgImg: {},
  content: { flex: 1, justifyContent: 'flex-end' },
  heroWrap: { alignItems: 'center' },

  bottomCard: {
    backgroundColor: 'rgba(0, 0, 0, 1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },

  title: {
    color: '#FFFFFF',
    fontWeight: '800',
    marginBottom: 8,
  },
  desc: {
    color: 'rgba(255,255,255,0.85)',
  },

  dots: { flexDirection: 'row', gap: 8 },
  dot: { backgroundColor: 'rgba(255,255,255,1)' },
  dotActive: { backgroundColor: '#FFD43B' },

  btn: { backgroundColor: '#FFD43B', alignItems: 'center' },
  btnText: { color: '#0A0F1F', fontWeight: '800' },
});
