import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  Pressable,
  Dimensions,
  Share,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { toggleSave, isSaved, SavedPlace } from '../storage/savedPlaces';

const BG = require('../assets/background.png');
const IMG_CONFETTI = require('../assets/random_confetti.png');
const ICON_SHARE = require('../assets/ic_share.png');
const ICON_SAVE  = require('../assets/ic_save.png');
const ICON_SAVED = require('../assets/ic_saved.png');

const IMG = {
  horseshoe: require('../assets/horseshoe_falls.png'),
  skylon: require('../assets/skylon_tower.png'),
  tablerock: require('../assets/table_rock.png'),
  stateview: require('../assets/state_park_view.png'),
  dufferin: require('../assets/dufferin_islands.png'),
  aerocar: require('../assets/whirlpool_aerocar.png'),
  glen: require('../assets/niagara_glen.png'),
  rapids: require('../assets/rapids_view.png'),
};

type Place = {
  id: string;
  title: string;
  desc: string;
  address: string;
  coords: { lat: number; lng: number };
  image: any;
};

const PLACES: Place[] = [
  { id:'p1', title:'Iconic Viewpoints', desc:'A quiet place to observe the river before it reaches the falls, fast, controlled, and powerful.', address:'Niagara Parkway, Niagara Falls, ON, Canada', coords:{lat:43.0799,lng:-79.0747}, image:IMG.horseshoe },
  { id:'p2', title:'Skylon Tower Observation Deck', desc:'Panoramic view of the falls and city skyline.', address:'5200 Robinson St, Niagara Falls, ON L2G 2A3, Canada', coords:{lat:43.0822,lng:-79.0789}, image:IMG.skylon },
  { id:'p3', title:'Table Rock Welcome Centre', desc:'Close vantage point with roaring, immersive sound.', address:'6650 Niagara Parkway, Niagara Falls, ON L2E 3E8, Canada', coords:{lat:43.079,lng:-79.074}, image:IMG.tablerock },
  { id:'p4', title:'Niagara Falls State Park Viewpoint', desc:'Balanced views of American and Horseshoe Falls.', address:'332 Prospect St, Niagara Falls, NY 14303, USA', coords:{lat:43.0826,lng:-79.0703}, image:IMG.stateview },
  { id:'p5', title:'Dufferin Islands', desc:'Calm water, bridges and shaded paths.', address:'Niagara Parkway, Niagara Falls, ON, Canada', coords:{lat:43.0865,lng:-79.0674}, image:IMG.dufferin },
  { id:'p6', title:'Whirlpool Aero Car Lookout', desc:'Dramatic view into the Niagara Whirlpool.', address:'3850 Niagara Parkway, Niagara Falls, ON L2E 6S5, Canada', coords:{lat:43.1205,lng:-79.0671}, image:IMG.aerocar },
  { id:'p7', title:'Niagara Glen Lookout', desc:'Rugged overlook above fast currents.', address:'Niagara Glen Nature Reserve, Niagara Falls, ON, Canada', coords:{lat:43.1316,lng:-79.0663}, image:IMG.glen },
  { id:'p8', title:'Rapids View Area', desc:'Fast, controlled, powerful river before the falls.', address:'Niagara Parkway, Niagara Falls, ON, Canada', coords:{lat:43.1182,lng:-79.0654}, image:IMG.rapids },
];

const { width, height } = Dimensions.get('window');
const IS_SMALL = height < 700 || width < 360;
const IS_SE = height <= 667 || width <= 320;
const fs = (n: number) => (IS_SE ? n - 2 : IS_SMALL ? n - 1 : n);
const HEADER_Y = 66;
const HEADER_BLOCK_H = IS_SE ? 40 : IS_SMALL ? 46 : 50;
const CONTENT_TOP_PADDING = HEADER_Y + HEADER_BLOCK_H + 14;
const CONFETTI_H = IS_SE ? 260 : IS_SMALL ? 320 : 400; 


