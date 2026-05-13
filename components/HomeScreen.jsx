import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, TextInput, Alert } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from 'platform-hooks';
import {
  PRIMARY, SECONDARY, BG, CARD, ACCENT, SUCCESS, WARNING, DANGER, TEXT, TEXT2, BORDER,
  TAB_MENU_HEIGHT, SCROLL_EXTRA_PADDING, WEB_TAB_MENU_PADDING,
  useApp, SEED_COMPLAINTS, ANNOUNCEMENTS, StatCard, ComplaintCard, MiniBarChart,
  formatTime, getPriorityColor,
} from './core';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const appCtx = useApp();
  const { theme } = appCtx;
  const [adminTab, setAdminTab] = useState('worker');
  const complaintsQ = useQuery('complaints');
  const complaints = useMemo(() => (complaintsQ.data?.length > 0 ? complaintsQ.data : SEED_COMPLAINTS), [complaintsQ.data]);
  const stats = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'pending').length;
    const inProg = complaints.filter(c => c.status === 'in_progress').length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;
    const critical = complaints.filter(c => c.priority === 'critical').length;
    return { total, pending, inProg, resolved, critical };
  }, [complaints]);

  const scrollBottom = Platform.OS === 'web' ? WEB_TAB_MENU_PADDING : TAB_MENU_HEIGHT + insets.bottom + SCROLL_EXTRA_PADDING;
  const chartData = [
    { label: 'Mon', value: 5, color: PRIMARY }, { label: 'Tue', value: 8, color: PRIMARY },
    { label: 'Wed', value: 3, color: PRIMARY }, { label: 'Thu', value: 12, color: WARNING },
    { label: 'Fri', value: 7, color: PRIMARY }, { label: 'Sat', value: 4, color: PRIMARY },
    { label: 'Sun', value: 6, color: PRIMARY },
  ];
  const catData = [
    { label: 'Water', value: complaints.filter(c => c.category === 'water').length, color: SECONDARY },
    { label: 'Elec', value: complaints.filter(c => c.category === 'electricity').length, color: WARNING },
    { label: 'Roads', value: complaints.filter(c => c.category === 'roads').length, color: SUCCESS },
    { label: 'Safety', value: complaints.filter(c => c.category === 'safety').length, color: DANGER },
    { label: 'Other', value: complaints.filter(c => !['water','electricity','roads','safety'].includes(c.category)).length, color: ACCENT },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ paddingTop: insets.top + 12, paddingBottom: 14, paddingHorizontal: 20, backgroundColor: theme.bg, borderBottomWidth: 1, borderBottomColor: BORDER, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ color: TEXT2, fontSize: 12 }}>Good Morning,</Text>
          <Text style={{ color: TEXT, fontSize: 20, fontWeight: 'bold' }}>ColonyCare 🏙️</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={{ marginRight: 12, position: 'relative' }}>
            <MaterialIcons name="notifications" size={26} color={TEXT} />
            <View style={{ position: 'absolute', top: -2, right: -2, width: 10, height: 10, borderRadius: 5, backgroundColor: DANGER }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('AdminDashboard')} style={{ backgroundColor: PRIMARY + '22', borderRadius: 10, padding: 6 }}>
            <MaterialIcons name="admin-panel-settings" size={22} color={PRIMARY} />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 20, paddingBottom: scrollBottom, paddingHorizontal: 16 }} showsVerticalScrollIndicator={true}>
        {/* Profile Panel */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('Profile')}
          style={{ backgroundColor: CARD, borderRadius: 20, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: BORDER, flexDirection: 'row', alignItems: 'center' }}
        >
          <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: PRIMARY + '22', justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: PRIMARY + '44' }}>
            <MaterialIcons name="person" size={28} color={PRIMARY} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: TEXT, fontSize: 16, fontWeight: 'bold' }}>{appCtx.userName}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <MaterialIcons name="verified" size={14} color={WARNING} />
              <Text style={{ color: TEXT2, fontSize: 12, marginLeft: 4 }}>{appCtx.role.charAt(0).toUpperCase() + appCtx.role.slice(1)} · Block A, Unit 204</Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={TEXT2} />
        </TouchableOpacity>

        {/* Admin Management Section */}
        {appCtx.role === 'admin' && (
          <View style={{ marginBottom: 24, backgroundColor: CARD, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: PRIMARY + '44' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: PRIMARY + '22', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                  <MaterialIcons name="admin-panel-settings" size={20} color={PRIMARY} />
                </View>
                <Text style={{ color: TEXT, fontSize: 17, fontWeight: 'bold' }}>Admin Management</Text>
              </View>
              <View style={{ backgroundColor: SUCCESS + '22', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                <Text style={{ color: SUCCESS, fontSize: 11, fontWeight: 'bold' }}>Admin Mode</Text>
              </View>
            </View>

            {/* Segmented Control (Switch Role Style) */}
            <View style={{ flexDirection: 'row', backgroundColor: BG, borderRadius: 12, padding: 4, marginBottom: 18, borderWidth: 1, borderColor: BORDER }}>
              <TouchableOpacity 
                onPress={() => setAdminTab('worker')}
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: adminTab === 'worker' ? SUCCESS : 'transparent', borderRadius: 10, paddingVertical: 10 }}
              >
                <MaterialIcons name="engineering" size={16} color={adminTab === 'worker' ? '#fff' : TEXT2} />
                <Text style={{ color: adminTab === 'worker' ? '#fff' : TEXT2, fontSize: 12, fontWeight: 'bold', marginLeft: 6 }}>Workers</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setAdminTab('residency')}
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: adminTab === 'residency' ? PRIMARY : 'transparent', borderRadius: 10, paddingVertical: 10 }}
              >
                <MaterialIcons name="home" size={16} color={adminTab === 'residency' ? '#fff' : TEXT2} />
                <Text style={{ color: adminTab === 'residency' ? '#fff' : TEXT2, fontSize: 12, fontWeight: 'bold', marginLeft: 6 }}>Residency</Text>
              </TouchableOpacity>
            </View>

            {adminTab === 'worker' ? (
              <View>
                <Text style={{ color: TEXT2, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' }}>New Worker Details</Text>
                <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                  <View style={{ flex: 2, marginRight: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: BG, borderRadius: 10, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 10 }}>
                      <MaterialIcons name="person" size={18} color={TEXT2} />
                      <TextInput 
                        placeholder="Worker Name" 
                        placeholderTextColor={TEXT2 + '66'} 
                        style={{ flex: 1, color: TEXT, fontSize: 13, paddingVertical: 10, paddingHorizontal: 8 }}
                      />
                    </View>
                  </View>
                  <View style={{ flex: 1, marginLeft: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: BG, borderRadius: 10, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 10 }}>
                      <MaterialIcons name="groups" size={18} color={TEXT2} />
                      <TextInput 
                        placeholder="Total" 
                        placeholderTextColor={TEXT2 + '66'} 
                        keyboardType="numeric"
                        style={{ flex: 1, color: TEXT, fontSize: 13, paddingVertical: 10, paddingHorizontal: 8 }}
                      />
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              <View>
                <Text style={{ color: TEXT2, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' }}>New Residency Members</Text>
                <View style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: BG, borderRadius: 10, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 10, marginBottom: 10 }}>
                    <MaterialIcons name="person-add" size={18} color={TEXT2} />
                    <TextInput 
                      placeholder="Member Name" 
                      placeholderTextColor={TEXT2 + '66'} 
                      style={{ flex: 1, color: TEXT, fontSize: 13, paddingVertical: 10, paddingHorizontal: 8 }}
                    />
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: BG, borderRadius: 10, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 10 }}>
                    <MaterialIcons name="apartment" size={18} color={TEXT2} />
                    <TextInput 
                      placeholder="Block / Unit Name" 
                      placeholderTextColor={TEXT2 + '66'} 
                      style={{ flex: 1, color: TEXT, fontSize: 13, paddingVertical: 10, paddingHorizontal: 8 }}
                    />
                  </View>
                </View>
              </View>
            )}

            <TouchableOpacity 
              onPress={() => { Platform.OS === 'web' ? alert(`${adminTab === 'worker' ? 'Worker' : 'Residency'} information updated!`) : Alert.alert('Success', 'Information successfully updated.'); }}
              style={{ backgroundColor: adminTab === 'worker' ? SUCCESS : PRIMARY, borderRadius: 12, paddingVertical: 12, alignItems: 'center', shadowColor: adminTab === 'worker' ? SUCCESS : PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 }}
            >
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>{adminTab === 'worker' ? 'Add Worker' : 'Register Residency'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Hero */}
        <View style={{ borderRadius: 20, padding: 20, marginBottom: 20, backgroundColor: PRIMARY, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>Colony Health Score</Text>
              <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginBottom: 12 }}>AI-powered community insights</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 42, fontWeight: 'bold' }}>87</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, marginLeft: 4 }}>/100</Text>
              </View>
              <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, marginTop: 8, width: '90%' }}>
                <View style={{ height: 6, backgroundColor: '#fff', borderRadius: 3, width: '87%' }} />
              </View>
            </View>
            <View style={{ alignItems: 'center' }}>
              <MaterialCommunityIcons name="city" size={64} color="rgba(255,255,255,0.3)" />
              <View style={{ backgroundColor: SUCCESS + 'AA', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginTop: 6 }}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>↑ +5 this week</Text>
              </View>
            </View>
          </View>
        </View>
        {/* Stats row 1 */}
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          <StatCard icon="report-problem" value={stats.total} label="Total" accent={PRIMARY} trend={12} />
          <StatCard icon="pending" value={stats.pending} label="Pending" accent={WARNING} trend={-8} />
          <StatCard icon="check-circle" value={stats.resolved} label="Resolved" accent={SUCCESS} trend={22} />
        </View>
        {/* Stats row 2 */}
        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
          <StatCard icon="engineering" value={stats.inProg} label="In Progress" accent={SECONDARY} trend={5} />
          <StatCard icon="priority-high" value={stats.critical} label="Critical" accent={DANGER} trend={-3} />
          <StatCard icon="people" value={248} label="Residents" accent={ACCENT} trend={2} />
        </View>
        {/* Raise CTA */}
        <TouchableOpacity onPress={() => navigation.navigate('RaiseComplaint')} style={{ backgroundColor: ACCENT, borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
              <MaterialIcons name="add-circle" size={26} color="#fff" />
            </View>
            <View>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Raise a Complaint</Text>
              <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>AI-powered categorization</Text>
            </View>
          </View>
          <MaterialIcons name="arrow-forward-ios" size={18} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
        {/* Announcements */}
        {ANNOUNCEMENTS.map(ann => (
          <View key={ann.id} style={{ backgroundColor: ann.priority === 'high' ? DANGER + '22' : WARNING + '22', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: ann.priority === 'high' ? DANGER + '44' : WARNING + '44', flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: (ann.priority === 'high' ? DANGER : WARNING) + '33', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
              <MaterialIcons name={ann.priority === 'high' ? 'warning' : 'campaign'} size={20} color={ann.priority === 'high' ? DANGER : WARNING} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: TEXT, fontSize: 14, fontWeight: '600', marginBottom: 2 }}>{ann.title}</Text>
              <Text style={{ color: TEXT2, fontSize: 12 }}>{ann.body} · {formatTime(ann.time)}</Text>
            </View>
          </View>
        ))}
        {/* Weekly trend header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, marginTop: 8 }}>
          <Text style={{ color: TEXT, fontSize: 17, fontWeight: 'bold' }}>Weekly Trend</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Analytics')}>
            <Text style={{ color: PRIMARY, fontSize: 13 }}>View Analytics</Text>
          </TouchableOpacity>
        </View>
        {/* Chart */}
        <View style={{ backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: BORDER }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ color: TEXT2, fontSize: 12 }}>Complaints this week</Text>
            <Text style={{ color: PRIMARY, fontSize: 18, fontWeight: 'bold' }}>45</Text>
          </View>
          <MiniBarChart data={chartData} height={70} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
            {catData.map((d, i) => (
              <View key={i} style={{ alignItems: 'center' }}>
                <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: d.color + '22', justifyContent: 'center', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ color: d.color, fontSize: 13, fontWeight: 'bold' }}>{String(d.value)}</Text>
                </View>
                <Text style={{ color: TEXT2, fontSize: 10 }}>{d.label}</Text>
              </View>
            ))}
          </View>
        </View>
        {/* Recent complaints */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Text style={{ color: TEXT, fontSize: 17, fontWeight: 'bold' }}>Recent Complaints</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MyComplaints')}>
            <Text style={{ color: PRIMARY, fontSize: 13 }}>View All</Text>
          </TouchableOpacity>
        </View>
        {complaints.slice(0, 3).map(c => (
          <ComplaintCard key={c.id} complaint={c} onPress={() => navigation.navigate('ComplaintDetail', { complaintId: c.id })} />
        ))}
        {/* AI Insight */}
        <View style={{ backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: BORDER }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: ACCENT + '22', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
              <MaterialIcons name="psychology" size={18} color={ACCENT} />
            </View>
            <Text style={{ color: TEXT, fontSize: 15, fontWeight: '700' }}>AI Insight</Text>
          </View>
          <Text style={{ color: TEXT2, fontSize: 13, lineHeight: 20 }}>⚡ Water pressure complaints spike on Monday mornings (8-10am). Proactive maintenance scheduled. Expected issue reduction: 35%.</Text>
          <View style={{ flexDirection: 'row', marginTop: 12 }}>
            <TouchableOpacity style={{ backgroundColor: ACCENT, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8 }}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Schedule Maintenance</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: BORDER }}>
              <Text style={{ color: TEXT2, fontSize: 12 }}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
