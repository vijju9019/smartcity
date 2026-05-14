import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Platform, ScrollView, Modal, TextInput, KeyboardAvoidingView, ActivityIndicator, Animated, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PRIMARY, ACCENT, BG, CARD, SUCCESS, WARNING, DANGER, SECONDARY, TEXT, TEXT2, BORDER, TAB_MENU_HEIGHT, SCROLL_EXTRA_PADDING, WEB_TAB_MENU_PADDING, useApp, FEED_SEED, formatTime } from './core';

const TYPE_COLORS = { complaint_ref: DANGER, positive: SUCCESS, announcement: ACCENT, update: SECONDARY, discussion: PRIMARY };
const TYPE_ICONS = { complaint_ref: 'report-problem', positive: 'thumb-up', announcement: 'campaign', update: 'update', discussion: 'forum' };

const PostItem = React.memo(({ post, upvoted, counts, onUpvote, onComment, onDetail, formatTime, commentsCount }) => {
  const tc = TYPE_COLORS[post.type] || PRIMARY;
  const ti = TYPE_ICONS[post.type] || 'forum';
  const isUp = upvoted[post.id];
  
  return (
    <Animated.View style={{ backgroundColor: CARD, borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: BORDER }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: PRIMARY + '22', justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: PRIMARY + '44' }}>
          <Text style={{ color: PRIMARY, fontSize: 18, fontWeight: 'bold' }}>{post.avatar || 'U'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: TEXT, fontSize: 15, fontWeight: '700' }}>{post.user}</Text>
          <Text style={{ color: TEXT2, fontSize: 12 }}>{formatTime(post.time)}</Text>
        </View>
        <View style={{ backgroundColor: tc + '15', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: tc + '33' }}>
          <MaterialIcons name={ti} size={14} color={tc} />
          <Text style={{ color: tc, fontSize: 11, marginLeft: 5, fontWeight: 'bold', textTransform: 'uppercase' }}>{post.type.replace('_', ' ')}</Text>
        </View>
      </View>
      <Text style={{ color: TEXT, fontSize: 15, lineHeight: 24, marginBottom: 14 }}>{post.content}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 14, borderTopWidth: 1, borderTopColor: BORDER }}>
        <TouchableOpacity onPress={() => onUpvote(post.id)} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isUp ? PRIMARY : 'transparent', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 12, borderWidth: 1, borderColor: isUp ? PRIMARY : BORDER }}>
          <MaterialIcons name={isUp ? 'thumb-up' : 'thumb-up-off-alt'} size={18} color={isUp ? '#fff' : TEXT2} />
          <Text style={{ color: isUp ? '#fff' : TEXT2, fontSize: 14, marginLeft: 6, fontWeight: 'bold' }}>{String(counts[post.id] || post.upvotes)}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onComment(post.id)} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8 }}>
          <MaterialIcons name="chat-bubble-outline" size={18} color={TEXT2} />
          <Text style={{ color: TEXT2, fontSize: 14, marginLeft: 6 }}>{String(commentsCount)}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
});

const AdvancedFeedHeader = ({ onOpenActions }) => (
  <View style={{ marginBottom: 20 }}>
    <TouchableOpacity 
      onPress={onOpenActions}
      style={{ backgroundColor: CARD, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: BORDER, flexDirection: 'row', alignItems: 'center' }}
    >
      <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: PRIMARY + '22', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
        <MaterialIcons name="auto-awesome" size={26} color={PRIMARY} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: TEXT, fontSize: 16, fontWeight: 'bold' }}>Colony Pulse</Text>
        <Text style={{ color: TEXT2, fontSize: 13 }}>Post an update, event or see what's new</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={TEXT2} />
    </TouchableOpacity>
  </View>
);

