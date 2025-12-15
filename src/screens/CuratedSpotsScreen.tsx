import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ImageBackground,
  SafeAreaView,
  Share,
  Animated,
  Easing,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { toggleSave, isSaved, SavedPlace } from '../storage/savedPlaces';

type Place = {
  id: string;
  title: string;
  description: string;
  coords: { lat: number; lng: number };
  address: string;
  image: any;
};
type Section = { key: string; title: string; places: Place[] };

const BG = require('../assets/background.png');
const ICON_SHARE = require('../assets/ic_share.png');
const ICON_SAVE = require('../assets/ic_save.png');
const ICON_SAVED = require('../assets/ic_saved.png');

const { height: H, width: W } = Dimensions.get('window');
const IS_SMALL = H < 700 || W < 360;
const IS_SE = H <= 667 || W <= 320;

const S = {
  hPad: IS_SE ? 12 : 16,
  h1: IS_SE ? 20 : 22,
  secTitle: IS_SE ? 14 : 15,
  cardTitle: IS_SE ? 16 : 18,
  cardDesc: IS_SE ? 13 : 14,
  meta: IS_SE ? 11 : 12,
  cardImgH: IS_SE ? 120 : IS_SMALL ? 130 : 140,
  btnPadV: IS_SE ? 10 : 12,
  iconBtn: IS_SE ? 46 : 48,
  icon: IS_SE ? 20 : 22,
};

const SCROLL_BOTTOM_PAD = 32 + 30 + 30;

const DATA: Section[] = [
  {
    key: 'iconic',
    title: 'Iconic Viewpoints',
    places: [
      { id: 'p1', title: 'Horseshoe Falls Overlook', description: 'The most powerful and expansive view of Niagara Falls, where the water curves inward and disappears into mist.', coords: { lat: 43.0799, lng: -79.0747 }, address: 'Niagara Parkway, Niagara Falls, ON, Canada', image: require('../assets/horseshoe_falls.png') },
      { id: 'p2', title: 'Skylon Tower Observation Deck', description: 'A higher perspective offering a full panoramic view of the falls and the surrounding landscape.', coords: { lat: 43.0822, lng: -79.0789 }, address: '5200 Robinson St, Niagara Falls, ON L2G 2A3, Canada', image: require('../assets/skylon_tower.png') },
      { id: 'p3', title: 'Table Rock Welcome Centre', description: 'A close vantage point where the sound and scale of the falls feel immediate and overwhelming.', coords: { lat: 43.079, lng: -79.074 }, address: '6650 Niagara Parkway, Niagara Falls, ON L2E 3E8, Canada', image: require('../assets/table_rock.png') },
      { id: 'p4', title: 'Niagara Falls State Park Viewpoint', description: 'A classic public viewpoint offering balanced views of both American and Horseshoe Falls.', coords: { lat: 43.0826, lng: -79.0703 }, address: '332 Prospect St, Niagara Falls, NY 14303, USA', image: require('../assets/state_park_view.png') },
    ],
  },
  {
    key: 'quiet',
    title: 'Quiet Nature Views',
    places: [
      { id: 'p5', title: 'Dufferin Islands', description: 'A peaceful chain of small islands with calm water, bridges, and shaded walking paths.', coords: { lat: 43.0865, lng: -79.0674 }, address: 'Niagara Parkway, Niagara Falls, ON, Canada', image: require('../assets/dufferin_islands.png') },
      { id: 'p6', title: 'Whirlpool Aero Car Lookout', description: 'A dramatic view into the Niagara Whirlpool, where the river twists far below the cliffs.', coords: { lat: 43.1205, lng: -79.0671 }, address: '3850 Niagara Parkway, Niagara Falls, ON L2E 6S5, Canada', image: require('../assets/whirlpool_aerocar.png') },
      { id: 'p7', title: 'Niagara Glen Lookout', description: 'A rugged natural overlook above ancient rock formations and fast-moving river currents.', coords: { lat: 43.1316, lng: -79.0663 }, address: 'Niagara Glen Nature Reserve, Niagara Falls, ON, Canada', image: require('../assets/niagara_glen.png') },
      { id: 'p8', title: 'Rapids View Area', description: 'A quiet place to observe the river before it reaches the falls — fast, controlled, and powerful.', coords: { lat: 43.1182, lng: -79.0654 }, address: 'Niagara Parkway, Niagara Falls, ON, Canada', image: require('../assets/rapids_view.png') },
    ],
  },
  {
    key: 'heritage',
    title: 'Heritage & Scenic Spots',
    places: [
      { id: 'p9', title: 'Old Scow Viewpoint', description: 'A historic river scene featuring the remains of a stranded barge lodged near the rapids.', coords: { lat: 43.0869, lng: -79.0625 }, address: 'Niagara Parkway, Niagara Falls, ON, Canada', image: require('../assets/old_scow.png') },
      { id: 'p10', title: 'Rainbow Bridge Viewpoint', description: 'A scenic crossing point offering wide river views between Canada and the United States.', coords: { lat: 43.0893, lng: -79.0714 }, address: 'Rainbow Bridge, Niagara Falls, ON / NY', image: require('../assets/rainbow_bridge.png') },
      { id: 'p11', title: 'Queen Victoria Park', description: 'A historic landscaped park with classic walking paths and framed fall viewpoints.', coords: { lat: 43.0808, lng: -79.0759 }, address: '6345 Niagara Parkway, Niagara Falls, ON, Canada', image: require('../assets/queen_victoria_park.png') },
      { id: 'p12', title: 'Oakes Garden Theatre', description: 'A sunken classical garden overlooking the river, blending architecture and nature.', coords: { lat: 43.0906, lng: -79.0735 }, address: 'Niagara Parkway, Niagara Falls, ON L2E 3E8, Canada', image: require('../assets/oakes_garden.png') },
    ],
  },
];

