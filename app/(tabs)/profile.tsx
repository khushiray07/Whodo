import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { colors, fonts, spacing, radii } from '../../constants/theme';
import { strings } from '../../constants/strings';
import { showConfirm } from '../../lib/alert';

export default function ProfileScreen() {
  const { profile, isAuthenticated, logout, createProfile, updateProfile } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(profile?.display_name ?? '');

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.brand}>{strings.appName}</Text>
          <Text style={styles.subtitle}>{strings.loginSubtitle}</Text>
          <Button title="Login" onPress={() => router.push('/(auth)/login')} />
        </View>
      </SafeAreaView>
    );
  }

  // Profile setup for first-time users
  if (!profile) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.title}>What should we call you?</Text>
          <Input
            placeholder="Your name"
            value={name}
            onChangeText={setName}
          />
          <Button
            title="Submit"
            onPress={async () => {
              if (name.trim()) await createProfile(name.trim());
            }}
            disabled={!name.trim()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    if (name.trim()) {
      await updateProfile({ display_name: name.trim() });
      setEditMode(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>{strings.profileTitle}</Text>

        <View style={styles.card}>
          <Avatar name={profile.display_name} color={colors.primary} size={80} />
          {editMode ? (
            <View style={styles.editRow}>
              <Input
                value={name}
                onChangeText={setName}
                style={{ flex: 1 }}
              />
              <Button title="Save" onPress={handleSave} style={{ width: 80 }} />
            </View>
          ) : (
            <>
              <Text style={styles.displayName}>{profile.display_name}</Text>
              {profile.phone && <Text style={styles.phone}>{profile.phone}</Text>}
            </>
          )}
        </View>

        <View style={styles.actions}>
          {!editMode && (
            <Button
              title={strings.editProfile}
              variant="secondary"
              onPress={() => {
                setName(profile.display_name);
                setEditMode(true);
              }}
            />
          )}
          <Button
            title={strings.logout}
            variant="ghost"
            onPress={() => {
              showConfirm('Logout', 'Are you sure?', logout, 'Logout');
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: 20,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  title: {
    fontFamily: fonts.headlineExtra,
    fontSize: 32,
    color: colors.onSurface,
    marginBottom: spacing.xl,
  },
  brand: {
    fontFamily: fonts.headlineExtra,
    fontSize: 48,
    color: colors.primary,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.onSurfaceVariant,
  },
  card: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: 16,
  },
  displayName: {
    fontFamily: fonts.headlineExtra,
    fontSize: 24,
    color: colors.onSurface,
  },
  phone: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  editRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    width: '100%',
  },
  actions: {
    marginTop: spacing.xl,
    gap: 12,
  },
});