export default function FeedScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const appCtx = useApp();
  const { theme = { bg: '#0F172A', card: '#1E293B' }, userName = 'User' } = appCtx;
  
  const [tab, setTab] = useState('updates');
  const [upvoted, setUpvoted] = useState({});
  const [counts, setCounts] = useState(FEED_SEED.reduce((acc, f) => { acc[f.id] = f.upvotes; return acc; }, {}));
  const [commentModal, setCommentModal] = useState({ visible: false, postId: null });
  const [showActions, setShowActions] = useState(false);
  const [actionType, setActionType] = useState(null); 
  const [newMessage, setNewMessage] = useState('');
  const [postedBy, setPostedBy] = useState(userName);
  const [isPosting, setIsPosting] = useState(false);
  const [feedItems, setFeedItems] = useState(FEED_SEED);

  useEffect(() => {
    if (showActions && !actionType) {
      setPostedBy(userName);
    }
  }, [showActions, userName]);

  const handlePostMessage = () => {
    if (!newMessage.trim() || !postedBy.trim()) return;
    setIsPosting(true);
    setTimeout(() => {
      const post = { 
        id: 'new_' + Date.now(), 
        user: postedBy, 
        avatar: postedBy[0].toUpperCase(), 
        content: newMessage, 
        type: 'discussion', 
        upvotes: 0, 
        comments: 0, 
        time: Date.now() 
      };
      setFeedItems([post, ...feedItems]);
      setNewMessage('');
      setShowActions(false);
      setActionType(null);
      setIsPosting(false);
    }, 1200);
  };

  const filteredFeed = useMemo(() => {
    if (tab === 'updates') return feedItems.filter(f => f.type === 'announcement' || f.type === 'update' || f.type === 'complaint_ref');
    if (tab === 'events') return feedItems.filter(f => f.content.toLowerCase().includes('event') || f.content.toLowerCase().includes('drive') || f.content.toLowerCase().includes('meeting'));
    return feedItems;
  }, [tab, feedItems]);

  const TABS = [{ key: 'updates', label: 'Updates' }, { key: 'events', label: 'Events' }];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ paddingTop: insets.top + 12, backgroundColor: theme.bg, borderBottomWidth: 1, borderBottomColor: BORDER }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 14 }}>
          <Text style={{ color: TEXT, fontSize: 24, fontWeight: 'bold' }}>Community Feed</Text>
        </View>
        <View style={{ flexDirection: 'row', paddingHorizontal: 20 }}>
          {TABS.map(t => (
            <TouchableOpacity key={t.key} onPress={() => setTab(t.key)} style={{ paddingVertical: 12, marginRight: 24, borderBottomWidth: 3, borderBottomColor: tab === t.key ? PRIMARY : 'transparent' }}>
              <Text style={{ color: tab === t.key ? TEXT : TEXT2, fontSize: 16, fontWeight: tab === t.key ? 'bold' : '500' }}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredFeed}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        ListHeaderComponent={<AdvancedFeedHeader onOpenActions={() => setShowActions(true)} />}
        renderItem={({ item }) => (
          <PostItem 
            post={item} upvoted={upvoted} counts={counts} 
            onUpvote={(id) => {
              setUpvoted(p => { const isUp = !p[id]; setCounts(c => ({ ...c, [id]: (c[id] || 0) + (isUp ? 1 : -1) })); return { ...p, [id]: isUp }; });
            }}
            onComment={(id) => setCommentModal({ visible: true, postId: id })} 
            onDetail={(id) => navigation.navigate('ComplaintDetail', { complaintId: id })}
            formatTime={formatTime} commentsCount={item.comments || 0}
          />
        )}
      />

      <Modal visible={showActions} transparent animationType="fade">
        <TouchableOpacity activeOpacity={1} onPress={() => { setShowActions(false); setActionType(null); }} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: CARD, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: insets.bottom + 20 }}>
            <View style={{ width: 40, height: 4, backgroundColor: BORDER, borderRadius: 2, alignSelf: 'center', marginBottom: 24 }} />
            
            {!actionType ? (
              <View>
                <Text style={{ color: TEXT, fontSize: 20, fontWeight: 'bold', marginBottom: 24 }}>What would you like to do?</Text>
                
                <TouchableOpacity onPress={() => setActionType('message')} style={{ backgroundColor: PRIMARY + '11', borderRadius: 20, padding: 18, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: PRIMARY + '33' }}>
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: PRIMARY, justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                    <MaterialIcons name="chat" size={24} color="#fff" />
                  </View>
                  <View>
                    <Text style={{ color: TEXT, fontSize: 16, fontWeight: 'bold' }}>Create a Message</Text>
                    <Text style={{ color: TEXT2, fontSize: 13 }}>Share an update with your neighbors</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { setShowActions(false); navigation.navigate('ColonyEvents'); }} style={{ backgroundColor: SUCCESS + '11', borderRadius: 20, padding: 18, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: SUCCESS + '33' }}>
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: SUCCESS, justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                    <MaterialIcons name="event" size={24} color="#fff" />
                  </View>
                  <View>
                    <Text style={{ color: TEXT, fontSize: 16, fontWeight: 'bold' }}>Create an Event</Text>
                    <Text style={{ color: TEXT2, fontSize: 13 }}>Organize a gathering or meeting</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { setShowActions(false); navigation.navigate('ColonyEvents'); }} style={{ backgroundColor: SECONDARY + '11', borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: SECONDARY + '33' }}>
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: SECONDARY, justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                    <MaterialIcons name="list" size={24} color="#fff" />
                  </View>
                  <View>
                    <Text style={{ color: TEXT, fontSize: 16, fontWeight: 'bold' }}>See Posts & Events</Text>
                    <Text style={{ color: TEXT2, fontSize: 13 }}>Browse the full log of colony happenings</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                    <TouchableOpacity onPress={() => setActionType(null)} style={{ marginRight: 12 }}>
                      <MaterialIcons name="arrow-back" size={24} color={TEXT} />
                    </TouchableOpacity>
                    <Text style={{ color: TEXT, fontSize: 20, fontWeight: 'bold' }}>New Message</Text>
                  </View>

                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ color: TEXT2, fontSize: 12, marginBottom: 8, fontWeight: '600' }}>MESSAGE FROM (NAME/ROLE)</Text>
                    <View style={{ backgroundColor: BG, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: BORDER, flexDirection: 'row', alignItems: 'center' }}>
                      <MaterialIcons name="person" size={18} color={PRIMARY} style={{ marginRight: 10 }} />
                      <TextInput 
                        placeholder="e.g. RWA Secretary or Your Name" 
                        placeholderTextColor={TEXT2 + '88'} 
                        value={postedBy} 
                        onChangeText={setPostedBy} 
                        style={{ color: TEXT, fontSize: 14, flex: 1 }} 
                      />
                    </View>
                  </View>

                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ color: TEXT2, fontSize: 12, marginBottom: 8, fontWeight: '600' }}>YOUR MESSAGE</Text>
                    <View style={{ backgroundColor: BG, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: BORDER }}>
                      <TextInput placeholder="Type your message here..." placeholderTextColor={TEXT2 + '88'} multiline value={newMessage} onChangeText={setNewMessage} style={{ color: TEXT, fontSize: 16, minHeight: 100, textAlignVertical: 'top' }} />
                    </View>
                  </View>

                  <TouchableOpacity onPress={handlePostMessage} disabled={!newMessage.trim() || !postedBy.trim() || isPosting} style={{ backgroundColor: PRIMARY, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 10, opacity: (newMessage.trim() && postedBy.trim()) ? 1 : 0.6 }}>
                    {isPosting ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Send to Community</Text>}
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
