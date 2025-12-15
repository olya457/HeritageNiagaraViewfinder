import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Dimensions,
  Pressable,
  Image,
  Share,
  Animated,
  Easing,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region, MapType } from 'react-native-maps';
import { useRoute } from '@react-navigation/native';
import { toggleSave, isSaved, SavedPlace } from '../storage/savedPlaces';

const ICON_SHARE = require('../assets/ic_share.png');
const ICON_SAVE = require('../assets/ic_save.png');
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
  scow: require('../assets/old_scow.png'),
  rainbow: require('../assets/rainbow_bridge.png'),
  victoria: require('../assets/queen_victoria_park.png'),
  oakes: require('../assets/oakes_garden.png'),
};

type Place = {
  id: string;
  title: string;
  desc: string;
  address: string;
  coords: { lat: number; lng: number };
  image: any;
};

type RouteParams = {
  focusPlace?: { id: string; title: string; address: string; coords: { lat: number; lng: number } };
};

const { width, height } = Dimensions.get('window');
const IS_SMALL = height < 700 || width < 360;
const IS_SE = height <= 667 || width <= 320;
const fs = (n: number) => (IS_SE ? n - 2 : IS_SMALL ? n - 1 : n);

const ANDROID_DARK_STYLE: any[] = [
  { elementType: 'geometry', stylers: [{ color: '#0b1b2b' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#b7c7d6' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0b1b2b' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#17334b' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a2740' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#9fb0c2' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

const PLACES: Place[] = [
  { id:'p1', title:'Horseshoe Falls Overlook', desc:'The most powerful, sweeping view into the Horseshoe curve.', address:'Niagara Parkway, Niagara Falls, ON, Canada', coords:{lat:43.0799,lng:-79.0747}, image:IMG.horseshoe },
  { id:'p2', title:'Skylon Tower Observation Deck', desc:'A high vantage point with full panoramic city-and-falls views.', address:'5200 Robinson St, Niagara Falls, ON L2G 2A3, Canada', coords:{lat:43.0822,lng:-79.0789}, image:IMG.skylon },
  { id:'p3', title:'Table Rock Welcome Centre', desc:'Close enough to feel the scale, sound, and mist.', address:'6650 Niagara Parkway, Niagara Falls, ON L2E 3E8, Canada', coords:{lat:43.0790,lng:-79.0740}, image:IMG.tablerock },
  { id:'p4', title:'Niagara Falls State Park Viewpoint', desc:'A classic viewpoint across American and Horseshoe Falls.', address:'332 Prospect St, Niagara Falls, NY 14303, USA', coords:{lat:43.0826,lng:-79.0703}, image:IMG.stateview },
  { id:'p5', title:'Dufferin Islands', desc:'Peaceful islands with bridges and shaded paths.', address:'Niagara Parkway, Niagara Falls, ON, Canada', coords:{lat:43.0865,lng:-79.0674}, image:IMG.dufferin },
  { id:'p6', title:'Whirlpool Aero Car Lookout', desc:'Dramatic views into the Niagara Whirlpool below the cliffs.', address:'3850 Niagara Parkway, Niagara Falls, ON L2E 6S5, Canada', coords:{lat:43.1205,lng:-79.0671}, image:IMG.aerocar },
  { id:'p7', title:'Niagara Glen Lookout', desc:'A rugged overlook above ancient rock formations and rapids.', address:'Niagara Glen Nature Reserve, Niagara Falls, ON, Canada', coords:{lat:43.1316,lng:-79.0663}, image:IMG.glen },
  { id:'p8', title:'Rapids View Area', desc:'Quiet spot to watch fast water before the falls.', address:'Niagara Parkway, Niagara Falls, ON, Canada', coords:{lat:43.1182,lng:-79.0654}, image:IMG.rapids },
  { id:'p9', title:'Old Scow Viewpoint', desc:'Historic view of the stranded scow near the rapids.', address:'Niagara Parkway, Niagara Falls, ON, Canada', coords:{lat:43.0869,lng:-79.0625}, image:IMG.scow },
  { id:'p10', title:'Rainbow Bridge Viewpoint', desc:'Bridge vantage point with wide river views and the border.', address:'Rainbow Bridge, Niagara Falls, ON / NY', coords:{lat:43.0893,lng:-79.0714}, image:IMG.rainbow },
  { id:'p11', title:'Queen Victoria Park', desc:'Historic landscaped park framing classic falls scenes.', address:'6345 Niagara Parkway, Niagara Falls, ON, Canada', coords:{lat:43.0808,lng:-79.0759}, image:IMG.victoria },
  { id:'p12', title:'Oakes Garden Theatre', desc:'A sunken garden-amphitheatre with river outlook.', address:'Niagara Parkway, Niagara Falls, ON L2E 3E8, Canada', coords:{lat:43.0906,lng:-79.0735}, image:IMG.oakes },
];

export default function InteractiveMapScreen() {
  const route = useRoute<any>();
  const params = (route?.params || {}) as RouteParams;

  const focusedFromRoute =
    params.focusPlace
      ? PLACES.find(p => p.id === params.focusPlace!.id) ?? {
          ...params.focusPlace,
          desc: '',
          image: IMG.horseshoe,
        }
      : null;

  const DEFAULT_CENTER = { lat: 43.0893, lng: -79.0714 };

  const [selected, setSelected] = useState<Place | null>(focusedFromRoute);
  const [saved, setSaved] = useState(false);
  const [mapType, setMapType] = useState<MapType>('standard');
  const [region, setRegion] = useState<Region>(() => ({
    latitude: focusedFromRoute?.coords.lat ?? DEFAULT_CENTER.lat,
    longitude: focusedFromRoute?.coords.lng ?? DEFAULT_CENTER.lng,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  }));

  const mapRef = useRef<MapView | null>(null);
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerTrans = useRef(new Animated.Value(-10)).current;
  const ctrlsFade = useRef(new Animated.Value(0)).current;
  const ctrlsTrans = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(headerTrans, { toValue: 0, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(ctrlsFade, { toValue: 1, duration: 320, delay: 120, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(ctrlsTrans, { toValue: 0, duration: 320, delay: 120, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [headerFade, headerTrans, ctrlsFade, ctrlsTrans]);

  useEffect(() => {
    if (!params?.focusPlace) return;
    const found = PLACES.find(p => p.id === params.focusPlace!.id);
    const next = (found ?? {
      ...params.focusPlace,
      desc: '',
      image: IMG.horseshoe,
    }) as Place;

    setSelected(next);
    isSaved(next.id).then(setSaved).catch(() => setSaved(false));

    requestAnimationFrame(() => {
      mapRef.current?.animateToRegion(
        {
          latitude: next.coords.lat,
          longitude: next.coords.lng,
          latitudeDelta: 0.045,
          longitudeDelta: 0.045,
        },
        500
      );
    });
  }, [params?.focusPlace?.id]);

  useEffect(() => {
    if (selected?.id) isSaved(selected.id).then(setSaved).catch(() => setSaved(false));
  }, [selected?.id]);

  const onSelect = (p: Place) => {
    setSelected(p);
    mapRef.current?.animateToRegion(
      {
        latitude: p.coords.lat,
        longitude: p.coords.lng,
        latitudeDelta: 0.045,
        longitudeDelta: 0.045,
      },
      400
    );
  };

  const handleMapPress = (e: any) => {
    if (e?.nativeEvent?.action === 'marker-press') return;
    setSelected(null);
  };

  const onShare = async () => {
    if (!selected) return;
    try {
      await Share.share({
        message: `${selected.title}\n${selected.address}\n${selected.coords.lat.toFixed(4)}, ${selected.coords.lng.toFixed(4)}`,
      });
    } catch {}
  };

  const onToggleSave = async () => {
    if (!selected) return;
    const now = await toggleSave({
      id: selected.id,
      title: selected.title,
      address: selected.address,
      coords: selected.coords,
    } as SavedPlace);
    setSaved(now);
  };

  const fade = useRef(new Animated.Value(selected ? 1 : 0)).current;
  const scale = useRef(new Animated.Value(selected ? 1 : 0.94)).current;
  useEffect(() => {
    if (selected) {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 7, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fade, { toValue: 0, duration: 120, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.94, duration: 120, useNativeDriver: true }),
      ]).start();
    }
  }, [selected, fade, scale]);

  const applyRegion = (r: Region, duration = 250) => {
    setRegion(r);
    mapRef.current?.animateToRegion(r, duration);
  };

  const zoom = (factor: number) => {
    const next: Region = {
      ...region,
      latitudeDelta: Math.max(0.002, region.latitudeDelta / factor),
      longitudeDelta: Math.max(0.002, region.longitudeDelta / factor),
    };
    applyRegion(next);
  };

  const zoomIn = () => zoom(1.6);
  const zoomOut = () => zoom(1 / 1.6);

  const recenter = () => {
    const target = selected?.coords ?? DEFAULT_CENTER;
    const next: Region = {
      latitude: target.lat,
      longitude: target.lng,
      latitudeDelta: 0.045,
      longitudeDelta: 0.045,
    };
    applyRegion(next, 350);
  };

  const toggleMapType = () => {
    setMapType(prev => (prev === 'standard' ? 'hybrid' : 'standard'));
  };

  return (
    <View style={styles.root}>
      <MapView
        ref={(r) => { mapRef.current = r; }}
        style={StyleSheet.absoluteFill}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        customMapStyle={Platform.OS === 'android' ? ANDROID_DARK_STYLE : undefined}
        mapType={mapType}
        initialRegion={region}
        onPress={handleMapPress}
        onRegionChangeComplete={(r) => setRegion(r)}
      >
        {PLACES.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.coords.lat, longitude: p.coords.lng }}
            tracksViewChanges={false}
            onPress={() => onSelect(p)}
          />
        ))}
      </MapView>

      <Animated.View style={[styles.headerWrap, { opacity: headerFade, transform: [{ translateY: headerTrans }] }]}>
        <View style={styles.header}>
          <View style={styles.mintDot} />
          <Text style={styles.headerText}>Interactive Map</Text>
        </View>
      </Animated.View>

      <Animated.View
        pointerEvents="box-none"
        style={[styles.controlsWrap, { opacity: ctrlsFade, transform: [{ translateX: ctrlsTrans }] }]}
      >
        <View style={styles.controlsCol}>
          <Pressable onPress={recenter} style={({pressed}) => [styles.ctrlBtn, pressed && {opacity:0.9}]} accessibilityLabel="Recenter">
            <Text style={styles.ctrlTxt}>◎</Text>
          </Pressable>
          <Pressable onPress={zoomIn} style={({pressed}) => [styles.ctrlBtn, pressed && {opacity:0.9}]} accessibilityLabel="Zoom in">
            <Text style={styles.ctrlTxt}>＋</Text>
          </Pressable>
          <Pressable onPress={zoomOut} style={({pressed}) => [styles.ctrlBtn, pressed && {opacity:0.9}]} accessibilityLabel="Zoom out">
            <Text style={styles.ctrlTxt}>－</Text>
          </Pressable>
          <Pressable onPress={toggleMapType} style={({pressed}) => [styles.ctrlBtn, pressed && {opacity:0.9}]} accessibilityLabel="Toggle map type">
            <Text style={styles.ctrlTxt}>{mapType === 'standard' ? '🗺️' : '🌗'}</Text>
          </Pressable>
        </View>
      </Animated.View>

      {selected && (
        <View style={styles.centerOverlay} pointerEvents="box-none">
          <Animated.View style={[styles.centerCard, { opacity: fade, transform: [{ scale }] }]}>
            <Image source={selected.image} style={styles.cardImg} />
            <View style={styles.cardBody}>
              <Text style={styles.title} numberOfLines={2}>{selected.title}</Text>
              <Text style={styles.desc} numberOfLines={2}>{selected.desc}</Text>
              <Text style={styles.addr} numberOfLines={2}>{selected.address}</Text>
              <Text style={styles.coords}>
                {selected.coords.lat.toFixed(4)}, {selected.coords.lng.toFixed(4)}
              </Text>
              <View style={styles.actionsRow}>
                <Pressable onPress={onShare} style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.9 }]} hitSlop={8}>
                  <Image source={ICON_SHARE} style={[styles.icon, { tintColor: '#FFD43B' }]} />
                </Pressable>
                <Pressable
                  onPress={onToggleSave}
                  style={({ pressed }) => [styles.iconBtn, saved && styles.iconBtnActive, pressed && { opacity: 0.95 }]}
                  hitSlop={8}
                >
                  <Image source={saved ? ICON_SAVED : ICON_SAVE} style={[styles.icon, { tintColor: saved ? '#0A0F1F' : '#FFD43B' }]} />
                </Pressable>
                <Pressable onPress={() => setSelected(null)} style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.9 }]}>
                  <Text style={styles.closeTxt}>Close</Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const WHITE = 'rgba(255,255,255,0.95)';
