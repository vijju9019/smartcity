import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, ActivityIndicator, Image } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'platform-hooks';
import { 
  PRIMARY, ACCENT, BG, CARD, SUCCESS, WARNING, DANGER, SECONDARY, TEXT, TEXT2, BORDER, 
  SEED_COMPLAINTS, getPriorityColor, getStatusLabel, formatTime 
} from './core';

export default function MyTasksScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('assigned');
  
  // Simulation: We are logged in as Worker "w1" (Electrician/Plumber)
  const workerId = 'w1'; 
  
  const complaintsQ = useQuery('complaints');
  const { mutate: updateStatus } = useMutation('complaints', 'update');
  
  const allComplaints = useMemo(() => (complaintsQ.data?.length > 0 ? complaintsQ.data : SEED_COMPLAINTS), [complaintsQ.data]);
  
  const myTasks = useMemo(() => {
    // Filter by worker_id and tab status
    const assignedToMe = allComplaints.filter(c => c.worker_id === workerId);
    if (activeTab === 'assigned') return assignedToMe.filter(c => c.status === 'pending');
    if (activeTab === 'active') return assignedToMe.filter(c => c.status === 'in_progress');
    if (activeTab === 'completed') return assignedToMe.filter(c => c.status === 'resolved');
    return assignedToMe;
  }, [allComplaints, activeTab, workerId]);

  const handleUpdateStatus = (id, newStatus) => {
    updateStatus({ id, data: { status: newStatus, updated_at: Date.now() } });
  };

  const TABS = [
    { key: 'assigned', label: 'Assigned', icon: 'assignment' },
    { key: 'active', label: 'Active', icon: 'engineering' },
    { key: 'completed', label: 'Done', icon: 'check-circle' }
  ];

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 8, paddingBottom: 16, paddingHorizontal: 20, backgroundColor: BG, borderBottomWidth: 1, borderBottomColor: BORDER }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <View>
            <Text style={{ color: TEXT, fontSize: 22, fontWeight: 'bold' }}>Worker Portal</Text>
            <Text style={{ color: TEXT2, fontSize: 13 }}>Logged in as: John Doe (Electrician)</Text>
          </View>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: PRIMARY + '22', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: PRIMARY + '44' }}>
            <MaterialIcons name="engineering" size={24} color={PRIMARY} />
          </View>
        </View>

        {/* Custom Tab Bar */}
        <View style={{ flexDirection: 'row', backgroundColor: CARD, borderRadius: 16, padding: 4, borderWidth: 1, borderColor: BORDER }}>
          {TABS.map(t => (
            <TouchableOpacity 
              key={t.key} 
              onPress={() => setActiveTab(t.key)}
              style={{ 
                flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
                paddingVertical: 10, borderRadius: 12,
                backgroundColor: activeTab === t.key ? PRIMARY : 'transparent'
              }}
            >
              <MaterialIcons name={t.icon} size={18} color={activeTab === t.key ? '#fff' : TEXT2} />
              <Text style={{ color: activeTab === t.key ? '#fff' : TEXT2, fontSize: 13, fontWeight: 'bold', marginLeft: 6 }}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {myTasks.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <MaterialCommunityIcons name="clipboard-check-outline" size={80} color={BORDER} />
            <Text style={{ color: TEXT2, fontSize: 16, fontWeight: 'bold', marginTop: 16 }}>No tasks found</Text>
            <Text style={{ color: TEXT2, fontSize: 13, marginTop: 4 }}>You're all caught up for now!</Text>
          </View>
        ) : (
          myTasks.map(task => (
            <View key={task.id} style={{ backgroundColor: CARD, borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: BORDER }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: getPriorityColor(task.priority), marginRight: 8 }} />
                    <Text style={{ color: TEXT, fontSize: 16, fontWeight: 'bold' }}>{task.title}</Text>
                  </View>
                  <Text style={{ color: TEXT2, fontSize: 13 }}>ID: #{task.id} · {formatTime(task.created_at)}</Text>
                </View>
                <View style={{ backgroundColor: getPriorityColor(task.priority) + '15', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: getPriorityColor(task.priority) + '33' }}>
                  <Text style={{ color: getPriorityColor(task.priority), fontSize: 11, fontWeight: 'bold' }}>{task.priority.toUpperCase()}</Text>
                </View>
              </View>

              <View style={{ backgroundColor: BG, borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: BORDER }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <MaterialIcons name="location-on" size={16} color={PRIMARY} />
                  <Text style={{ color: TEXT, fontSize: 14, marginLeft: 6, fontWeight: '600' }}>{task.location}</Text>
                </View>
                <Text style={{ color: TEXT2, fontSize: 14, lineHeight: 20 }}>{task.description}</Text>
              </View>

              {activeTab === 'assigned' && (
                <TouchableOpacity 
                  onPress={() => handleUpdateStatus(task.id, 'in_progress')}
                  style={{ backgroundColor: PRIMARY, borderRadius: 12, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                >
                  <MaterialIcons name="play-arrow" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>Accept & Start Work</Text>
                </TouchableOpacity>
              )}

              {activeTab === 'active' && (
                <TouchableOpacity 
                  onPress={() => handleUpdateStatus(task.id, 'resolved')}
                  style={{ backgroundColor: SUCCESS, borderRadius: 12, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                >
                  <MaterialIcons name="check" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>Mark as Resolved</Text>
                </TouchableOpacity>
              )}

              {activeTab === 'completed' && (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8 }}>
                  <MaterialIcons name="check-circle" size={20} color={SUCCESS} />
                  <Text style={{ color: SUCCESS, fontSize: 14, fontWeight: 'bold', marginLeft: 8 }}>Task Completed Successfully</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Floating Action for Support */}
      <TouchableOpacity style={{ position: 'absolute', bottom: 30, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: SECONDARY, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 8 }}>
        <MaterialIcons name="headset-mic" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
