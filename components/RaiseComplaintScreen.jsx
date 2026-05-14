import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Image, Alert, Platform, KeyboardAvoidingView, Dimensions } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCamera, useLocation, useFilePicker, useImagePicker, useMutation } from 'platform-hooks';
import {
  PRIMARY, ACCENT, BG, CARD, SECONDARY, TEXT, TEXT2, BORDER,
  CATEGORIES, HEADER_HEIGHT, analyzeComplaintAI, generateId, getPriorityColor,
} from './core';

export default function RaiseComplaintScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [location, setLocation] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);

  const { takePhoto, photo: cameraPhoto } = useCamera();
  const { getCurrentLocation } = useLocation();
  const { pickDocument, lastFile, isLoading: fpLoading } = useFilePicker();
  const { pickImage, lastImage, isLoading: ipLoading } = useImagePicker();
  const { mutate } = useMutation('complaints', 'insert');

  React.useEffect(() => {
    if (route.params?.lat && route.params?.lng) {
      setLat(route.params.lat);
      setLng(route.params.lng);
      setLocation(route.params.lat.toFixed(6) + ', ' + route.params.lng.toFixed(6));
    }
    if (route.params?.quickCategory) {
      setCategory(route.params.quickCategory);
    }
  }, [route.params]);

  React.useEffect(() => { if (cameraPhoto) setPhoto(cameraPhoto.uri); }, [cameraPhoto]);
  React.useEffect(() => { if (lastImage) setPhoto(lastImage.uri); }, [lastImage]);

  const handleGetLocation = useCallback(() => {
    getCurrentLocation().then(r => {
      if (r.error) { Platform.OS === 'web' ? alert(r.error) : Alert.alert('Location Error', r.error); return; }
      setLat(r.latitude); setLng(r.longitude);
      setLocation(r.latitude.toFixed(6) + ', ' + r.longitude.toFixed(6));
    });
  }, [getCurrentLocation]);

  const handleAnalyze = useCallback(() => {
    if (!title && !description) { Platform.OS === 'web' ? alert('Enter title and description first.') : Alert.alert('Missing Info', 'Enter title and description first.'); return; }
    setAnalyzing(true);
    analyzeComplaintAI(title, description, category).then(r => { 
      setAiResult(r); 
      setCategory(r.category); 
      setPriority(r.priority.toLowerCase()); 
      setAnalyzing(false); 
    });
  }, [title, description, category]);

  const handleSubmit = useCallback(() => {
    if (!title.trim() || !description.trim() || !category) { 
      Platform.OS === 'web' ? alert('Please fill in the title, category, and description.') : Alert.alert('Missing Fields', 'Please fill in the title, category, and description.'); 
      return; 
    }
    setSubmitting(true);
    const nc = { 
      id: generateId(), 
      title: title.trim(), 
      description: description.trim(), 
      category, 
      status: 'pending', 
      priority, 
      location: location || 'Not specified', 
      worker_id: null, 
      created_at: Date.now(), 
      updated_at: Date.now(), 
      upvotes: 0, 
      photo: photo || (lastImage ? lastImage.uri : (lastFile ? lastFile.uri : null)), 
      lat, 
      lng, 
      ai_risk: aiResult ? aiResult.risk : 'Medium', 
      ai_category: aiResult ? aiResult.suggestion : '', 
      resolution_notes: '' 
    };
    mutate(nc).then(() => {
      setSubmitting(false);
      if (Platform.OS === 'web') {
        alert('Complaint submitted successfully! ID: ' + nc.id);
        navigation.goBack();
      } else {
        Alert.alert('Success! 🎉', 'Your complaint has been submitted.\nID: ' + nc.id, [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    }).catch(e => { 
      setSubmitting(false); 
      Platform.OS === 'web' ? alert(e.message) : Alert.alert('Submission Error', e.message); 
    });
  }, [title, description, category, priority, location, photo, lat, lng, aiResult, lastFile, mutate, navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 8, paddingBottom: 14, paddingHorizontal: 20, backgroundColor: BG, borderBottomWidth: 1, borderBottomColor: BORDER, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 14, width: 40, height: 40, borderRadius: 20, backgroundColor: CARD, justifyContent: 'center', alignItems: 'center' }}>
          <MaterialIcons name="arrow-back" size={24} color={TEXT} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: TEXT, fontSize: 18, fontWeight: 'bold' }}>Raise Complaint</Text>
          <Text style={{ color: TEXT2, fontSize: 12 }}>AI-powered categorization</Text>
        </View>
        <TouchableOpacity onPress={handleAnalyze} disabled={analyzing} style={{ backgroundColor: ACCENT + '22', borderRadius: 12, padding: 8, borderWidth: 1, borderColor: ACCENT + '44' }}>
          {analyzing ? <ActivityIndicator size="small" color={ACCENT} /> : <MaterialIcons name="psychology" size={22} color={ACCENT} />}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled={Platform.OS !== 'web'}
      >
        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }} 
          showsVerticalScrollIndicator={true}
          // Enable mouse wheel scrolling explicitly for web if needed (standard ScrollView should handle it)
          scrollEventThrottle={16}
        >
          {/* Section: Basic Info */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: TEXT, fontSize: 16, fontWeight: '700', marginBottom: 12 }}>Complaint Details</Text>
            
            <Text style={{ color: TEXT2, fontSize: 13, marginBottom: 8 }}>Complaint Title *</Text>
            <TextInput 
              value={title} 
              onChangeText={setTitle} 
              placeholder="e.g. Broken streetlight in Block C" 
              placeholderTextColor={TEXT2 + '88'} 
              style={{ backgroundColor: CARD, borderRadius: 12, padding: 16, color: TEXT, fontSize: 15, borderWidth: 1, borderColor: BORDER }} 
            />
          </View>

          {/* Section: Category Selection */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: TEXT2, fontSize: 13, marginBottom: 12 }}>Category *</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 }}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity 
                  key={cat.id} 
                  onPress={() => setCategory(cat.id)} 
                  style={{ 
                    flexDirection: 'row', alignItems: 'center', 
                    backgroundColor: category === cat.id ? cat.color : CARD, 
                    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, margin: 4, 
                    borderWidth: 1, borderColor: category === cat.id ? cat.color : BORDER,
                    shadowColor: category === cat.id ? cat.color : '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: category === cat.id ? 0.3 : 0,
                    shadowRadius: 4,
                    elevation: category === cat.id ? 4 : 0
                  }}
                >
                  <MaterialIcons name={cat.icon} size={18} color={category === cat.id ? '#fff' : cat.color} />
                  <Text style={{ color: category === cat.id ? '#fff' : TEXT2, fontSize: 13, marginLeft: 8, fontWeight: '600' }}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Section: Description */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: TEXT2, fontSize: 13, marginBottom: 8 }}>Detailed Description *</Text>
            <TextInput 
              value={description} 
              onChangeText={setDescription} 
              placeholder="Please provide details about the issue..." 
              placeholderTextColor={TEXT2 + '88'} 
              style={{ backgroundColor: CARD, borderRadius: 12, padding: 16, color: TEXT, fontSize: 15, borderWidth: 1, borderColor: BORDER, minHeight: 120, textAlignVertical: 'top' }} 
              multiline 
            />
          </View>

          {/* Section: Location */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: TEXT2, fontSize: 13, marginBottom: 8 }}>Location</Text>
            <View style={{ flexDirection: 'row' }}>
              <TextInput 
                value={location} 
                onChangeText={setLocation} 
                placeholder="Auto-fetch or type location" 
                placeholderTextColor={TEXT2 + '88'} 
                style={{ flex: 1, backgroundColor: CARD, borderRadius: 12, padding: 16, color: TEXT, fontSize: 15, borderWidth: 1, borderColor: BORDER, marginRight: 10 }} 
              />
              <TouchableOpacity 
                onPress={handleGetLocation} 
                style={{ backgroundColor: PRIMARY + '15', borderRadius: 12, width: 54, height: 54, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: PRIMARY + '33' }}
              >
                <MaterialIcons name="my-location" size={24} color={PRIMARY} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Section: Priority */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: TEXT2, fontSize: 13, marginBottom: 12 }}>Priority Level</Text>
            <View style={{ flexDirection: 'row', marginHorizontal: -4 }}>
              {['low','medium','high','critical'].map(p => (
                <TouchableOpacity 
                  key={p} 
                  onPress={() => setPriority(p)} 
                  style={{ 
                    flex: 1, margin: 4, paddingVertical: 12, borderRadius: 12, alignItems: 'center', 
                    backgroundColor: priority === p ? getPriorityColor(p) : CARD, 
                    borderWidth: 1, borderColor: priority === p ? getPriorityColor(p) : BORDER 
                  }}
                >
                  <Text style={{ color: priority === p ? '#fff' : TEXT2, fontSize: 13, fontWeight: 'bold' }}>{p.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Section: Evidence */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: TEXT2, fontSize: 13, marginBottom: 12 }}>Add Evidence (Photos)</Text>
            <View style={{ flexDirection: 'row', marginHorizontal: -4 }}>
              <TouchableOpacity onPress={() => takePhoto().then(r => { if (r.error) alert(r.error); })} style={{ flex: 1, margin: 4, backgroundColor: CARD, borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 2, borderColor: BORDER, borderStyle: 'dashed' }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: PRIMARY + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
                  <MaterialIcons name="camera-alt" size={24} color={PRIMARY} />
                </View>
                <Text style={{ color: TEXT, fontSize: 12, fontWeight: '700' }}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => pickImage()} style={{ flex: 1, margin: 4, backgroundColor: CARD, borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 2, borderColor: BORDER, borderStyle: 'dashed' }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: ACCENT + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
                  {ipLoading ? <ActivityIndicator size="small" color={ACCENT} /> : <MaterialIcons name="photo-library" size={24} color={ACCENT} />}
                </View>
                <Text style={{ color: TEXT, fontSize: 12, fontWeight: '700' }}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>

          {photo && (
            <View style={{ marginBottom: 24, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: BORDER }}>
              <Image source={{ uri: photo }} style={{ width: '100%', height: 220 }} resizeMode="cover" />
              <TouchableOpacity onPress={() => setPhoto(null)} style={{ position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 6 }}>
                <MaterialIcons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          {/* AI Result Feedback */}
          {aiResult && (
            <View style={{ backgroundColor: ACCENT + '10', borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: ACCENT + '30' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <MaterialIcons name="auto-awesome" size={22} color={ACCENT} />
                <Text style={{ color: ACCENT, fontSize: 16, fontWeight: 'bold', marginLeft: 10 }}>AI Optimization Applied</Text>
              </View>
              <View style={{ backgroundColor: CARD, borderRadius: 12, padding: 12 }}>
                <Text style={{ color: TEXT2, fontSize: 12 }}>Auto-suggested Priority & Category based on your input.</Text>
                <Text style={{ color: TEXT, fontSize: 14, marginTop: 4 }}>{aiResult.suggestion}</Text>
              </View>
            </View>
          )}

          {/* Final Submit Button */}
          <TouchableOpacity 
            onPress={handleSubmit} 
            disabled={submitting} 
            activeOpacity={0.8}
            style={{ 
              backgroundColor: PRIMARY, 
              borderRadius: 18, 
              paddingVertical: 20, 
              alignItems: 'center', 
              justifyContent: 'center', 
              flexDirection: 'row',
              shadowColor: PRIMARY,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
              opacity: submitting ? 0.7 : 1,
              marginTop: 10
            }}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" style={{ marginRight: 12 }} />
            ) : (
              <MaterialIcons name="check-circle" size={24} color="#fff" style={{ marginRight: 12 }} />
            )}
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
              {submitting ? 'RAISING COMPLAINT...' : 'SUBMIT COMPLAINT'}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