const BTN_SIZE = IS_SE ? 40 : IS_SMALL ? 44 : 48;
const ICON_FS = fs(18);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0F1F' },

  headerWrap: { position: 'absolute', top: 66, left: 16, right: 16, alignItems: 'center', zIndex: 10 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(15, 43, 39, 0.83)',
    borderRadius: 16,
    paddingHorizontal: IS_SE ? 14 : 18,
    paddingVertical: IS_SE ? 6 : IS_SMALL ? 8 : 10,
    borderWidth: 2,
    borderColor: '#FFD43B',
  },
  mintDot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: '#8AF3C4',
  },
  headerText: { color: '#fff', fontSize: fs(16), fontWeight: '800' },

  controlsWrap: {
    position: 'absolute',
    top: 0, bottom: 0, right: IS_SE ? 8 : IS_SMALL ? 10 : 12,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingVertical: 16,
    zIndex: 10,
  },
  controlsCol: {
    backgroundColor: 'rgba(8, 22, 30, 0.43)',
    borderRadius: 18,
    padding: IS_SE ? 6 : IS_SMALL ? 8 : 10,
    borderWidth: 1,
    borderColor: '#1b3b4f',
    alignItems: 'center',
    gap: IS_SE ? 6 : IS_SMALL ? 8 : 10,
  },
  ctrlBtn: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8af3c4b1',
    backgroundColor: '#0f2b2782',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctrlTxt: { color: '#8af3c4b1', fontSize: ICON_FS, fontWeight: '800' },

  centerOverlay: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    zIndex: 20,
  },
  centerCard: {
    width: '92%',
    maxWidth: 520,
    backgroundColor: 'rgba(12,28,40,0.98)',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: WHITE,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
      android: { elevation: 8 },
    }),
  },
  cardImg: { width: '100%', height: IS_SE ? 110 : IS_SMALL ? 140 : 160, resizeMode: 'cover' },
  cardBody: { padding: IS_SE ? 12 : 14 },
  title: { color: '#fff', fontSize: fs(18), fontWeight: '800', marginBottom: 4 },
  desc: { color: '#d8e9f3', fontSize: fs(13), marginBottom: 6 },
  addr: { color: '#cfe3ee', fontSize: fs(13), marginBottom: 4 },
  coords: { color: '#9dc6d8', fontSize: fs(12) },

  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: IS_SE ? 8 : 10, marginTop: 12 },
  iconBtn: {
    width: IS_SE ? 42 : IS_SMALL ? 44 : 48,
    height: IS_SE ? 38 : IS_SMALL ? 40 : 44,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8af3c4b1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconBtnActive: { backgroundColor: '#8af3c4b1' },
  icon: { width: IS_SE ? 18 : IS_SMALL ? 20 : 22, height: IS_SE ? 18 : IS_SMALL ? 20 : 22, resizeMode: 'contain' },

  closeBtn: {
    height: IS_SE ? 38 : IS_SMALL ? 40 : 44,
    paddingHorizontal: IS_SE ? 12 : 14,
    borderRadius: 12,
    backgroundColor: '#8af3c4b1',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  closeTxt: { color: '#0A0F1F', fontWeight: '800' },
});
