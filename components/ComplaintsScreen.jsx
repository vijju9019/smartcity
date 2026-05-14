import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from 'platform-hooks';
import {
  PRIMARY, SECONDARY, CARD, SUCCESS, WARNING, TEXT, TEXT2, BORDER,
  TAB_MENU_HEIGHT, SCROLL_EXTRA_PADDING, WEB_TAB_MENU_PADDING, FAB_SPACING,
  useApp, SEED_COMPLAINTS, ComplaintCard, styles,
} from './core';
import { Platform } from 'react-native';

export default function ComplaintsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { theme = { bg: '#0F172A', card: '#1E293B' }, role = 'resident' } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const complaintsQ = useQuery('complaints');
  const allComplaints = useMemo(() => {
    const dbData = complaintsQ.data || [];
    const seedIds = new Set(dbData.map(c => c.id));
    return [...dbData, ...SEED_COMPLAINTS.filter(c => !seedIds.has(c.id))];
  }, [complaintsQ.data]);
  const filtered = useMemo(() => {
    let list = allComplaints;
    if (filter !== 'all') list = list.filter(c => c.status === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.location.toLowerCase().includes(q));
    }
    return list.sort((a, b) => b.created_at - a.created_at);
  }, [allComplaints, filter, search]);

  const scrollBottom = Platform.OS === 'web' ? WEB_TAB_MENU_PADDING : TAB_MENU_HEIGHT + insets.bottom + SCROLL_EXTRA_PADDING;
  const fabBottom = Platform.OS === 'web' ? WEB_TAB_MENU_PADDING : TAB_MENU_HEIGHT + insets.bottom + FAB_SPACING;
  const FILTERS = [
    { key: 'all', label: 'All', color: PRIMARY },
    { key: 'pending', label: 'Pending', color: WARNING },
    { key: 'in_progress', label: 'In Progress', color: SECONDARY },
    { key: 'resolved', label: 'Resolved', color: SUCCESS },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ paddingTop: insets.top + 12, paddingBottom: 14, paddingHorizontal: 20, backgroundColor: theme.bg, borderBottomWidth: 1, borderBottomColor: BORDER }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ color: TEXT, fontSize: 20, fontWeight: 'bold' }}>My Complaints</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('MapView')}
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: PRIMARY + '22', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: PRIMARY + '44' }}
          >
            <MaterialIcons name="map" size={18} color={PRIMARY} />
            <Text style={{ color: PRIMARY, fontSize: 13, fontWeight: 'bold', marginLeft: 6 }}>Map View</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: BORDER }}>
          <MaterialIcons name="search" size={20} color={TEXT2} />
          <TextInput value={search} onChangeText={setSearch} placeholder="Search complaints..." placeholderTextColor={TEXT2} style={{ flex: 1, paddingVertical: 12, paddingLeft: 10, color: TEXT, fontSize: 14 }} />
        </View>
      </View>
      {/* Filter tabs */}
      <View style={{ flexDirection: 'row', backgroundColor: theme.bg, borderBottomWidth: 1, borderBottomColor: BORDER, paddingHorizontal: 16, paddingVertical: 10 }}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f.key} onPress={() => setFilter(f.key)} style={{ backgroundColor: filter === f.key ? f.color : CARD, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: filter === f.key ? f.color : BORDER }}>
            <Text style={{ color: filter === f.key ? '#fff' : TEXT2, fontSize: 13, fontWeight: filter === f.key ? '700' : '400' }}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <View style={{ paddingHorizontal: 16, paddingTop: index === 0 ? 16 : 0 }}>
            <ComplaintCard complaint={item} onPress={() => navigation.navigate('ComplaintDetail', { complaintId: item.id })} />
          </View>
        )}
        contentContainerStyle={{ paddingBottom: scrollBottom }}
        ListEmptyComponent={() => (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <MaterialIcons name="inbox" size={56} color={TEXT2} />
            <Text style={{ color: TEXT2, fontSize: 16, marginTop: 12 }}>No complaints found</Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
      {role !== 'admin' && (
        <TouchableOpacity onPress={() => navigation.navigate('RaiseComplaint')} style={[styles.fab, { bottom: fabBottom, backgroundColor: PRIMARY }]}>
          <MaterialIcons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}
