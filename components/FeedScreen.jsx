import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PRIMARY, ACCENT, BG, CARD, SUCCESS, WARNING, DANGER, SECONDARY, TEXT, TEXT2, BORDER, TAB_MENU_HEIGHT, SCROLL_EXTRA_PADDING, WEB_TAB_MENU_PADDING, useApp, FEED_SEED, formatTime } from './core';

const TYPE_COLORS = { complaint_ref: DANGER, positive: SUCCESS, announcement: ACCENT, update: SECONDARY, discussion: PRIMARY };
const TYPE_ICONS = { complaint_ref: 'report-problem', positive: 'thumb-up', announcement: 'campaign', update: 'update', discussion: 'forum' };

export default function FeedScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { theme } = useApp();
  const [tab, setTab] = useState('trending');
  const [upvoted, setUpvoted] = useState({});
  const [counts, setCounts] = useState(FEED_SEED.reduce((acc, f) => { acc[f.id] = f.upvotes; return acc; }, {}));
  const scrollBottom = Platform.OS === 'web' ? WEB_TAB_MENU_PADDING : TAB_MENU_HEIGHT + insets.bottom + SCROLL_EXTRA_PADDING;

  const handleUpvote = useCallback((id) => {
    if (upvoted[id]) return;
    setUpvoted(p => ({ ...p, [id]: true }));
    setCounts(p => ({ ...p, [id]: (p[id] || 0) + 1 }));
  }, [upvoted]);

  const TABS = [{ key: 'trending', label: '🔥 Trending' }, { key: 'nearby', label: '📍 Nearby' }, { key: 'announcements', label: '📢 Announcements' }, { key: 'discussions', label: '💬 Discuss' }];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ paddingTop: insets.top + 12, paddingBottom: 0, paddingHorizontal: 20, backgroundColor: theme.bg, borderBottomWidth: 1, borderBottomColor: BORDER }}>
        <Text style={{ color: TEXT, fontSize: 20, fontWeight: 'bold', marginBottom: 14 }}>Community Feed 🏘️</Text>
        <View style={{ flexDirection: 'row' }}>
          {TABS.map(t => (
            <TouchableOpacity key={t.key} onPress={() => setTab(t.key)} style={{ paddingHorizontal: 12, paddingVertical: 10, marginRight: 4, borderBottomWidth: 2, borderBottomColor: tab === t.key ? PRIMARY : 'transparent' }}>
              <Text style={{ color: tab === t.key ? PRIMARY : TEXT2, fontSize: 12, fontWeight: tab === t.key ? '700' : '400' }}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <FlatList
        data={FEED_SEED}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: scrollBottom }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={{ backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: BORDER, flexDirection: 'row' }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: ACCENT + '33', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
              <MaterialIcons name="create" size={22} color={ACCENT} />
            </View>
            <TouchableOpacity style={{ flex: 1, backgroundColor: BG, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: BORDER }}>
              <Text style={{ color: TEXT2, fontSize: 14 }}>What's happening in your colony?</Text>
            </TouchableOpacity>
          </View>
        )}
        renderItem={({ item: post }) => {
          const tc = TYPE_COLORS[post.type] || PRIMARY;
          const ti = TYPE_ICONS[post.type] || 'forum';
          const isUp = upvoted[post.id];
          return (
            <View style={{ backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: BORDER }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: PRIMARY + '33', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                  <Text style={{ color: PRIMARY, fontSize: 16, fontWeight: 'bold' }}>{post.avatar}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: TEXT, fontSize: 14, fontWeight: '600' }}>{post.user}</Text>
                  <Text style={{ color: TEXT2, fontSize: 12 }}>{formatTime(post.time)}</Text>
                </View>
                <View style={{ backgroundColor: tc + '22', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialIcons name={ti} size={13} color={tc} />
                  <Text style={{ color: tc, fontSize: 11, marginLeft: 4 }}>{post.type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</Text>
                </View>
              </View>
              <Text style={{ color: TEXT, fontSize: 14, lineHeight: 22, marginBottom: 12 }}>{post.content}</Text>
              {post.complaint_id && (
                <TouchableOpacity onPress={() => navigation.navigate('ComplaintDetail', { complaintId: post.complaint_id })} style={{ backgroundColor: BG, borderRadius: 10, padding: 10, flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: BORDER }}>
                  <MaterialIcons name="link" size={16} color={PRIMARY} />
                  <Text style={{ color: PRIMARY, fontSize: 12, marginLeft: 6 }}>View Referenced Complaint #{post.complaint_id}</Text>
                </TouchableOpacity>
              )}
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: BORDER }}>
                <TouchableOpacity onPress={() => handleUpvote(post.id)} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isUp ? PRIMARY + '22' : CARD, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 10, borderWidth: 1, borderColor: isUp ? PRIMARY : BORDER }}>
                  <MaterialIcons name={isUp ? 'thumb-up' : 'thumb-up-off-alt'} size={16} color={isUp ? PRIMARY : TEXT2} />
                  <Text style={{ color: isUp ? PRIMARY : TEXT2, fontSize: 13, marginLeft: 5 }}>{String(counts[post.id] || post.upvotes)}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, marginRight: 10 }}>
                  <MaterialIcons name="chat-bubble-outline" size={16} color={TEXT2} />
                  <Text style={{ color: TEXT2, fontSize: 13, marginLeft: 5 }}>{String(post.comments)}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginLeft: 'auto' }}>
                  <MaterialIcons name="share" size={18} color={TEXT2} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}
