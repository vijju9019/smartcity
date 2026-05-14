import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Platform, TextInput } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMaps } from 'platform-hooks';
import { PRIMARY, SECONDARY, BG, CARD, SUCCESS, WARNING, DANGER, TEXT, TEXT2, BORDER, SEED_COMPLAINTS, getPriorityColor, getStatusLabel, useApp } from './core';

export default function MapViewScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { role } = useApp();
  const [mapFilter, setMapFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapType, setMapType] = useState('hybrid'); 
  
  const complaintsQ = useQuery('complaints');
  const allComplaints = useMemo(() => (complaintsQ.data?.length > 0 ? complaintsQ.data : SEED_COMPLAINTS), [complaintsQ.data]);
  
  // Initial region centered on Entire Bangalore City
  // Zoom level set to 0.15 to capture the major city sprawl
  const { MapView, Marker, mapRef, region, setRegion, isAvailable } = useMaps({ 
    latitude: 12.9716, 
    longitude: 77.5946, 
    latitudeDelta: 0.15, 
    longitudeDelta: 0.15 
  });

  const filteredMarkers = useMemo(() => {
    const withCoords = allComplaints.filter(c => c.lat && c.lng);
    return mapFilter === 'all' ? withCoords : withCoords.filter(c => c.status === mapFilter);
  }, [allComplaints, mapFilter]);

  const mapH = Dimensions.get('window').height - insets.top - 160;
  const FILTERS = [{ key: 'all', label: 'All Issues', color: PRIMARY }, { key: 'pending', label: 'Pending', color: WARNING }, { key: 'in_progress', label: 'Active', color: SECONDARY }, { key: 'resolved', label: 'Resolved', color: SUCCESS }];

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView style={{ flex: 1 }} stickyHeaderIndices={[0]} showsVerticalScrollIndicator={true} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={{ paddingTop: insets.top + 8, paddingBottom: 14, paddingHorizontal: 20, backgroundColor: BG, borderBottomWidth: 1, borderBottomColor: BORDER, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 14, width: 40, height: 40, borderRadius: 20, backgroundColor: CARD, justifyContent: 'center', alignItems: 'center' }}>
              <MaterialIcons name="arrow-back" size={24} color={TEXT} />
            </TouchableOpacity>
            <Text style={{ color: TEXT, fontSize: 18, fontWeight: 'bold' }}>Bangalore City Pulse</Text>
          </View>
          
          <TouchableOpacity 
            onPress={() => setMapType(mapType === 'hybrid' ? 'standard' : 'hybrid')}
            style={{ backgroundColor: mapType === 'hybrid' ? PRIMARY : CARD, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: mapType === 'hybrid' ? PRIMARY : BORDER, flexDirection: 'row', alignItems: 'center' }}
          >
            <MaterialIcons name="layers" size={18} color={mapType === 'hybrid' ? '#fff' : TEXT2} />
            <Text style={{ color: mapType === 'hybrid' ? '#fff' : TEXT2, fontSize: 12, fontWeight: 'bold', marginLeft: 6 }}>Satellite</Text>
          </TouchableOpacity>
        </View>

        {/* Search & Global Controls */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: BG }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 16, paddingHorizontal: 12, borderWidth: 1, borderColor: BORDER, marginBottom: 12 }}>
            <MaterialIcons name="location-city" size={22} color={PRIMARY} />
            <TextInput 
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search Bangalore areas (e.g. HSR, Whitefield)..."
              placeholderTextColor={TEXT2 + '88'}
              style={{ flex: 1, color: TEXT, fontSize: 15, paddingVertical: 12, paddingHorizontal: 10 }}
              onSubmitEditing={() => searchQuery && setRegion({ ...region, searchQuery })}
            />
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity 
                onPress={() => setRegion({ latitude: 12.9716, longitude: 77.5946, latitudeDelta: 0.2, longitudeDelta: 0.2 })}
                style={{ backgroundColor: PRIMARY + '22', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, marginRight: 8, borderWidth: 1, borderColor: PRIMARY + '44' }}
              >
                <Text style={{ color: PRIMARY, fontSize: 13, fontWeight: 'bold' }}>Entire City</Text>
              </TouchableOpacity>
              {['HSR Layout', 'Whitefield', 'Electronic City', 'Indiranagar', 'Jayanagar'].map(city => (
                <TouchableOpacity 
                  key={city}
                  onPress={() => {
                    setSearchQuery(city);
                    setRegion({ ...region, searchQuery: city });
                  }}
                  style={{ backgroundColor: CARD, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, marginRight: 8, borderWidth: 1, borderColor: BORDER }}
                >
                  <Text style={{ color: TEXT2, fontSize: 13 }}>{city}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8 }}>
          {FILTERS.map(f => (
            <TouchableOpacity 
              key={f.key} 
              onPress={() => setMapFilter(f.key)} 
              style={{ 
                backgroundColor: mapFilter === f.key ? f.color : CARD, 
                borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, 
                marginRight: 8, borderWidth: 1, borderColor: mapFilter === f.key ? f.color : BORDER 
              }}
            >
              <Text style={{ color: mapFilter === f.key ? '#fff' : TEXT2, fontSize: 13, fontWeight: '600' }}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {isAvailable ? (
          <View style={{ height: mapH * 0.75, margin: 16, borderRadius: 24, overflow: 'hidden', borderWidth: 2, borderColor: BORDER, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 }}>
            <MapView 
              ref={mapRef} 
              provider="google" 
              mapType={mapType} 
              style={{ flex: 1 }} 
              region={region} 
              onRegionChangeComplete={setRegion} 
              showsUserLocation
              showsBuildings={true}
              showsTraffic={true}
            >
              {filteredMarkers.map(c => (
                <Marker 
                  key={c.id} 
                  coordinate={{ latitude: c.lat, longitude: c.lng }} 
                  title={c.title} 
                  description={`${getStatusLabel(c.status)} · ${c.priority.toUpperCase()}`} 
                  pinColor={getPriorityColor(c.priority)} 
                />
              ))}
            </MapView>
          </View>
        ) : (
          <View style={{ margin: 16, height: mapH * 0.75, backgroundColor: CARD, borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: BORDER, borderStyle: 'dashed' }}>
            <MaterialCommunityIcons name="map-marker-path" size={80} color={PRIMARY + '44'} />
            <Text style={{ color: TEXT, fontSize: 18, fontWeight: 'bold', marginTop: 16 }}>Bangalore City Grid</Text>
            <Text style={{ color: TEXT2, fontSize: 14, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }}>Full city infrastructure view enabled.</Text>
          </View>
        )}

        <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
          <View style={{ backgroundColor: PRIMARY + '15', borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: PRIMARY + '33' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <MaterialIcons name="info" size={20} color={PRIMARY} />
              <Text style={{ color: PRIMARY, fontSize: 16, fontWeight: 'bold', marginLeft: 10 }}>City Statistics</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ color: TEXT, fontSize: 22, fontWeight: 'bold' }}>{allComplaints.length}</Text>
                <Text style={{ color: TEXT2, fontSize: 12 }}>Total Reports</Text>
              </View>
              <View style={{ width: 1, backgroundColor: BORDER, marginHorizontal: 20 }} />
              <View>
                <Text style={{ color: SUCCESS, fontSize: 22, fontWeight: 'bold' }}>{allComplaints.filter(c => c.status === 'resolved').length}</Text>
                <Text style={{ color: TEXT2, fontSize: 12 }}>Resolved City-wide</Text>
              </View>
            </View>
          </View>

          {/* Report Issue - Only for Residents and Admins */}
          {role !== 'worker' && (
            <TouchableOpacity 
              onPress={() => navigation.navigate('RaiseComplaint', { lat: region.latitude, lng: region.longitude })}
              style={{ backgroundColor: PRIMARY, borderRadius: 16, paddingVertical: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: PRIMARY, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6, marginBottom: 24 }}
            >
              <MaterialIcons name="add-location-alt" size={24} color="#fff" style={{ marginRight: 10 }} />
              <Text style={{ color: '#fff', fontSize: 17, fontWeight: 'bold' }}>Report Issue at this Building</Text>
            </TouchableOpacity>
          )}

          <View style={{ marginTop: 0 }}>
            <Text style={{ color: TEXT, fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Top City Concerns</Text>
            {filteredMarkers.slice(0, 5).map(c => (
              <TouchableOpacity 
                key={c.id} 
                onPress={() => navigation.navigate('ComplaintDetail', { complaintId: c.id })}
                style={{ backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: BORDER, flexDirection: 'row', alignItems: 'center' }}
              >
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: getPriorityColor(c.priority) + '15', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                  <MaterialCommunityIcons name="city-variant" size={24} color={getPriorityColor(c.priority)} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: TEXT, fontSize: 15, fontWeight: '700' }} numberOfLines={1}>{c.title}</Text>
                  <Text style={{ color: TEXT2, fontSize: 13 }} numberOfLines={1}>{c.location}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={BORDER} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