export default function RandomPlaceScreen() {
  const nav = useNavigation<any>();
  const [picked, setPicked] = useState<Place | null>(null);
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const startFade = useRef(new Animated.Value(0)).current;
  const startSlide = useRef(new Animated.Value(12)).current;
  const resultFade = useRef(new Animated.Value(0)).current;
  const resultSlide = useRef(new Animated.Value(20)).current;

  const runStartAnim = () => {
    startFade.setValue(0);
    startSlide.setValue(12);
    Animated.parallel([
      Animated.timing(startFade, { toValue: 1, duration: 240, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(startSlide, { toValue: 0, duration: 240, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  };

  const runResultAnim = () => {
    resultFade.setValue(0);
    resultSlide.setValue(20);
    Animated.parallel([
      Animated.timing(resultFade, { toValue: 1, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(resultSlide, { toValue: 0, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  };

  useFocusEffect(
    React.useCallback(() => {
      setPicked(null);
      setLoading(false);
      runStartAnim();
      return () => {};
    }, [])
  );

  const pickRandom = async () => {
    setLoading(true);
    setPicked(null);
    setTimeout(async () => {
      const p = PLACES[Math.floor(Math.random() * PLACES.length)];
      const already = await isSaved(p.id);
      setSavedMap(prev => ({ ...prev, [p.id]: already }));
      setPicked(p);
      setLoading(false);
      runResultAnim();
    }, 600);
  };

  const onOpenMap = (p: Place) => {
    nav.navigate('Interactive Map', {
      focusPlace: { id: p.id, title: p.title, address: p.address, coords: p.coords },
    });
  };

  const onShare = async (p: Place) => {
    try {
      await Share.share({
        message: `${p.title}\n${p.address}\n${p.coords.lat.toFixed(4)}, ${p.coords.lng.toFixed(4)}`,
      });
    } catch {}
  };

  const onToggleSave = async (p: Place) => {
    const now = await toggleSave({
      id: p.id, title: p.title, address: p.address, coords: p.coords,
    } as SavedPlace);
    setSavedMap(prev => ({ ...prev, [p.id]: now }));
  };

  const Header = () => (
    <View style={styles.headerWrap}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Random Place</Text>
      </View>
    </View>
  );

  return (
    <ImageBackground source={BG} style={styles.root} resizeMode="cover">
      <Header />

      <View style={[styles.content, { paddingTop: CONTENT_TOP_PADDING }]}>
        {!picked && !loading && (
          <Animated.View style={[styles.startWrap, { opacity: startFade, transform: [{ translateY: startSlide }] }]}>
            <Image source={IMG_CONFETTI} style={styles.confetti} />
            <View style={styles.ctaCard}>
              <Text style={styles.ctaTop}>Get a random iconic place{'\n'}around Niagara Falls</Text>
            </View>
            <Pressable onPress={pickRandom} style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.92 }]}>
              <Text style={styles.primaryBtnText}>⚡ Get Random Place</Text>
            </Pressable>
          </Animated.View>
        )}

        {loading && (
          <View style={styles.loadingWrap}>
            <Text style={styles.loadingEmoji}>🌲</Text>
            <Text style={styles.loadingText}>Searching…</Text>
            <Pressable onPress={() => setLoading(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelTxt}>cancel</Text>
            </Pressable>
          </View>
        )}

        {picked && (
          <Animated.View
            style={[
              styles.resultWrap,
              { opacity: resultFade, transform: [{ translateY: resultSlide }] },
            ]}
          >
            <View style={styles.card}>
              <Image source={picked.image} style={styles.cardImg} />
              <View style={styles.cardBody}>
                <Text style={styles.title}>{picked.title}</Text>
                <Text style={styles.desc} numberOfLines={2}>{picked.desc}</Text>

                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>
                    {picked.coords.lat.toFixed(4)}, {picked.coords.lng.toFixed(4)}
                  </Text>
                  <Text style={styles.metaSep}> · </Text>
                  <Text numberOfLines={1} style={[styles.metaText, { flex: 1 }]}>{picked.address}</Text>
                </View>

                <View style={styles.actionsRow}>
                  <Pressable onPress={() => onOpenMap(picked)} style={({ pressed }) => [styles.mapBtn, pressed && { opacity: 0.92 }]}>
                    <Text style={styles.mapBtnText}>Open at maps</Text>
                  </Pressable>

                  <Pressable onPress={() => onShare(picked)} style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.92 }]}>
                    <Image source={ICON_SHARE} style={[styles.icon, { tintColor: '#FFD43B' }]} />
                  </Pressable>

                  <Pressable
                    onPress={() => onToggleSave(picked)}
                    style={({ pressed }) => [
                      styles.iconBtn,
                      savedMap[picked.id] && styles.iconBtnActive,
                      pressed && { opacity: 0.95 },
                    ]}
                  >
                    <Image
                      source={savedMap[picked.id] ? ICON_SAVED : ICON_SAVE}
                      style={[styles.icon, { tintColor: savedMap[picked.id] ? '#0A0F1F' : '#FFD43B' }]}
                    />
                  </Pressable>
                </View>
              </View>
            </View>

            <Pressable onPress={pickRandom} style={({ pressed }) => [styles.searchAgainBtn, pressed && { opacity: 0.92 }]}>
              <Text style={styles.searchAgainTxt}>⟳  Search Again</Text>
            </Pressable>
          </Animated.View>
        )}
      </View>
    </ImageBackground>
  );
}

const WHITE = 'rgba(255,255,255,0.95)';
const { width: W } = Dimensions.get('window');

const styles = StyleSheet.create({
  root: { flex: 1 },

  headerWrap: {
    position: 'absolute',
    top: HEADER_Y,
    left: 16,
    right: 16,
    zIndex: 2,
    alignItems: 'center',
  },
  header: {
    backgroundColor: 'rgba(15,43,39,0.92)',
    borderRadius: 16,
    paddingHorizontal: IS_SE ? 14 : 18,
    paddingVertical: IS_SE ? 6 : IS_SMALL ? 8 : 10,
    borderWidth: 1,
    borderColor: '#21493f',
  },
  headerText: { color: '#fff', fontSize: fs(16), fontWeight: '800' },
  content: { flex: 1, paddingHorizontal: 16 },

  startWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start', 
    paddingTop: IS_SE ? 10 : 30, 
  },
  confetti: {
    width: Math.min(W - 48, 320),
    height: CONFETTI_H, 
    resizeMode: 'contain', 
    marginBottom: IS_SE ? -10 : 0, 
  },
  ctaCard: {
    backgroundColor: 'rgba(15,43,39,0.92)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#21493f',
    paddingVertical: IS_SE ? 8 : 12,
    paddingHorizontal: 14,
    marginTop: IS_SE ? 0 : 0, 
    marginBottom: IS_SE ? 10 : 12,
    width: Math.min(W - 48, 340),
  },
  ctaTop: { color: '#e9fff5', textAlign: 'center', fontWeight: '700', fontSize: fs(13) },

  primaryBtn: {
    backgroundColor: '#FFD43B',
    paddingVertical: IS_SE ? 12 : 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    width: Math.min(W - 48, 340),
    alignItems: 'center',
  },
  primaryBtnText: { color: '#0A0F1F', fontWeight: '800' },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingEmoji: { fontSize: 44, marginBottom: 8 },
  loadingText: { color: '#fff', fontSize: fs(16), marginBottom: 8 },
  cancelBtn: { padding: 6 },
  cancelTxt: { color: '#cfd3e1', textDecorationLine: 'underline' },

  resultWrap: { 
    flex: 1,
    paddingTop: IS_SE ? 0 : 10,
  },
  card: {
    backgroundColor: '#112a3a',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: WHITE,
    overflow: 'hidden',
  },
  cardImg: { 
    width: '100%', 
    height: IS_SE ? 120 : IS_SMALL ? 140 : 180, 
    resizeMode: 'cover' 
  },
  cardBody: { padding: 14, gap: 8 },
  title: { color: '#fff', fontSize: fs(20), fontWeight: '800' },
  desc: { color: '#cfe3ee', fontSize: fs(15) },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: '#9dc6d8', fontSize: fs(12) },
  metaSep: { color: '#65899a' },

  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }, 
  mapBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#FFD43B',
    borderRadius: 12,
    paddingVertical: IS_SE ? 8 : 12, 
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  mapBtnText: { color: '#FFD43B', fontWeight: '800' },

  iconBtn: {
    width: IS_SE ? 40 : 50,
    height: IS_SE ? 40 : 46,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFD43B',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconBtnActive: { backgroundColor: '#FFD43B' },
  icon: { width: IS_SE ? 18 : 20, height: IS_SE ? 18 : 20, resizeMode: 'contain' },

  searchAgainBtn: {
    marginTop: IS_SE ? 10 : 14,
    backgroundColor: '#FFD43B',
    borderRadius: 22,
    paddingVertical: IS_SE ? 8 : 12,
    alignItems: 'center',
  },
  searchAgainTxt: { color: '#0A0F1F', fontWeight: '800' },
});