import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, Image, ImageBackground,
  Animated, Easing, Dimensions, Share, Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSavedPlaces, removePlace, SavedPlace } from '../storage/savedPlaces';

const BG = require('../assets/background.png');
const ICON_SHARE = require('../assets/ic_share.png');
const ILLUSTRATION = require('../assets/onboard1.png');

const IMG = {
  p1: require('../assets/horseshoe_falls.png'),
  p2: require('../assets/skylon_tower.png'),
  p3: require('../assets/table_rock.png'),
  p4: require('../assets/state_park_view.png'),
  p5: require('../assets/dufferin_islands.png'),
  p6: require('../assets/whirlpool_aerocar.png'),
  p7: require('../assets/niagara_glen.png'),
  p8: require('../assets/rapids_view.png'),
  p9: require('../assets/old_scow.png'),
  p10: require('../assets/rainbow_bridge.png'),
  p11: require('../assets/queen_victoria_park.png'),
  p12: require('../assets/oakes_garden.png'),
} as const;

const DESC: Record<string, string> = {
  p1: 'The most powerful, sweeping view into the Horseshoe curve.',
  p2: 'Panoramic view of the falls and city skyline.',
  p3: 'Close vantage point with roaring, immersive sound.',
  p4: 'Balanced views of American and Horseshoe Falls.',
  p5: 'Calm water, bridges and shaded paths.',
  p6: 'Dramatic view into the Niagara Whirlpool.',
  p7: 'Rugged overlook above fast currents.',
  p8: 'Fast, controlled, powerful river before the falls.',
  p9: 'Historic view of the stranded barge.',
  p10: 'Wide river views between Canada and the US.',
  p11: 'Historic park with classic walking paths.',
  p12: 'Classical garden overlooking the river.',
};

const { width: W, height: H } = Dimensions.get('window');
const IS_SMALL = H < 700 || W < 360;
const IS_SE = H <= 667 || W <= 320;
const fs = (n: number) => (IS_SE ? n - 2 : IS_SMALL ? n - 1 : n);
const ILLUS_W = Math.min(W - 32, IS_SE ? 320 : 380);
const ILLUS_H = Math.min(H * (IS_SE ? 0.52 : IS_SMALL ? 0.56 : 0.58), IS_SE ? 520 : 640);
const ILLUS_SHIFT_Y = IS_SE ? -6 : -10;
const TAB_GUARD = Platform.select({ ios: 84, android: 72 }) as number;

function SavedCard({
  item, index, onOpenMap, onShare, onRemove,
}: {
  item: SavedPlace;
  index: number;
  onOpenMap: (p: SavedPlace) => void;
  onShare: (p: SavedPlace) => void;
  onRemove: (id: string) => void;
}) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const delay = Platform.OS === 'android' && index > 5 ? 0 : 90 * index;
    Animated.timing(v, {
      toValue: 1,
      duration: 360,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [v, index]);

  const img: any = (IMG as any)[item.id] ?? IMG.p1;
  const desc = DESC[item.id] ?? 'A scenic spot in the Niagara area.';

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: v,
          transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
        },
      ]}
    >
      <Image source={img} style={styles.cardImg} />
      <View style={styles.cardBody}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.desc} numberOfLines={2}>{desc}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {item.coords.lat.toFixed(4)}, {item.coords.lng.toFixed(4)}
          </Text>
          <Text style={styles.metaSep}> · </Text>
          <Text style={[styles.metaText, { flex: 1 }]} numberOfLines={1}>{item.address}</Text>
        </View>

        <View style={styles.actionsRow}>
          <Pressable onPress={() => onOpenMap(item)} style={({ pressed }) => [styles.mapBtn, pressed && { opacity: 0.92 }]}>
            <Text style={styles.mapBtnText}>Open at maps</Text>
          </Pressable>

          <Pressable onPress={() => onShare(item)} style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.92 }]} hitSlop={8}>
            <Image source={ICON_SHARE} style={[styles.icon, { tintColor: '#FFD43B' }]} />
          </Pressable>

          <Pressable onPress={() => onRemove(item.id)} style={({ pressed }) => [styles.removeBtn, pressed && { opacity: 0.95 }]} hitSlop={8}>
            <Text style={styles.removeTxt}>Remove</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

