import React, { useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
  Share,
  Dimensions,
  Animated,
  Easing,
  FlatList,
  Image,
} from 'react-native';

const BG = require('../assets/background.png');
const ICON_SHARE = require('../assets/ic_share.png');

type Note = { id: string; title: string; desc: string };

const { width, height } = Dimensions.get('window');
const IS_SMALL = height < 700 || width < 360;
const IS_SE = height <= 667 || width <= 320;
const fs = (n: number) => (IS_SE ? n - 2 : IS_SMALL ? n - 1 : n);

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
};

const DATA: Note[] = [
  { id: 'n1',  title: 'Niagara Falls moves slowly upstream', desc: 'Erosion causes the falls to retreat about 30 centimeters each year.' },
  { id: 'n2',  title: 'More than half the water flows over Horseshoe Falls', desc: 'This section carries the greatest volume and power of the entire system.' },
  { id: 'n3',  title: 'The mist creates its own microclimate', desc: 'Constant moisture supports unique plants and cooler air near the river.' },
  { id: 'n4',  title: 'Niagara Falls never completely freeze', desc: 'Even in winter, the water keeps moving due to its immense volume.' },
  { id: 'n5',  title: 'The river drops over 50 meters in height', desc: 'This rapid change creates the sound and mist felt far beyond the falls.' },
  { id: 'n6',  title: 'Mist can travel several kilometers', desc: 'On windy days, fine water particles reach surrounding parks and streets.' },
  { id: 'n7',  title: 'Niagara Gorge reveals ancient rock layers', desc: 'Some formations exposed here are more than 400 million years old.' },
  { id: 'n8',  title: 'Ice bridges once formed naturally', desc: 'Before regulation, thick ice sometimes spanned the river above the falls.' },
  { id: 'n9',  title: 'Water flow is partially controlled at night', desc: 'Diversions help generate hydroelectric power while preserving the falls.' },
  { id: 'n10', title: 'Rainbows appear most often in the afternoon', desc: 'The sun’s position and persistent mist create ideal conditions for refraction.' },
];

function NoteCard({
  note,
  index,
  onShare,
}: {
  note: Note;
  index: number;
  onShare: (n: Note) => void;
}) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 360,
      delay: 80 * index,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [v, index]);

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
      <View style={styles.row}>
        <Pressable
          onPress={() => onShare(note)}
          style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.92 }]}
          hitSlop={8}
        >
          <Image source={ICON_SHARE} style={styles.shareIcon} />
        </Pressable>

        <View style={styles.textCol}>
          <Text style={styles.cardTitle} numberOfLines={2}>{note.title}</Text>
          <Text style={styles.cardDesc} numberOfLines={3}>{note.desc}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function NatureNotesScreen() {
  const items = useMemo(() => DATA, []);
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fade, slide]);

  const onShare = async (n: Note) => {
    try { await Share.share({ message: `${n.title}\n\n${n.desc}` }); } catch {}
  };

  return (
    <ImageBackground source={BG} style={styles.root} resizeMode="cover">
      <View style={styles.headerWrap}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Nature Notes</Text>
        </View>
      </View>

      <Animated.View style={[styles.content, { opacity: fade, transform: [{ translateY: slide }] }]}>
        <FlatList
          data={items}
          keyExtractor={(n) => n.id}
          renderItem={({ item, index }) => (
            <NoteCard note={item} index={index} onShare={onShare} />
          )}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
    </ImageBackground>
  );
}

const BTN = {
  size: IS_SE ? 46 : IS_SMALL ? 50 : 54,
  icon: IS_SE ? 18 : IS_SMALL ? 20 : 22,
};

const styles = StyleSheet.create({
  root: { flex: 1 },

  headerWrap: { position: 'absolute', top: 66, left: 16, right: 16, zIndex: 2, alignItems: 'center' },
  header: {
    backgroundColor: PALETTE.chipBg,
    borderRadius: 16,
    paddingHorizontal: IS_SE ? 14 : 18,
    paddingVertical: IS_SE ? 6 : IS_SMALL ? 8 : 10,
    borderWidth: 2,
    borderColor: PALETTE.gold,
  },
  headerText: { color: PALETTE.textPrimary, fontSize: fs(16), fontWeight: '800' },

  content: { flex: 1, paddingTop: 66 + (IS_SE ? 42 : IS_SMALL ? 48 : 54) + 12, paddingHorizontal: 14 },
  listContent: { paddingBottom: 44 + 80 },

  card: {
    backgroundColor: PALETTE.cardBg,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: PALETTE.cardBorder,
    padding: 12,
  },

  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },

  shareBtn: {
    width: BTN.size,
    height: BTN.size,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: PALETTE.gold,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareIcon: { width: BTN.icon, height: BTN.icon, tintColor: PALETTE.gold, resizeMode: 'contain' },

  textCol: { flex: 1 },
  cardTitle: { color: PALETTE.textPrimary, fontWeight: '800', fontSize: fs(18), marginBottom: 6 },
  cardDesc: { color: PALETTE.textSecondary, fontSize: fs(14), lineHeight: 20 },
});
