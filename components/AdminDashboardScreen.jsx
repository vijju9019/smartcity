import React, { useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Platform, Dimensions, TextInput } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'platform-hooks';
import { PRIMARY, ACCENT, BG, CARD, SECONDARY, SUCCESS, WARNING, DANGER, TEXT, TEXT2, BORDER, SEED_COMPLAINTS, WORKERS, CATEGORIES, StatCard, MiniBarChart, getPriorityColor, formatTime } from './core';

export default function AdminDashboardScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const complaintsQ = useQuery('complaints');
  const allComplaints = useMemo(() => (complaintsQ.data?.length > 0 ? complaintsQ.data : SEED_COMPLAINTS), [complaintsQ.data]);
  const { mutate: updateComplaint } = useMutation('complaints', 'update');

  const stats = useMemo(() => {
    const total = allComplaints.length;
    const pending = allComplaints.filter(c => c.status === 'pending').length;
    const inProg = allComplaints.filter(c => c.status === 'in_progress').length;
    const resolved = allComplaints.filter(c => c.status === 'resolved').length;
    const critical = allComplaints.filter(c => c.priority === 'critical').length;
    const resRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    return { total, pending, inProg, resolved, critical, resRate };
  }, [allComplaints]);

  const catChartData = CATEGORIES.slice(0, 6).map(cat => ({
    label: cat.label.slice(0, 4), value: allComplaints.filter(c => c.category === cat.id).length, color: cat.color,
  }));

  const handleAssign = useCallback((complaint, workerId) => {
    updateComplaint({ id: complaint.id, data: { worker_id: workerId, status: 'in_progress', updated_at: Date.now() } })
      .then(() => { Platform.OS === 'web' ? alert('Worker assigned!') : Alert.alert('Assigned', 'Worker assigned.'); })
      .catch(e => { Platform.OS === 'web' ? alert(e.message) : Alert.alert('Error', e.message); });
  }, [updateComplaint]);

  const handleResolve = useCallback((complaintId) => {
    updateComplaint({ id: complaintId, data: { status: 'resolved', updated_at: Date.now() } })
      .then(() => { Platform.OS === 'web' ? alert('Complaint resolved!') : Alert.alert('Success', 'Complaint marked as resolved.'); })
      .catch(e => { Platform.OS === 'web' ? alert(e.message) : Alert.alert('Error', e.message); });
  }, [updateComplaint]);

  const [newWorker, setNewWorker] = React.useState({ name: '', dept: '' });
  const [newResident, setNewResident] = React.useState({ name: '', unit: '' });

  const handleAddWorker = () => {
    if (!newWorker.name || !newWorker.dept) {
      Platform.OS === 'web' ? alert('Please fill all fields') : Alert.alert('Error', 'Please fill all fields');
      return;
    }
    Platform.OS === 'web' ? alert(`Worker ${newWorker.name} added!`) : Alert.alert('Success', `Worker ${newWorker.name} added.`);
    setNewWorker({ name: '', dept: '' });
  };

  const handleAddResident = () => {
    if (!newResident.name || !newResident.unit) {
      Platform.OS === 'web' ? alert('Please fill all fields') : Alert.alert('Error', 'Please fill all fields');
      return;
    }
    Platform.OS === 'web' ? alert(`Resident ${newResident.name} added!`) : Alert.alert('Success', `Resident ${newResident.name} added.`);
    setNewResident({ name: '', unit: '' });
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <View style={{ paddingTop: insets.top + 8, paddingBottom: 14, paddingHorizontal: 20, backgroundColor: BG, borderBottomWidth: 1, borderBottomColor: BORDER, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 14 }}>
          <MaterialIcons name="arrow-back" size={24} color={TEXT} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: TEXT, fontSize: 18, fontWeight: 'bold' }}>Admin Dashboard</Text>
          <Text style={{ color: TEXT2, fontSize: 12 }}>Colony Command Center</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Analytics')} style={{ backgroundColor: ACCENT + '22', borderRadius: 10, padding: 8 }}>
          <MaterialIcons name="bar-chart" size={22} color={ACCENT} />
        </TouchableOpacity>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 60 }} showsVerticalScrollIndicator={true}>
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          <StatCard icon="report-problem" value={stats.total} label="Total" accent={PRIMARY} />
          <StatCard icon="pending" value={stats.pending} label="Pending" accent={WARNING} />
          <StatCard icon="check-circle" value={stats.resRate + '%'} label="Res. Rate" accent={SUCCESS} />
        </View>
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <StatCard icon="engineering" value={stats.inProg} label="Active" accent={SECONDARY} />
          <StatCard icon="priority-high" value={stats.critical} label="Critical" accent={DANGER} />
          <StatCard icon="people" value={5} label="Workers" accent={ACCENT} />
        </View>
        
        <View style={{ backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: BORDER }}>
          <Text style={{ color: TEXT, fontSize: 15, fontWeight: '700', marginBottom: 4 }}>Category Breakdown</Text>
          <MiniBarChart data={catChartData} height={80} />
        </View>

        {/* Admin Management Section */}
        <Text style={{ color: TEXT, fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>Community Management</Text>
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          {/* Add Worker */}
          <View style={{ flex: 1, backgroundColor: CARD, borderRadius: 16, padding: 14, marginRight: 8, borderWidth: 1, borderColor: BORDER }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: SUCCESS + '22', justifyContent: 'center', alignItems: 'center', marginRight: 8 }}>
                <MaterialIcons name="person-add" size={18} color={SUCCESS} />
              </View>
              <Text style={{ color: TEXT, fontSize: 14, fontWeight: '700' }}>Add Worker</Text>
            </View>
            <TextInput 
              placeholder="Name" 
              placeholderTextColor={TEXT2 + '88'} 
              value={newWorker.name}
              onChangeText={(t) => setNewWorker({...newWorker, name: t})}
              style={{ backgroundColor: BG, borderRadius: 8, padding: 8, color: TEXT, fontSize: 12, marginBottom: 8, borderWidth: 1, borderColor: BORDER }} 
            />
            <TextInput 
              placeholder="Department" 
              placeholderTextColor={TEXT2 + '88'} 
              value={newWorker.dept}
              onChangeText={(t) => setNewWorker({...newWorker, dept: t})}
              style={{ backgroundColor: BG, borderRadius: 8, padding: 8, color: TEXT, fontSize: 12, marginBottom: 12, borderWidth: 1, borderColor: BORDER }} 
            />
            <TouchableOpacity onPress={handleAddWorker} style={{ backgroundColor: SUCCESS, borderRadius: 8, paddingVertical: 8, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>Add</Text>
            </TouchableOpacity>
          </View>

          {/* Add Resident */}
          <View style={{ flex: 1, backgroundColor: CARD, borderRadius: 16, padding: 14, marginLeft: 8, borderWidth: 1, borderColor: BORDER }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: PRIMARY + '22', justifyContent: 'center', alignItems: 'center', marginRight: 8 }}>
                <MaterialIcons name="group-add" size={18} color={PRIMARY} />
              </View>
              <Text style={{ color: TEXT, fontSize: 14, fontWeight: '700' }}>Add Member</Text>
            </View>
            <TextInput 
              placeholder="Name" 
              placeholderTextColor={TEXT2 + '88'} 
              value={newResident.name}
              onChangeText={(t) => setNewResident({...newResident, name: t})}
              style={{ backgroundColor: BG, borderRadius: 8, padding: 8, color: TEXT, fontSize: 12, marginBottom: 8, borderWidth: 1, borderColor: BORDER }} 
            />
            <TextInput 
              placeholder="Unit/Block" 
              placeholderTextColor={TEXT2 + '88'} 
              value={newResident.unit}
              onChangeText={(t) => setNewResident({...newResident, unit: t})}
              style={{ backgroundColor: BG, borderRadius: 8, padding: 8, color: TEXT, fontSize: 12, marginBottom: 12, borderWidth: 1, borderColor: BORDER }} 
            />
            <TouchableOpacity onPress={handleAddResident} style={{ backgroundColor: PRIMARY, borderRadius: 8, paddingVertical: 8, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={{ color: TEXT, fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>Worker Status</Text>
        <View style={{ backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: BORDER }}>
          {WORKERS.map((w, i) => (
            <View key={w.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: i < WORKERS.length - 1 ? 1 : 0, borderBottomColor: BORDER }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: (w.active ? SUCCESS : TEXT2) + '33', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                <MaterialIcons name="engineering" size={22} color={w.active ? SUCCESS : TEXT2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: TEXT, fontSize: 14, fontWeight: '600' }}>{w.name}</Text>
                <Text style={{ color: TEXT2, fontSize: 12 }}>{w.dept} · {w.completed} resolved</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <View style={{ backgroundColor: (w.active ? SUCCESS : TEXT2) + '22', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 4 }}>
                  <Text style={{ color: w.active ? SUCCESS : TEXT2, fontSize: 11 }}>{w.active ? 'Available' : 'Busy'}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialIcons name="star" size={12} color={WARNING} />
                  <Text style={{ color: WARNING, fontSize: 12, marginLeft: 2 }}>{String(w.rating)}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
        <Text style={{ color: TEXT, fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>Pending Queue</Text>
        {allComplaints.filter(c => c.status === 'pending').map(c => (
          <View key={c.id} style={{ backgroundColor: CARD, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: BORDER, borderLeftWidth: 3, borderLeftColor: getPriorityColor(c.priority) }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={{ color: TEXT, fontSize: 14, fontWeight: '600', marginBottom: 4 }}>{c.title}</Text>
                <Text style={{ color: TEXT2, fontSize: 12 }}>{c.location} · {formatTime(c.created_at)}</Text>
              </View>
              <View style={{ backgroundColor: getPriorityColor(c.priority) + '22', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                <Text style={{ color: getPriorityColor(c.priority), fontSize: 12, fontWeight: '700' }}>{c.priority.toUpperCase()}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {WORKERS.filter(w => w.active).map(w => (
                <TouchableOpacity key={w.id} onPress={() => handleAssign(c, w.id)} style={{ backgroundColor: SECONDARY + '22', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginRight: 6, marginBottom: 4, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: SECONDARY + '44' }}>
                  <MaterialIcons name="person-add" size={13} color={SECONDARY} />
                  <Text style={{ color: SECONDARY, fontSize: 12, marginLeft: 4 }}>{w.name.split(' ')[0]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
        {allComplaints.filter(c => c.status === 'pending').length === 0 && (
          <View style={{ backgroundColor: SUCCESS + '22', borderRadius: 14, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: SUCCESS + '44', marginBottom: 16 }}>
            <MaterialIcons name="check-circle" size={40} color={SUCCESS} />
            <Text style={{ color: SUCCESS, fontSize: 15, fontWeight: '700', marginTop: 8 }}>All caught up!</Text>
            <Text style={{ color: TEXT2, fontSize: 13, marginTop: 4 }}>No pending complaints in queue.</Text>
          </View>
        )}
        <Text style={{ color: TEXT, fontSize: 16, fontWeight: 'bold', marginBottom: 12, marginTop: 16 }}>Active Work (In Progress)</Text>
        {allComplaints.filter(c => c.status === 'in_progress').map(c => {
          const worker = WORKERS.find(w => w.id === c.worker_id);
          return (
            <View key={c.id} style={{ backgroundColor: CARD, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: SECONDARY + '44', borderLeftWidth: 3, borderLeftColor: SECONDARY }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={{ color: TEXT, fontSize: 14, fontWeight: '600', marginBottom: 4 }}>{c.title}</Text>
                  <Text style={{ color: TEXT2, fontSize: 12 }}>{c.location} · Assigned to {worker?.name || 'Unknown'}</Text>
                </View>
                <TouchableOpacity onPress={() => handleResolve(c.id)} style={{ backgroundColor: SUCCESS, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Resolve</Text>
                </TouchableOpacity>
              </View>
              <View style={{ height: 4, backgroundColor: BG, borderRadius: 2, overflow: 'hidden', marginTop: 4 }}>
                <View style={{ height: '100%', width: '65%', backgroundColor: SECONDARY }} />
              </View>
              <Text style={{ color: TEXT2, fontSize: 10, marginTop: 6 }}>Work in progress · Est. completion 2h</Text>
            </View>
          );
        })}
        {allComplaints.filter(c => c.status === 'in_progress').length === 0 && (
          <View style={{ backgroundColor: CARD, borderRadius: 14, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: BORDER }}>
            <Text style={{ color: TEXT2, fontSize: 13 }}>No active work in progress.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
