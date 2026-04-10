import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { DatePicker } from '../components/ui/DatePicker';
import { TemplateCard } from '../components/TemplateCard';
import { Avatar } from '../components/ui/Avatar';
import { usePlans } from '../hooks/usePlans';
import { useAuth } from '../hooks/useAuth';
import { templates } from '../lib/templates';
import { assignColor } from '../lib/colors';
import { colors, fonts, spacing, radii } from '../constants/theme';
import { strings } from '../constants/strings';
import { showAlert } from '../lib/alert';
import { WebContainer } from '../components/WebContainer';
import type { PlanTemplate } from '../types/database';

export default function CreatePlanScreen() {
  const { template: initialTemplate } = useLocalSearchParams<{ template?: string }>();
  const { createPlan } = usePlans();
  const { profile } = useAuth();

  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<PlanTemplate>(
    (initialTemplate as PlanTemplate) || 'custom'
  );
  const [participantNames, setParticipantNames] = useState<string[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  const addParticipant = () => {
    const trimmed = newName.trim();
    if (trimmed && !participantNames.includes(trimmed)) {
      setParticipantNames([...participantNames, trimmed]);
      setNewName('');
    }
  };

  const removeParticipant = (name: string) => {
    setParticipantNames(participantNames.filter((n) => n !== name));
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      showAlert('Plan name required');
      return;
    }
    setLoading(true);
    try {
      const plan = await createPlan(
        title.trim(),
        selectedTemplate,
        eventDate || null,
        participantNames,
      );
      router.replace(`/plan/${plan.id}`);
    } catch (e: any) {
      showAlert(strings.genericError, e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <WebContainer>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{strings.createPlanTitle}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Scrollable content */}
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>{strings.createPlanSubtitle}</Text>

          <Input
            label={strings.planNameLabel}
            placeholder={strings.planNamePlaceholder}
            value={title}
            onChangeText={setTitle}
          />

          <DatePicker
            label={strings.planDateLabel}
            value={eventDate}
            onChange={setEventDate}
            placeholder="Tap to pick a date"
          />

          <Text style={styles.label}>{strings.templateLabel}</Text>
          <View style={styles.templateGrid}>
            {templates.map((t) => (
              <View key={t.key} style={styles.templateCell}>
                <TemplateCard
                  template={t}
                  selected={selectedTemplate === t.key}
                  onPress={() => setSelectedTemplate(t.key)}
                />
              </View>
            ))}
          </View>

          {/* Organizer */}
          <View style={styles.peopleSection}>
            <Text style={styles.peopleTitle}>Organizer (You)</Text>
            <View style={styles.organizerRow}>
              <Avatar name={profile?.display_name ?? 'You'} color={assignColor(0)} size={40} />
              <View>
                <Text style={styles.chipName}>{profile?.display_name ?? 'You'}</Text>
                <Text style={styles.organizerLabel}>Managing this plan</Text>
              </View>
            </View>
          </View>

          {/* Participants */}
          <View style={styles.peopleSection}>
            <Text style={styles.peopleTitle}>Who's involved?</Text>
            <Text style={styles.peopleSubtitle}>Add people to assign tasks and split expenses.</Text>

            <View style={styles.chipList}>
              {participantNames.map((name, i) => (
                <View key={name} style={styles.chip}>
                  <Avatar name={name} color={assignColor(i + 1)} size={32} />
                  <Text style={styles.chipName}>{name}</Text>
                  <TouchableOpacity onPress={() => removeParticipant(name)}>
                    <Text style={styles.chipRemove}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={styles.addNameRow}>
              <TextInput
                style={styles.nameInput}
                placeholder="Add a person's name..."
                placeholderTextColor={colors.outlineVariant}
                value={newName}
                onChangeText={setNewName}
                onSubmitEditing={addParticipant}
                returnKeyType="done"
              />
              {newName.trim() ? (
                <TouchableOpacity onPress={addParticipant} style={styles.addBtn}>
                  <Text style={styles.addBtnText}>Add</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </ScrollView>

        {/* Fixed bottom button */}
        <View style={styles.bottomBar}>
          <Button
            title="Submit"
            onPress={handleCreate}
            loading={loading}
            disabled={!title.trim()}
          />
          <Text style={styles.hint}>{strings.noStress}</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: 12,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 18,
    color: colors.onSurfaceVariant,
  },
  title: {
    flex: 1,
    fontFamily: fonts.headlineExtra,
    fontSize: 22,
    color: colors.onSurface,
    textAlign: 'center',
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 20,
    gap: 20,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.onSurfaceVariant,
  },
  label: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 12,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  templateCell: {
    width: '48%',
    flexGrow: 1,
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  organizerLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  peopleSection: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.default,
    padding: spacing.lg,
    gap: 12,
  },
  peopleTitle: {
    fontFamily: fonts.headlineExtra,
    fontSize: 22,
    color: colors.onSurface,
  },
  peopleSubtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  chipList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.full,
    paddingRight: 12,
    paddingLeft: 4,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.primary + '1A',
  },
  chipName: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 13,
    color: colors.onSurface,
  },
  chipRemove: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginLeft: 4,
  },
  addNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameInput: {
    flex: 1,
    height: 48,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.onSurface,
  },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addBtnText: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 13,
    color: colors.onPrimary,
  },
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: colors.background,
    borderTopWidth: 0,
    gap: 8,
  },
  hint: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
