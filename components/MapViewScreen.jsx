import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from 'platform-hooks';
import { useMaps } from 'platform-hooks';
import { PRIMARY, SECONDARY, BG, CARD, SUCCESS, WARNING, DANGER, TEXT, TEXT2, BORDER, SEED_COMPLAINTS, getPriorityColor, getStatusLabel } from './core';

export default function MapViewScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [mapFilter, setMapFilter] = useState('all');
  const complaintsQ = useQuery('complaints');
  const allComplaints = useMemo(() => (complaintsQ.data?.length > 0 ? complaintsQ.data : SEED_COMPLAINTS), [complaintsQ.data]);
  const { MapView, Marker, mapRef, region, setRegion, isAvailable } = useMaps({ latitude: 12.9716, longitude: 77.5946, latitudeDelta: 0.03, longitudeDelta: 0.03 });
  const filteredMarkers = useMemo(() => {
    const withCoords = allComplaints.filter(c => c.lat && c.lng);
    return mapFilter === 'all' ? withCoords : withCoords.filter(c => c.status === mapFilter);
  }, [allComplaints, mapFilter]);
  const mapH = Dimensions.get('window').height - insets.top - 160;
  const FILTERS = [{ key: 'all', label: 'All', color: PRIMARY }, { key: 'pending', label: 'Pending', color: WARNING }, { key: 'in_progress', label: 'Active', color: SECONDARY }, { key: 'resolved', label: 'Resolved', color: SUCCESS }];

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <View style={{ paddingTop: insets.top + 8, paddingBottom: 14, paddingHorizontal: 20, backgroundColor: BG, borderBottomWidth: 1, borderBottomColor: BORDER, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 14 }}>
          <MaterialIcons name="arrow-back" size={24} color={TEXT} />
        </TouchableOpacity>
        <Text style={{ color: TEXT, fontSize: 18, fontWeight: 'bold' }}>Complaint Map</Text>
      </View>
      <ScrollView horizontal style={{ flexGrow: 0, backgroundColor: BG, borderBottomWidth: 1, borderBottomColor: BORDER }} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }} showsHorizontalScrollIndicator={false}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f.key} onPress={() => setMapFilter(f.key)} style={{ backgroundColor: mapFilter === f.key ? f.color : CARD, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8, borderWidth: 1, borderColor: mapFilter === f.key ? f.color : BORDER }}>
            <Text style={{ color: mapFilter === f.key ? '#fff' : TEXT2, fontSize: 12 }}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {isAvailable ? (
        <View style={{ height: mapH, margin: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: BORDER }}>
          <MapView ref={mapRef} provider="google" style={{ flex: 1 }} region={region} onRegionChangeComplete={setRegion} showsUserLocation>
            {filteredMarkers.map(c => (
              <Marker key={c.id} coordinate={{ latitude: c.lat, longitude: c.lng }} title={c.title} description={getStatusLabel(c.status) + ' · ' + c.priority.toUpperCase()} pinColor={getPriorityColor(c.priority)} />
            ))}
          </MapView>
        </View>
      ) : (
        <View style={{ margin: 16, height: mapH, backgroundColor: CARD, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: BORDER }}>
          <MaterialCommunityIcons name="map-marker-multiple" size={60} color={TEXT2} />
          <Text style={{ color: TEXT2, fontSize: 16, marginTop: 12 }}>Map Preview</Text>
          <Text style={{ color: TEXT2, fontSize: 13, marginTop: 6, textAlign: 'center', paddingHorizontal: 30 }}>{filteredMarkers.length} complaint markers would appear here on device</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 16 }}>
            {filteredMarkers.map(c => (
              <View key={c.id} style={{ backgroundColor: getPriorityColor(c.priority) + '22', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, margin: 4, flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="location-on" size={13} color={getPriorityColor(c.priority)} />
                <Text style={{ color: TEXT, fontSize: 11, marginLeft: 4 }} numberOfLines={1}>{c.title.slice(0, 20)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
