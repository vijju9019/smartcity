import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Dimensions, ActivityIndicator, Modal } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PRIMARY, BG, CARD, TEXT, TEXT2, BORDER, ACCENT, SECONDARY, SUCCESS, useApp } from './core';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { setUserName, setUserEmail, setRole } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [googleModalVisible, setGoogleModalVisible] = useState(false);
  const [otherAccVisible, setOtherAccVisible] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  const GOOGLE_ACCOUNTS = [
    { name: 'Kshitij Dinni', email: 'kshitijdinni6605@gmail.com', role: 'resident', avatar: 'K' },
    { name: 'Colony Admin', email: 'admin@colony.care', role: 'admin', avatar: 'A' },
    { name: 'City Worker', email: 'worker@colony.care', role: 'worker', avatar: 'W' },
  ];

  const handleLogin = () => {
    // Simulate login
    const lowEmail = email.toLowerCase();
    const roleToSet = lowEmail.includes('admin') ? 'admin' : lowEmail.includes('worker') ? 'worker' : 'resident';
    
    setUserName(email.split('@')[0] || (roleToSet.charAt(0).toUpperCase() + roleToSet.slice(1)));
    setUserEmail(email || `${roleToSet}@colony.care`);
    setRole(roleToSet);
    navigation.replace('MainApp');
  };

  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const handleGoogleLogin = () => {
    setGoogleModalVisible(true);
  };

  const selectGoogleAccount = (acc) => {
    setLoadingGoogle(true);
    setGoogleModalVisible(false);
    setOtherAccVisible(false);
    setTimeout(() => {
      setUserName(acc.name);
      setUserEmail(acc.email);
      setRole(acc.role || 'resident');
      setLoadingGoogle(false);
      navigation.replace('MainApp');
    }, 1500);
  };

  const handleUseOtherAccount = () => {
    setGoogleModalVisible(false);
    setOtherAccVisible(true);
  };

  const submitCustomAccount = () => {
    if (!customName || !customEmail) {
      if (Platform.OS === 'web') alert('Please fill in both name and email');
      return;
    }
    selectGoogleAccount({ name: customName, email: customEmail, role: 'resident', avatar: customName.charAt(0).toUpperCase() });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: BG }}
      enabled={Platform.OS !== 'web'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
        <View style={{ paddingTop: insets.top + 60, paddingHorizontal: 30, alignItems: 'center' }}>
          <View style={{ width: 70, height: 70, borderRadius: 22, backgroundColor: PRIMARY, justifyContent: 'center', alignItems: 'center', marginBottom: 20, transform: [{ rotate: '45deg' }] }}>
            <View style={{ transform: [{ rotate: '-45deg' }] }}>
              <MaterialIcons name="location-city" size={38} color="#fff" />
            </View>
          </View>
          
          <Text style={{ color: TEXT, fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 6 }}>Welcome Back</Text>
          <Text style={{ color: TEXT2, fontSize: 14, textAlign: 'center', marginBottom: 40 }}>Login to access your colony portal</Text>

          <View style={{ width: '100%', backgroundColor: CARD, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: BORDER }}>
            <Text style={{ color: TEXT2, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' }}>Login with Social</Text>
            
            <View style={{ flexDirection: 'row', marginBottom: 24 }}>
              <TouchableOpacity 
                onPress={handleGoogleLogin}
                disabled={loadingGoogle}
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 12, paddingVertical: 12, opacity: loadingGoogle ? 0.7 : 1 }}
              >
                {loadingGoogle ? (
                  <ActivityIndicator size="small" color="#EA4335" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="google" size={18} color="#EA4335" />
                    <Text style={{ color: '#000', fontSize: 13, fontWeight: 'bold', marginLeft: 8 }}>Google</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: BORDER }} />
              <Text style={{ color: TEXT2, fontSize: 12, marginHorizontal: 10 }}>OR</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: BORDER }} />
            </View>

            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: BG, borderRadius: 12, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 12 }}>
                <MaterialIcons name="mail-outline" size={20} color={TEXT2} />
                <TextInput 
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email or Phone"
                  placeholderTextColor={TEXT2 + '66'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, color: TEXT, fontSize: 14 }}
                />
              </View>
            </View>

            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: BG, borderRadius: 12, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 12 }}>
                <MaterialIcons name="lock-outline" size={20} color={TEXT2} />
                <TextInput 
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor={TEXT2 + '66'}
                  secureTextEntry={!showPassword}
                  style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, color: TEXT, fontSize: 14 }}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                  <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color={TEXT2} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name={rememberMe ? "check-box" : "check-box-outline-blank"} size={20} color={rememberMe ? PRIMARY : TEXT2} />
                <Text style={{ color: TEXT2, fontSize: 13, marginLeft: 6 }}>Remember me</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={{ color: PRIMARY, fontSize: 13, fontWeight: '600' }}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              onPress={handleLogin}
              style={{ backgroundColor: PRIMARY, borderRadius: 14, paddingVertical: 15, alignItems: 'center', shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}
            >
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>Login to Account</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigation.navigate('Signup')}
              style={{ marginTop: 20, alignItems: 'center' }}
            >
              <Text style={{ color: TEXT2, fontSize: 13 }}>Don't have an account? <Text style={{ color: PRIMARY, fontWeight: 'bold' }}>Sign up</Text></Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Google Account Picker Modal */}
        <Modal visible={googleModalVisible} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <View style={{ width: '100%', maxWidth: 340, backgroundColor: '#fff', borderRadius: 24, paddingVertical: 24 }}>
              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <MaterialCommunityIcons name="google" size={32} color="#EA4335" />
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#202124', marginTop: 12 }}>Choose an account</Text>
                <Text style={{ fontSize: 13, color: '#5f6368', marginTop: 4 }}>to continue to Colony Care</Text>
              </View>
              
              <View style={{ marginBottom: 10 }}>
                {GOOGLE_ACCOUNTS.map((acc, index) => (
                  <TouchableOpacity 
                    key={index}
                    onPress={() => selectGoogleAccount(acc)}
                    style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      paddingHorizontal: 24, 
                      paddingVertical: 14, 
                      borderBottomWidth: index === GOOGLE_ACCOUNTS.length - 1 ? 0 : 1, 
                      borderBottomColor: '#f1f3f4' 
                    }}
                  >
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: PRIMARY + '22', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                      <Text style={{ color: PRIMARY, fontWeight: 'bold' }}>{acc.avatar}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#3c4043' }}>{acc.name}</Text>
                      <Text style={{ fontSize: 12, color: '#5f6368' }}>{acc.email}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                onPress={handleUseOtherAccount}
                style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#f1f3f4' }}
              >
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#f1f3f4', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                  <MaterialIcons name="person-add-alt" size={20} color="#5f6368" />
                </View>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#3c4043' }}>Use another account</Text>
              </TouchableOpacity>

              <View style={{ paddingHorizontal: 24, marginTop: 12 }}>
                <Text style={{ fontSize: 11, color: '#5f6368', textAlign: 'center' }}>
                  To continue, Google will share your name, email address, and profile picture with Colony Care.
                </Text>
              </View>

              <TouchableOpacity 
                onPress={() => setGoogleModalVisible(false)}
                style={{ alignSelf: 'center', marginTop: 20, padding: 10 }}
              >
                <Text style={{ color: PRIMARY, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/* Other Account Input Modal */}
        <Modal visible={otherAccVisible} transparent animationType="slide">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <View style={{ width: '100%', maxWidth: 340, backgroundColor: '#fff', borderRadius: 24, padding: 24 }}>
              <View style={{ alignItems: 'center', marginBottom: 24 }}>
                <MaterialCommunityIcons name="google" size={32} color="#EA4335" />
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#202124', marginTop: 12 }}>Sign in</Text>
                <Text style={{ fontSize: 14, color: '#5f6368', marginTop: 4 }}>with your Google Account</Text>
              </View>

              <View style={{ marginBottom: 16 }}>
                <TextInput 
                  placeholder="Full Name" 
                  value={customName}
                  onChangeText={setCustomName}
                  placeholderTextColor="#9CA3AF"
                  style={{ width: '100%', borderBottomWidth: 1, borderBottomColor: '#dadce0', paddingVertical: 10, fontSize: 15, color: '#202124' }} 
                />
              </View>

              <View style={{ marginBottom: 24 }}>
                <TextInput 
                  placeholder="Email" 
                  value={customEmail}
                  onChangeText={setCustomEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#9CA3AF"
                  style={{ width: '100%', borderBottomWidth: 1, borderBottomColor: '#dadce0', paddingVertical: 10, fontSize: 15, color: '#202124' }} 
                />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => setOtherAccVisible(false)} style={{ marginRight: 16 }}>
                  <Text style={{ color: PRIMARY, fontWeight: '700' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={submitCustomAccount}
                  style={{ backgroundColor: PRIMARY, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Next</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
