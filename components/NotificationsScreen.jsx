import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Dimensions } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PRIMARY, ACCENT, BG, CARD, SUCCESS, WARNING, DANGER, SECONDARY, TEXT, TEXT2, BORDER, NOTIFS, formatTime } from './core';

const TYPE_ICONS = { update: 'update', emergency: 'emergency', announcement: 'campaign', resolved: 'check-circle', ai: 'psychology' };
const TYPE_COLORS = { update: SECONDARY, emergency: DANGER, announcement: ACCENT, resolved: SUCCESS, ai: ACCENT };

export default function NotificationsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [readMap, setReadMap] = useState(NOTIFS.reduce((acc, n) => { acc[n.id] = n.read; return acc; }, {}));
  const scrollH = Dimensions.get('window').height - insets.top - 60;

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <View style={{ paddingTop: insets.top + 8, paddingBottom: 14, paddingHorizontal: 20, backgroundColor: BG, borderBottomWidth: 1, borderBottomColor: BORDER, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 14 }}>
          <MaterialIcons name="arrow-back" size={24} color={TEXT} />
        </TouchableOpacity>
        <Text style={{ flex: 1, color: TEXT, fontSize: 18, fontWeight: 'bold' }}>Notifications</Text>
        <TouchableOpacity onPress={() => setReadMap(NOTIFS.reduce((acc, n) => { acc[n.id] = true; return acc; }, {}))}>
          <Text style={{ color: PRIMARY, fontSize: 13 }}>Mark all read</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {NOTIFS.map(n => {
          const isRead = readMap[n.id];
          const tc = TYPE_COLORS[n.type] || PRIMARY;
          const ti = TYPE_ICONS[n.type] || 'notifications';
          return (
            <TouchableOpacity key={n.id} onPress={() => setReadMap(p => ({ ...p, [n.id]: true }))} style={{ backgroundColor: CARD, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: isRead ? BORDER : tc + '44', flexDirection: 'row', alignItems: 'flex-start', opacity: isRead ? 0.7 : 1 }}>
              <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: tc + '22', justifyContent: 'center', alignItems: 'center', marginRight: 14 }}>
                <MaterialIcons name={ti} size={22} color={tc} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ color: TEXT, fontSize: 14, fontWeight: '700', flex: 1 }}>{n.title}</Text>
                  {!isRead && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: tc, marginLeft: 6 }} />}
                </View>
                <Text style={{ color: TEXT2, fontSize: 13, lineHeight: 20 }}>{n.body}</Text>
                <Text style={{ color: TEXT2, fontSize: 11, marginTop: 6 }}>{formatTime(n.time)}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
