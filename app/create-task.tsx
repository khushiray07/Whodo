import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { DatePicker } from '../components/ui/DatePicker';
import { ParticipantPicker } from '../components/ParticipantPicker';
import { useParticipants } from '../hooks/useParticipants';
import { useTasks } from '../hooks/useTasks';
import { supabase } from '../lib/supabase';
import { colors, fonts, spacing, radii } from '../constants/theme';
import { strings } from '../constants/strings';
import { showAlert } from '../lib/alert';
import { WebContainer } from '../components/WebContainer';
import type { Task } from '../types/database';

export default function CreateTaskScreen() {
  const { planId, taskId } = useLocalSearchParams<{ planId: string; taskId?: string }>();
  const { participants, getMyParticipant } = useParticipants(planId);
  const { createTask } = useTasks(planId);

  const isEditing = !!taskId;
  const [title, setTitle] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);
  const [deadline, setDeadline] = useState('');
  const [expense, setExpense] = useState('');
  const [loading, setLoading] = useState(false);
  const [myParticipant, setMyParticipant] = useState<any>(null);

  useEffect(() => {
    getMyParticipant().then(setMyParticipant);
  }, [getMyParticipant]);

  // Load existing task data when editing
  useEffect(() => {
    if (!taskId) return;
    (async () => {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();
      if (data) {
        setTitle(data.title ?? '');
        setSelectedParticipant(data.assigned_to);
        setDeadline(data.deadline ?? '');
        setExpense(data.expense_amount ? String(data.expense_amount) : '');
      }
    })();
  }, [taskId]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      showAlert('Task name required');
      return;
    }
    if (!myParticipant) {
      showAlert('Error', 'You must be a participant in this plan.');
      return;
    }
    setLoading(true);
    try {
      const expenseNum = expense ? parseFloat(expense) : undefined;

      if (isEditing) {
        // Update existing task
        const updates: Record<string, unknown> = {
          title: title.trim(),
          assigned_to: selectedParticipant || null,
          deadline: deadline || null,
        };
        if (expenseNum && expenseNum > 0) {
          updates.expense_amount = expenseNum;
          updates.expense_paid_by = selectedParticipant ?? myParticipant.id;
        }
        const { error } = await supabase
          .from('tasks')
          .update(updates)
          .eq('id', taskId);
        if (error) throw error;
      } else {
        // Create new task
        await createTask(
          myParticipant.id,
          title.trim(),
          selectedParticipant ?? undefined,
          deadline || undefined,
          expenseNum && expenseNum > 0 ? expenseNum : undefined,
          expenseNum && expenseNum > 0 ? (selectedParticipant ?? myParticipant.id) : undefined,
        );
      }
      router.back();
    } catch (e: any) {
      showAlert(strings.genericError, e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <WebContainer>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerSub}>{isEditing ? 'Edit Task' : 'New Task'}</Text>
              <Text style={styles.headerBrand}>{strings.appName}</Text>
            </View>
          </View>

          {/* Task Name */}
          <View style={styles.section}>
            <Text style={styles.label}>Task Details</Text>
            <Input
              placeholder={strings.createTaskPlaceholder}
              value={title}
              onChangeText={setTitle}
              style={styles.bigInput}
            />
          </View>

          {/* Person Picker */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{strings.pickPerson}</Text>
              <Text style={styles.sectionHint}>Choose One</Text>
            </View>
            <ParticipantPicker
              participants={participants}
              selectedId={selectedParticipant}
              onSelect={(p) => setSelectedParticipant(p.id)}
            />
          </View>

          {/* Deadline */}
          <DatePicker
            label={strings.deadline}
            value={deadline}
            onChange={setDeadline}
            placeholder="Tap to pick a deadline"
          />

          {/* Expense */}
          <Input
            label={strings.optionalKharcha + ' (₹)'}
            placeholder="Enter amount (e.g. 500)"
            value={expense}
            onChangeText={setExpense}
            keyboardType="numeric"
          />
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.bottomCta}>
          <Button
            title={isEditing ? 'Save Changes' : 'Submit'}
            onPress={handleSubmit}
            loading={loading}
            disabled={!title.trim()}
            icon={<Text style={{ fontSize: 18, color: '#fff' }}>✓</Text>}
          />
        </View>
      </WebContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: spacing.md,
  },
  closeBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 18,
    color: colors.primary,
  },
  headerSub: {
    fontFamily: fonts.headlineMedium,
    fontSize: 14,
    color: colors.primary,
  },
  headerBrand: {
    fontFamily: fonts.headlineExtra,
    fontSize: 28,
    color: colors.primary,
    letterSpacing: -1,
  },
  section: {
    gap: 12,
  },
  label: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 12,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  bigInput: {
    fontSize: 20,
    fontFamily: fonts.headlineExtra,
    paddingVertical: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: fonts.headlineExtra,
    fontSize: 18,
    color: colors.onSurface,
  },
  sectionHint: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 12,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bottomCta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
    paddingTop: 16,
    backgroundColor: colors.background,
  },
});