export default function SavedScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [list, setList] = useState<SavedPlace[]>([]);
  const load = useCallback(async () => setList(await getSavedPlaces()), []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fade, slide]);

  const onOpenMap = (p: SavedPlace) => {
    nav.navigate('Tabs', {
      screen: 'Map',
      params: { focusPlace: { id: p.id, title: p.title, address: p.address, coords: p.coords } },
    });
  };

  const onShare = async (p: SavedPlace) => {
    try {
      await Share.share({
        message: `${p.title}\n${p.address}\n${p.coords.lat.toFixed(4)}, ${p.coords.lng.toFixed(4)}`,
      });
    } catch {}
  };

  const onRemove = async (id: string) => { await removePlace(id); await load(); };

  const illusScale = useRef(new Animated.Value(0.96)).current;
  useEffect(() => {
    Animated.timing(illusScale, {
      toValue: 1,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [illusScale]);

  const EmptyState = () => (
    <Animated.ScrollView
      contentContainerStyle={[
        styles.emptyScroll,
        { paddingBottom: insets.bottom + TAB_GUARD, paddingTop: 0 },
      ]}
      style={{ opacity: fade, transform: [{ translateY: slide }] }}
      showsVerticalScrollIndicator={false}
      bounces={false}
      alwaysBounceVertical={false}
    >
      <Animated.View
        style={[
          styles.illustrationBox,
          { width: ILLUS_W, height: ILLUS_H, marginTop: ILLUS_SHIFT_Y, transform: [{ scale: illusScale }] },
        ]}
      >
        <Image source={ILLUSTRATION} style={styles.illustration} />
      </Animated.View>

      <View style={styles.emptyPill}>
        <Text style={styles.emptyPillTxt}>There are no saved locations yet</Text>
      </View>
    </Animated.ScrollView>
  );

  const listBottomPadding = insets.bottom + TAB_GUARD;

  return (
    <ImageBackground source={BG} style={[styles.bg, { paddingTop: insets.top }]} resizeMode="cover">
      <View style={[styles.headerWrap, { top: 56 }]}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Saved Locations</Text>
        </View>
      </View>

      <Animated.View
        style={[
          styles.content,
          {
            paddingTop: 16 + (IS_SE ? 42 : IS_SMALL ? 48 : 54) + (IS_SE ? 8 : 12),
            opacity: fade,
            transform: [{ translateY: slide }],
          },
        ]}
      >
        {list.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={list}
            keyExtractor={(it) => it.id}
            contentContainerStyle={[styles.listContent, { paddingBottom: 24 + listBottomPadding }]}
            ItemSeparatorComponent={() => <View style={{ height: IS_SE ? 12 : 16 }} />}
            renderItem={({ item, index }) => (
              <SavedCard
                item={item}
                index={index}
                onOpenMap={onOpenMap}
                onShare={onShare}
                onRemove={onRemove}
              />
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </Animated.View>
    </ImageBackground>
  );
}

const WHITE = 'rgba(255,255,255,0.95)';
const CARD_IMG_H = IS_SE ? 110 : IS_SMALL ? 130 : 140;
const BUTTON_PAD_Y = IS_SE ? 8 : 10;

const styles = StyleSheet.create({
  bg: { flex: 1 },

  headerWrap: { position: 'absolute', left: 16, right: 16, zIndex: 2, alignItems: 'center' },
  header: {
    backgroundColor: 'rgba(15,43,39,0.92)',
    borderRadius: 16,
    paddingHorizontal: IS_SE ? 14 : 18,
    paddingVertical: IS_SE ? 6 : IS_SMALL ? 8 : 10,
    borderWidth: 1,
    borderColor: '#21493f',
  },
  headerText: { color: '#fff', fontSize: fs(16), fontWeight: '800' },

  content: { flex: 1 },
  listContent: {
    paddingHorizontal: IS_SE ? 8 : 16,
    paddingVertical: 16,
  },

  emptyScroll: {
    paddingHorizontal: 16,
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
  },
  illustrationBox: {
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 18,
    overflow: 'hidden',
  },
  illustration: { width: '100%', height: '100%', resizeMode: 'contain' },

  emptyPill: {
    marginTop: IS_SE ? 12 : 16,
    paddingVertical: IS_SE ? 8 : 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(15,43,39,0.92)',
    borderWidth: 1,
    borderColor: '#21493f',
    alignSelf: 'stretch',
    maxWidth: 560,
    marginHorizontal: 16,
  },
  emptyPillTxt: { color: '#e9fff5', fontWeight: '700', textAlign: 'center', fontSize: fs(14) },

  card: {
    backgroundColor: '#0f2b27',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: WHITE,
    overflow: 'hidden',
    marginHorizontal: IS_SE ? 8 : 0,
  },
  cardImg: { width: '100%', height: CARD_IMG_H, resizeMode: 'cover' },
  cardBody: { padding: IS_SE ? 10 : 14 },
  title: { color: '#fff', fontWeight: '800', fontSize: fs(18) },
  desc: { color: '#cfe3ee', marginTop: 4, fontSize: fs(13) },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  metaText: { color: '#9dc6d8', fontSize: fs(12) },
  metaSep: { color: '#65899a' },

  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: IS_SE ? 6 : 10, marginTop: IS_SE ? 8 : 12 },
  mapBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#FFD43B',
    borderRadius: 12,
    paddingVertical: BUTTON_PAD_Y,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  mapBtnText: { color: '#FFD43B', fontWeight: '800' },

  iconBtn: {
    width: IS_SE ? 36 : 42,
    height: IS_SE ? 36 : 42,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFD43B',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  icon: { width: IS_SE ? 16 : 18, height: IS_SE ? 16 : 18, resizeMode: 'contain' },

  removeBtn: {
    paddingHorizontal: 10,
    paddingVertical: BUTTON_PAD_Y,
    borderRadius: 12,
    backgroundColor: '#FFD43B',
  },
  removeTxt: { color: '#0A0F1F', fontWeight: '800', fontSize: fs(13) },
});
