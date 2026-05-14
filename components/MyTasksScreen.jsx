import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'platform-hooks';
import { 
  PRIMARY, ACCENT, BG, CARD, SUCCESS, WARNING, DANGER, SECONDARY, TEXT, TEXT2, BORDER, 
  SEED_COMPLAINTS, WORKERS, getPriorityColor, getStatusLabel, formatTime, getCategoryInfo, useApp 
} from './core';

// Worker-Specific Design System
const WORKER_BG = '#0F1115';
const WORKER_CARD = '#1A1D23';
const WORKER_PRIMARY = '#F59E0B'; 
const WORKER_SECONDARY = '#3B82F6'; 
const WORKER_SUCCESS = '#10B981'; 
const WORKER_DANGER = '#EF4444'; 
const WORKER_TEXT = '#E5E7EB';
const WORKER_TEXT2 = '#9CA3AF';
const WORKER_BORDER = '#2D333D';

export default function MyTasksScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { userName, role } = useApp();
  const [activeTab, setActiveTab] = useState('queue'); // Default to Queue
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Find worker ID based on name or fallback to 'w1' for demo
  const currentWorkerId = useMemo(() => {
    const worker = WORKERS.find(w => w.name === userName);
    return worker ? worker.id : 'w1';
  }, [userName]);
  
  const complaintsQ = useQuery('complaints');
  const { mutate: updateStatus } = useMutation('complaints', 'update');
  const allComplaints = useMemo(() => (complaintsQ.data?.length > 0 ? complaintsQ.data : SEED_COMPLAINTS), [complaintsQ.data]);
  
  const filteredTasks = useMemo(() => {
    if (activeTab === 'queue') {
      // "Raised Complaints" - All pending issues in the community that any worker can pick up
      return allComplaints.filter(c => c.status === 'pending');
    }
    if (activeTab === 'my_tasks') {
      // "Admin Assigned" - Specifically assigned to THIS worker
      return allComplaints.filter(c => c.worker_id === currentWorkerId && c.status === 'in_progress');
    }
    if (activeTab === 'history') {
      return allComplaints.filter(c => c.worker_id === currentWorkerId && (c.status === 'resolved' || c.status === 'completed'));
    }
    return [];
  }, [allComplaints, activeTab, currentWorkerId]);

  const handleAcceptTask = (id) => {
    // Assign to self and move to in_progress
    updateStatus({ id, data: { worker_id: currentWorkerId, status: 'in_progress', updated_at: Date.now() } });
  };

  const handleResolveTask = (id) => {
    updateStatus({ id, data: { status: 'resolved', updated_at: Date.now() } });
  };

  const TABS = [
    { key: 'queue', label: 'RAISED ISSUES', icon: 'list-alt', count: allComplaints.filter(c => c.status === 'pending').length },
    { key: 'my_tasks', label: 'ASSIGNED TO ME', icon: 'engineering', count: allComplaints.filter(c => c.worker_id === currentWorkerId && c.status === 'in_progress').length },
    { key: 'history', label: 'MY HISTORY', icon: 'history', count: allComplaints.filter(c => c.worker_id === currentWorkerId && (c.status === 'resolved' || c.status === 'completed')).length }
  ];

  return (
    <View style={{ flex: 1, backgroundColor: WORKER_BG }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 10, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: WORKER_CARD, borderBottomWidth: 3, borderBottomColor: WORKER_PRIMARY }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ color: WORKER_PRIMARY, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 }}>WORKER DASHBOARD</Text>
            <Text style={{ color: WORKER_TEXT, fontSize: 22, fontWeight: 'bold' }}>{userName}</Text>
            <Text style={{ color: WORKER_TEXT2, fontSize: 11 }}>SECTOR: RESIDENCY MAINTENANCE</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: WORKER_TEXT, fontSize: 16, fontWeight: 'bold', fontFamily: 'monospace' }}>
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: WORKER_SUCCESS, marginRight: 6 }} />
              <Text style={{ color: WORKER_SUCCESS, fontSize: 10, fontWeight: 'bold' }}>ACTIVE</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Industrial Tabs */}
      <View style={{ flexDirection: 'row', backgroundColor: '#000' }}>
        {TABS.map(t => (
          <TouchableOpacity 
            key={t.key} 
            onPress={() => setActiveTab(t.key)}
            style={{ 
              flex: 1, alignItems: 'center', justifyContent: 'center', 
              paddingVertical: 14, 
              borderBottomWidth: 3,
              borderBottomColor: activeTab === t.key ? WORKER_PRIMARY : 'transparent',
              backgroundColor: activeTab === t.key ? WORKER_CARD : 'transparent'
            }}
          >
            <View style={{ position: 'relative' }}>
              <MaterialIcons name={t.icon} size={20} color={activeTab === t.key ? WORKER_PRIMARY : WORKER_TEXT2} />
              {t.count > 0 && (
                <View style={{ position: 'absolute', top: -10, right: -12, backgroundColor: t.key === 'queue' ? WORKER_DANGER : WORKER_PRIMARY, borderRadius: 10, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#000' }}>
                  <Text style={{ color: '#fff', fontSize: 8, fontWeight: 'bold' }}>{t.count}</Text>
                </View>
              )}
            </View>
            <Text style={{ color: activeTab === t.key ? WORKER_TEXT : WORKER_TEXT2, fontSize: 9, fontWeight: 'bold', marginTop: 4 }}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <View style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
          <MaterialIcons name="info-outline" size={16} color={WORKER_TEXT2} />
          <Text style={{ color: WORKER_TEXT2, fontSize: 12, marginLeft: 8 }}>
            {activeTab === 'queue' ? 'Showing all complaints raised by residents.' : 
             activeTab === 'my_tasks' ? 'Tasks assigned to you by admin or accepted from queue.' : 
             'Your completed assignments history.'}
          </Text>
        </View>

        {filteredTasks.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 80, opacity: 0.4 }}>
            <MaterialCommunityIcons name="clipboard-check" size={70} color={WORKER_TEXT2} />
            <Text style={{ color: WORKER_TEXT2, fontSize: 14, fontWeight: 'bold', marginTop: 16 }}>NO PENDING ENTRIES</Text>
          </View>
        ) : (
          filteredTasks.map(task => (
            <View key={task.id} style={{ backgroundColor: WORKER_CARD, borderRadius: 4, marginBottom: 16, borderWidth: 1, borderColor: WORKER_BORDER, overflow: 'hidden' }}>
              <View style={{ backgroundColor: '#23272F', padding: 10, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: WORKER_BORDER }}>
                <Text style={{ color: WORKER_PRIMARY, fontSize: 11, fontWeight: 'bold' }}>#{task.id}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: getPriorityColor(task.priority), marginRight: 6 }} />
                  <Text style={{ color: getPriorityColor(task.priority), fontSize: 10, fontWeight: '900' }}>{task.priority.toUpperCase()}</Text>
                </View>
              </View>

              <View style={{ padding: 15 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: getCategoryInfo(task.category).color + '22', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                    <MaterialIcons name={getCategoryInfo(task.category).icon} size={24} color={getCategoryInfo(task.category).color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: WORKER_TEXT, fontSize: 17, fontWeight: 'bold' }}>{task.title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <MaterialIcons name="location-on" size={12} color={WORKER_DANGER} />
                      <Text style={{ color: WORKER_TEXT2, fontSize: 12, marginLeft: 4 }}>{task.location}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={{ backgroundColor: WORKER_BG, padding: 12, borderRadius: 4, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: WORKER_PRIMARY }}>
                  <Text style={{ color: WORKER_TEXT, fontSize: 13, lineHeight: 20 }}>{task.description}</Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <Text style={{ color: WORKER_TEXT2, fontSize: 11 }}>RAISED: {formatTime(task.created_at)}</Text>
                  
                  {activeTab === 'queue' && (
                    <TouchableOpacity 
                      onPress={() => handleAcceptTask(task.id)}
                      style={{ backgroundColor: WORKER_PRIMARY, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 4 }}
                    >
                      <Text style={{ color: '#000', fontSize: 12, fontWeight: 'bold' }}>ACCEPT TASK</Text>
                    </TouchableOpacity>
                  )}

                  {activeTab === 'my_tasks' && (
                    <TouchableOpacity 
                      onPress={() => handleResolveTask(task.id)}
                      style={{ backgroundColor: WORKER_SUCCESS, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 4 }}
                    >
                      <Text style={{ color: '#000', fontSize: 12, fontWeight: 'bold' }}>RESOLVE</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Emergency SOS */}
      <TouchableOpacity style={{ position: 'absolute', bottom: 30, right: 20, width: 60, height: 60, borderRadius: 4, backgroundColor: WORKER_DANGER, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 10, borderWidth: 1, borderColor: '#fff' }}>
        <MaterialIcons name="emergency" size={28} color="#fff" />
        <Text style={{ color: '#fff', fontSize: 8, fontWeight: 'bold' }}>SOS</Text>
      </TouchableOpacity>
    </View>
  );
}