const PALETTE = {
  gold: '#FFD43B',
  chipBg: 'rgba(15, 34, 44, 0.55)',
  chipBorder: 'rgba(255, 212, 59, 0.6)',
  cardBg: 'rgba(15, 34, 44, 0.55)',
  cardBorder: 'rgba(255, 255, 255, 0.85)',
  textPrimary: '#FFFFFF',
  textSecondary: '#CFE3EE',
  meta: '#9DC6D8',
  metaSep: '#65899A',
  darkOnGold: '#0A0F1F',
};

export default function CuratedSpotsScreen() {
  const sections = useMemo(() => DATA, []);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const selectedSection = sections.find(s => s.key === selectedKey) || null;
  const nav = useNavigation<any>();

  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const fade = useRef(new Animated.Value(0)).current;
  const catAnim = useRef<Record<string, Animated.Value>>({});
  const cardAnim = useRef<Record<string, Animated.Value>>({});
  const scrollRef = useRef<any>(null);

  const playFadeIn = () => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  };

  useEffect(() => { playFadeIn(); }, []);

  useFocusEffect(
    React.useCallback(() => {
      setSelectedKey(null);
      requestAnimationFrame(() => {
        const n = scrollRef.current?.getNode?.() ?? scrollRef.current;
        n?.scrollTo?.({ y: 0, animated: false });
      });
      playFadeIn();
      return () => {};
    }, [])
  );

  useEffect(() => {
    const allIds = sections.flatMap(s => s.places.map(p => p.id));
    Promise.all(allIds.map(async id => [id, await isSaved(id)] as const)).then(pairs => {
      const next: Record<string, boolean> = {};
      pairs.forEach(([id, val]) => (next[id] = val));
      setSavedMap(next);
    });
  }, [sections]);

  useEffect(() => {
    const values = (selectedSection ? selectedSection.places : sections).map(item => {
      const key = selectedSection ? (item as Place).id : (item as Section).key;
      const store = selectedSection ? cardAnim.current : catAnim.current;
      if (!store[key]) store[key] = new Animated.Value(0);
      store[key].setValue(0);
      return store[key];
    });
    Animated.stagger(
      90,
      values.map(v => Animated.timing(v, { toValue: 1, duration: 360, easing: Easing.out(Easing.cubic), useNativeDriver: true }))
    ).start();
  }, [selectedKey, selectedSection, sections]);

  const onShare = async (p: Place) => {
    try {
      await Share.share({ message: `${p.title}\n${p.address}\n${p.coords.lat.toFixed(4)}, ${p.coords.lng.toFixed(4)}` });
    } catch {}
  };

  const onOpenMap = (p: Place) => {
    nav.navigate('Interactive Map', {
      focusPlace: { id: p.id, title: p.title, coords: p.coords, address: p.address },
      openToken: Date.now(),
    });
  };

  const onToggleSave = async (p: Place) => {
    const now = await toggleSave({ id: p.id, title: p.title, address: p.address, coords: p.coords } as SavedPlace);
    setSavedMap(prev => ({ ...prev, [p.id]: now }));
  };

  const ScrollingHeader = ({ title }: { title: string }) => (
    <View style={styles.scrollHeader}>
      <View style={styles.scrollHeaderInner}>
        <Text style={[styles.scrollHeaderText, { fontSize: S.h1 }]}>{title}</Text>
      </View>
    </View>
  );

  const renderCard = (p: Place) => {
    const saved = !!savedMap[p.id];
    const v = cardAnim.current[p.id] ?? new Animated.Value(0);
    cardAnim.current[p.id] = v;

    return (
      <Animated.View
        key={p.id}
        style={[
          styles.card,
          {
            opacity: v,
            transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
          },
        ]}
      >
        <Image source={p.image} style={[styles.cardImg, { height: S.cardImgH }]} resizeMode="cover" />
        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, { fontSize: S.cardTitle }]}>{p.title}</Text>
          <Text style={[styles.cardDesc, { fontSize: S.cardDesc }]}>{p.description}</Text>
          <View style={styles.metaRow}>
            <Text style={[styles.metaText, { fontSize: S.meta }]}>{`${p.coords.lat.toFixed(4)}, ${p.coords.lng.toFixed(4)}`}</Text>
            <Text style={[styles.metaSep, { fontSize: S.meta }]}>·</Text>
            <Text numberOfLines={1} style={[styles.metaText, { flex: 1, fontSize: S.meta }]}>{p.address}</Text>
          </View>
          <View style={styles.actions}>
            <Pressable onPress={() => onOpenMap(p)} style={({ pressed }) => [styles.mapBtn, { paddingVertical: S.btnPadV }, pressed && { opacity: 0.9 }]}>
              <Text style={styles.mapBtnText}>Open on Map</Text>
            </Pressable>
            <Pressable onPress={() => onShare(p)} style={({ pressed }) => [styles.iconBtn, { width: S.iconBtn, height: S.iconBtn }, pressed && { opacity: 0.9 }]} hitSlop={8}>
              <Image source={ICON_SHARE} style={[styles.icon, { width: S.icon, height: S.icon, tintColor: PALETTE.gold }]} />
            </Pressable>
            <Pressable onPress={() => onToggleSave(p)} style={({ pressed }) => [styles.saveBtn, { width: S.iconBtn, height: S.iconBtn }, saved ? styles.saveBtnActive : null, pressed && { opacity: 0.95 }]} hitSlop={8}>
              <Image source={saved ? ICON_SAVED : ICON_SAVE} style={[styles.icon, { width: S.icon, height: S.icon, tintColor: saved ? PALETTE.darkOnGold : PALETTE.gold }]} />
            </Pressable>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderCategories = () => (
    <Animated.ScrollView
      ref={scrollRef}
      contentContainerStyle={{ paddingHorizontal: S.hPad, paddingBottom: SCROLL_BOTTOM_PAD, paddingTop: 50 }}
      style={{ opacity: fade }}
      showsVerticalScrollIndicator={false}
    >
      <ScrollingHeader title="Curated spots" />
      {sections.map(sec => {
        const preview = sec.places[0]?.image;
        const v = catAnim.current[sec.key] ?? new Animated.Value(0);
        catAnim.current[sec.key] = v;

        return (
          <Animated.View
            key={sec.key}
            style={[
              styles.catCard,
              {
                opacity: v,
                transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
              },
            ]}
          >
            <Image source={preview} style={[styles.catImg, { height: 120 }]} resizeMode="cover" />
            <View style={styles.catRow}>
              <Text style={[styles.catTitle, { fontSize: S.cardTitle }]}>{sec.title}</Text>
              <Pressable onPress={() => setSelectedKey(sec.key)} style={({ pressed }) => [styles.catBtn, pressed && { opacity: 0.9 }]}>
                <Text style={styles.catBtnText}>Choose</Text>
              </Pressable>
            </View>
          </Animated.View>
        );
      })}
    </Animated.ScrollView>
  );

  const renderPlaces = (sec: Section) => (
    <Animated.ScrollView
      ref={scrollRef}
      contentContainerStyle={{
        paddingHorizontal: S.hPad,
        paddingBottom: SCROLL_BOTTOM_PAD,
        paddingTop: Platform.select({ ios: 20, android: 40, default: 0 }),
      }}
      style={{ opacity: fade }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.topBar, { marginTop: 20 }]}>
        <Pressable onPress={() => setSelectedKey(null)} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.8 }]}>
          <Text style={styles.backTxt}>{'‹'}</Text>
        </Pressable>
        <Text style={[styles.h1, { fontSize: S.h1 }]}>Curated spots</Text>
      </View>

      <View style={styles.secHeader}>
        <Text style={[styles.secTitle, { fontSize: S.secTitle }]}>{sec.title}</Text>
      </View>

      {sec.places.map(p => renderCard(p))}
    </Animated.ScrollView>
  );

  return (
    <ImageBackground source={BG} style={styles.bg} imageStyle={styles.bgImg} resizeMode="cover">
      <SafeAreaView style={styles.safe}>{selectedSection ? renderPlaces(selectedSection) : renderCategories()}</SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  bgImg: {},
  safe: { flex: 1, backgroundColor: 'transparent' },

  scrollHeader: { alignItems: 'center', marginBottom: 12 },
  scrollHeaderInner: {
    backgroundColor: PALETTE.chipBg,
    borderRadius: 16,
    paddingHorizontal: IS_SE ? 14 : 18,
    paddingVertical: IS_SE ? 6 : IS_SMALL ? 8 : 10,
    borderWidth: 2,
    borderColor: PALETTE.chipBorder,
  },
  scrollHeaderText: { color: PALETTE.textPrimary, fontWeight: '800' },

  h1: {
    color: PALETTE.textPrimary,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  catCard: {
    backgroundColor: PALETTE.cardBg,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: PALETTE.cardBorder,
    marginBottom: 22,
    overflow: 'hidden',
  },
  catImg: { width: '100%' },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  catTitle: { color: PALETTE.textPrimary, fontWeight: '800' },
  catBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: PALETTE.gold,
    backgroundColor: 'transparent',
  },
  catBtnText: { color: PALETTE.gold, fontWeight: '800' },

  topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: PALETTE.chipBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.chipBg,
    marginRight: 8,
  },
  backTxt: { color: PALETTE.textPrimary, fontSize: 26, lineHeight: 26, marginTop: -2 },

  secHeader: {
    backgroundColor: PALETTE.chipBg,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: PALETTE.chipBorder,
    marginBottom: 12,
  },
  secTitle: { color: PALETTE.textPrimary, fontWeight: '700' },

  card: {
    backgroundColor: PALETTE.cardBg,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: PALETTE.cardBorder,
    marginBottom: 22,
    overflow: 'hidden',
  },
  cardImg: { width: '100%' },
  cardBody: { padding: 14, gap: 8 },
  cardTitle: { color: PALETTE.textPrimary, fontWeight: '800' },
  cardDesc: { color: PALETTE.textSecondary, lineHeight: 20 },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: PALETTE.meta },
  metaSep: { color: PALETTE.metaSep },

  actions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },

  mapBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: PALETTE.gold,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  mapBtnText: { color: PALETTE.gold, fontWeight: '800' },

  iconBtn: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: PALETTE.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  saveBtn: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: PALETTE.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  saveBtnActive: { backgroundColor: PALETTE.gold },

  icon: { resizeMode: 'contain' },
});
