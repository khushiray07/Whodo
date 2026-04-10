import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { colors, fonts, spacing, radii } from '../../constants/theme';
import { strings } from '../../constants/strings';
import { showConfirm, showAlert } from '../../lib/alert';

type ProfileStats = {
  totalPlans: number;
  activePlans: number;
  tasksCompleted: number;
  tasksPending: number;
  totalExpensesPaid: number;
  totalOwed: number;
  totalOwing: number;
};

export default function ProfileScreen() {
  const { profile, session, isAuthenticated, logout, createProfile, updateProfile } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(profile?.display_name ?? '');
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.display_name);
      fetchStats();
    }
  }, [profile]);

  const pickAndUploadAvatar = async () => {
    if (!session?.user?.id) return;
    setUploading(true);

    try {
      if (Platform.OS === 'web') {
        // Web: use file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e: any) => {
          const file = e.target.files?.[0];
          if (!file) { setUploading(false); return; }
          const ext = file.name.split('.').pop() ?? 'jpg';
          const path = `${session.user.id}/avatar.${ext}`;
          const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
          if (error) { showAlert('Upload failed', error.message); setUploading(false); return; }
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
          await updateProfile({ avatar_url: urlData.publicUrl + '?t=' + Date.now() });
          showAlert('Photo updated!');
          setUploading(false);
        };
        input.click();
      } else {
        // Native: use expo-image-picker
        const ImagePicker = require('expo-image-picker');
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });
        if (result.canceled) { setUploading(false); return; }
        const uri = result.assets[0].uri;
        const ext = uri.split('.').pop() ?? 'jpg';
        const path = `${session.user.id}/avatar.${ext}`;
        const response = await fetch(uri);
        const blob = await response.blob();
        const { error } = await supabase.storage.from('avatars').upload(path, blob, {
          upsert: true,
          contentType: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
        });
        if (error) { showAlert('Upload failed', error.message); setUploading(false); return; }
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
        await updateProfile({ avatar_url: urlData.publicUrl + '?t=' + Date.now() });
        showAlert('Photo updated!');
      }
    } catch (e: any) {
      showAlert('Upload failed', e.message);
    }
    setUploading(false);
  };

  const fetchStats = async () => {
    if (!session?.user?.id) return;
    setLoadingStats(true);

    // Get all plans I'm a participant in
    const { data: myParticipations } = await supabase
      .from('participants')
      .select('id, plan_id')
      .eq('user_id', session.user.id);

    const participantIds = (myParticipations ?? []).map((p) => p.id);
    const planIds = [...new Set((myParticipations ?? []).map((p) => p.plan_id))];

    // Plan counts
    const { data: plans } = await supabase
      .from('plans')
      .select('id, status')
      .in('id', planIds.length > 0 ? planIds : ['none']);

    const totalPlans = plans?.length ?? 0;
    const activePlans = plans?.filter((p) => p.status === 'active').length ?? 0;

    // Task stats across all plans
    const { data: tasks } = await supabase
      .from('tasks')
      .select('status, assigned_to, expense_amount, expense_paid_by, created_by')
      .in('plan_id', planIds.length > 0 ? planIds : ['none']);

    const myTasks = (tasks ?? []).filter((t) => participantIds.includes(t.assigned_to));
    const tasksCompleted = myTasks.filter((t) => t.status === 'done').length;
    const tasksPending = myTasks.filter((t) => t.status === 'pending').length;

    // Expenses I paid
    const totalExpensesPaid = (tasks ?? [])
      .filter((t) => t.expense_amount && (participantIds.includes(t.expense_paid_by) || (!t.expense_paid_by && participantIds.includes(t.assigned_to))))
      .reduce((sum, t) => sum + (t.expense_amount ?? 0), 0);

    setStats({
      totalPlans,
      activePlans,
      tasksCompleted,
      tasksPending,
      totalExpensesPaid,
      totalOwed: 0,
      totalOwing: 0,
    });
    setLoadingStats(false);
  };

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

  if (!profile) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.setupTitle}>What should we call you?</Text>
          <Input placeholder="Your name" value={name} onChangeText={setName} />
          <Button
            title="Let's go!"
            onPress={async () => { if (name.trim()) await createProfile(name.trim()); }}
            disabled={!name.trim()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    if (name.trim() && name.trim() !== profile.display_name) {
      await updateProfile({ display_name: name.trim() });
      showAlert('Profile updated!');
    }
    setEditMode(false);
  };

  const email = session?.user?.email ?? '';
  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : '';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{strings.profileTitle}</Text>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity onPress={pickAndUploadAvatar} disabled={uploading} activeOpacity={0.7}>
            <Avatar name={profile.display_name} color={colors.primary} size={88} imageUrl={profile.avatar_url} />
            <View style={styles.cameraBadge}>
              <Text style={styles.cameraIcon}>{uploading ? '...' : '📷'}</Text>
            </View>
          </TouchableOpacity>

          {editMode ? (
            <View style={styles.editSection}>
              <Input value={name} onChangeText={setName} placeholder="Your name" />
              <View style={styles.editButtons}>
                <TouchableOpacity onPress={() => { setName(profile.display_name); setEditMode(false); }} style={styles.cancelBtn}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.displayName}>{profile.display_name}</Text>
              {email ? <Text style={styles.email}>{email}</Text> : null}
              {memberSince ? <Text style={styles.memberSince}>Member since {memberSince}</Text> : null}
              <TouchableOpacity
                onPress={() => { setName(profile.display_name); setEditMode(true); }}
                style={styles.editBtn}
              >
                <Text style={styles.editBtnText}>✏️ Edit Name</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Stats */}
        {stats && !loadingStats && (
          <>
            <Text style={styles.sectionTitle}>Your Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statEmoji}>📋</Text>
                <Text style={styles.statNumber}>{stats.totalPlans}</Text>
                <Text style={styles.statLabel}>Plans</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statEmoji}>🟢</Text>
                <Text style={styles.statNumber}>{stats.activePlans}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statEmoji}>✅</Text>
                <Text style={styles.statNumber}>{stats.tasksCompleted}</Text>
                <Text style={styles.statLabel}>Done</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statEmoji}>⏳</Text>
                <Text style={styles.statNumber}>{stats.tasksPending}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
            </View>

            <View style={styles.expenseCard}>
              <View style={styles.expenseRow}>
                <Text style={styles.expenseLabel}>Total expenses paid</Text>
                <Text style={styles.expenseAmount}>₹{stats.totalExpensesPaid.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text>
              </View>
            </View>
          </>
        )}

        {loadingStats && (
          <View style={styles.loadingStats}>
            {[1, 2].map((i) => (
              <View key={i} style={[styles.statCard, { opacity: 0.3 }]} />
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => showConfirm('Logout', 'Are you sure you want to logout?', logout, 'Logout')}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  center: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.lg, gap: 20, alignItems: 'center' },
  brand: { fontFamily: fonts.headlineExtra, fontSize: 48, color: colors.primary },
  subtitle: { fontFamily: fonts.body, fontSize: 16, color: colors.onSurfaceVariant },
  setupTitle: { fontFamily: fonts.headlineExtra, fontSize: 24, color: colors.onSurface },
  title: { fontFamily: fonts.headlineExtra, fontSize: 32, color: colors.onSurface, marginBottom: spacing.lg },

  // Profile card
  profileCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  cameraIcon: { fontSize: 14 },
  displayName: { fontFamily: fonts.headlineExtra, fontSize: 26, color: colors.onSurface, marginTop: 4 },
  email: { fontFamily: fonts.body, fontSize: 14, color: colors.onSurfaceVariant },
  memberSince: { fontFamily: fonts.body, fontSize: 12, color: colors.outline },
  editBtn: {
    backgroundColor: colors.primary + '10',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radii.full,
    marginTop: 4,
  },
  editBtnText: { fontFamily: fonts.headlineSemiBold, fontSize: 13, color: colors.primary },

  editSection: { width: '100%', gap: 12 },
  editButtons: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radii.default,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
  },
  cancelText: { fontFamily: fonts.headlineSemiBold, fontSize: 15, color: colors.onSurfaceVariant },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radii.default,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  saveText: { fontFamily: fonts.headlineSemiBold, fontSize: 15, color: '#ffffff' },

  // Stats
  sectionTitle: {
    fontFamily: fonts.headlineExtra,
    fontSize: 20,
    color: colors.onSurface,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.default,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  statEmoji: { fontSize: 20 },
  statNumber: { fontFamily: fonts.headlineExtra, fontSize: 22, color: colors.primary },
  statLabel: { fontFamily: fonts.bodySemiBold, fontSize: 10, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5 },

  expenseCard: {
    backgroundColor: colors.primary + '08',
    borderRadius: radii.default,
    padding: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.primary + '15',
  },
  expenseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  expenseLabel: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.onSurfaceVariant },
  expenseAmount: { fontFamily: fonts.headlineExtra, fontSize: 22, color: colors.primary },

  loadingStats: { flexDirection: 'row', gap: 10, marginTop: spacing.lg },

  // Actions
  actions: { marginTop: spacing.xl },
  logoutBtn: {
    backgroundColor: colors.error + '10',
    borderRadius: radii.default,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutText: { fontFamily: fonts.headlineSemiBold, fontSize: 16, color: colors.error },
});
