import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Platform, ActivityIndicator } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PRIMARY, BG, CARD, TEXT, TEXT2, BORDER, ACCENT, SUCCESS, WARNING, SECONDARY, DANGER, useApp } from './core';

export default function ColonyEventsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { theme = { bg: '#0F172A', card: '#1E293B' }, userName } = useApp();
  const [activeTab, setActiveTab] = useState('community');
  
  // State for dynamic lists
  const [events, setEvents] = useState([
    { id: '1', title: 'Independence Day Celebration', date: 'Aug 15, 2026', location: 'Central Park', type: 'community', owner: 'RWA Admin', icon: 'flag', color: PRIMARY },
  ]);
  const [functions, setFunctions] = useState([
    { id: 'f1', title: 'Birthday Celebration', flat: 'A-204', owner: 'Rahul Sharma', time: 'Tonight, 7:00 PM', icon: 'cake', color: ACCENT },
  ]);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventFlat, setEventFlat] = useState('');

  const handleCreateEvent = () => {
    if (!eventName || !eventDate || !eventLocation) return;
    
    setLoading(true);
    setTimeout(() => {
      const newEntry = {
        id: Date.now().toString(),
        title: eventName,
        date: eventDate,
        location: eventLocation,
        flat: activeTab === 'private' ? eventFlat : undefined,
        owner: userName,
        time: activeTab === 'private' ? eventDate : undefined,
        icon: activeTab === 'community' ? 'event' : 'celebration',
        color: activeTab === 'community' ? PRIMARY : SUCCESS,
      };

      if (activeTab === 'community') {
        setEvents([newEntry, ...events]);
      } else {
        setFunctions([newEntry, ...functions]);
      }

      // Reset form
      setEventName('');
      setEventDate('');
      setEventLocation('');
      setEventFlat('');
      setLoading(false);
      setShowModal(false);
    }, 1200);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 12, paddingBottom: 14, paddingHorizontal: 20, backgroundColor: theme.bg, borderBottomWidth: 1, borderBottomColor: BORDER, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15 }}>
            <MaterialIcons name="arrow-back" size={24} color={TEXT} />
          </TouchableOpacity>
          <Text style={{ color: TEXT, fontSize: 18, fontWeight: 'bold' }}>Colony Happenings 🗓️</Text>
        </View>
        <TouchableOpacity 
          onPress={() => setShowModal(true)}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: PRIMARY, justifyContent: 'center', alignItems: 'center' }}
        >
          <MaterialIcons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Tab Selector */}
        <View style={{ flexDirection: 'row', padding: 16, backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: BORDER }}>
          <TouchableOpacity 
            onPress={() => setActiveTab('community')}
            style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: activeTab === 'community' ? PRIMARY : 'transparent' }}
          >
            <Text style={{ color: activeTab === 'community' ? PRIMARY : TEXT2, fontSize: 14, fontWeight: 'bold' }}>Community Events</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('private')}
            style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: activeTab === 'private' ? PRIMARY : 'transparent' }}
          >
            <Text style={{ color: activeTab === 'private' ? PRIMARY : TEXT2, fontSize: 14, fontWeight: 'bold' }}>Private Functions</Text>
          </TouchableOpacity>
        </View>

        <View style={{ padding: 16 }}>
          {activeTab === 'community' ? (
            <>
              <Text style={{ color: TEXT2, fontSize: 12, fontWeight: 'bold', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 }}>Upcoming Community Events</Text>
              {events.map(event => (
                <View key={event.id} style={{ backgroundColor: CARD, borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: BORDER }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: event.color + '22', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                      <MaterialIcons name={event.icon} size={24} color={event.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: TEXT, fontSize: 16, fontWeight: 'bold' }}>{event.title}</Text>
                      <Text style={{ color: TEXT2, fontSize: 13 }}>{event.date} · {event.location}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 12 }}>
                    <Text style={{ color: TEXT2, fontSize: 12 }}>Posted by: <Text style={{ color: PRIMARY, fontWeight: '600' }}>{event.owner}</Text></Text>
                    <TouchableOpacity style={{ backgroundColor: PRIMARY + '11', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                      <Text style={{ color: PRIMARY, fontSize: 12, fontWeight: 'bold' }}>RSVP</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </>
          ) : (
            <>
              <Text style={{ color: TEXT2, fontSize: 12, fontWeight: 'bold', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 }}>Private Functions & Log</Text>
              {functions.map(func => (
                <View key={func.id} style={{ backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: BORDER, flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: func.color + '22', justifyContent: 'center', alignItems: 'center', marginRight: 15 }}>
                    <MaterialIcons name={func.icon} size={24} color={func.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: TEXT, fontSize: 15, fontWeight: 'bold' }}>{func.title}</Text>
                    <Text style={{ color: TEXT2, fontSize: 13, marginTop: 2 }}>{func.flat || 'Unit TBA'} · {func.owner}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                      <MaterialIcons name="schedule" size={14} color={TEXT2} />
                      <Text style={{ color: TEXT2, fontSize: 12, marginLeft: 4 }}>{func.time || func.date}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </>
          )}

          {events.length === 0 && functions.length === 0 && (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <MaterialIcons name="event-busy" size={64} color={BORDER} />
              <Text style={{ color: TEXT2, fontSize: 16, marginTop: 16 }}>No events scheduled yet.</Text>
              <TouchableOpacity onPress={() => setShowModal(true)} style={{ marginTop: 10 }}>
                <Text style={{ color: PRIMARY, fontWeight: 'bold' }}>+ Create the first one</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Create Event Modal */}
      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: CARD, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: BORDER }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: TEXT, fontSize: 20, fontWeight: 'bold' }}>Create New {activeTab === 'community' ? 'Event' : 'Function'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <MaterialIcons name="close" size={24} color={TEXT2} />
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: TEXT2, fontSize: 13, marginBottom: 8 }}>{activeTab === 'community' ? 'Event' : 'Function'} Name</Text>
              <TextInput 
                value={eventName}
                onChangeText={setEventName}
                placeholder="e.g. Yoga Session or Birthday"
                placeholderTextColor={TEXT2 + '88'}
                style={{ backgroundColor: BG, borderRadius: 12, padding: 12, color: TEXT, borderWidth: 1, borderColor: BORDER }}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: TEXT2, fontSize: 13, marginBottom: 8 }}>Date & Time</Text>
              <TextInput 
                value={eventDate}
                onChangeText={setEventDate}
                placeholder="e.g. Aug 15, 6:00 PM"
                placeholderTextColor={TEXT2 + '88'}
                style={{ backgroundColor: BG, borderRadius: 12, padding: 12, color: TEXT, borderWidth: 1, borderColor: BORDER }}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: TEXT2, fontSize: 13, marginBottom: 8 }}>Location {activeTab === 'private' ? '(Flat #)' : ''}</Text>
              <TextInput 
                value={eventLocation}
                onChangeText={setEventLocation}
                placeholder={activeTab === 'community' ? "e.g. Central Park" : "e.g. Block A - 204"}
                placeholderTextColor={TEXT2 + '88'}
                style={{ backgroundColor: BG, borderRadius: 12, padding: 12, color: TEXT, borderWidth: 1, borderColor: BORDER }}
              />
            </View>

            <TouchableOpacity 
              onPress={handleCreateEvent}
              disabled={loading || !eventName || !eventDate || !eventLocation}
              style={{ backgroundColor: PRIMARY, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 10, opacity: (loading || !eventName || !eventDate || !eventLocation) ? 0.6 : 1 }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Post to Community</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
