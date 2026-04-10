import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { usePlan } from '../../hooks/usePlan';
import { shareViaWhatsApp, buildInviteMessage, buildInviteLink } from '../../lib/whatsapp';
import { colors, fonts, spacing, radii } from '../../constants/theme';
import { strings } from '../../constants/strings';
import * as Clipboard from 'expo-clipboard';

export default function ShareScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { plan } = usePlan(id);
  const [copied, setCopied] = useState(false);

  if (!plan) return null;

  const inviteLink = buildInviteLink(plan.invite_code);
  const message = buildInviteMessage(plan.title, plan.invite_code);

  const handleShare = async () => {
    const opened = await shareViaWhatsApp(plan.title, plan.invite_code);
    if (!opened) {
      Alert.alert(strings.copiedToClipboard, 'WhatsApp not found. Link copied to clipboard.');
    }
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{strings.shareTitle}</Text>
        <Text style={styles.subtitle}>{strings.shareSubtitle}</Text>

        {/* WhatsApp Preview */}
        <View style={styles.whatsappPreview}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle}>WhatsApp Preview</Text>
          </View>
          <View style={styles.chatBody}>
            <View style={styles.messageBubble}>
              <Text style={styles.messageTitle}>{plan.title}</Text>
              <Text style={styles.messageDesc}>Join our plan on Whodo! Everything from split-bills to tasks in one link.</Text>
              <Text style={styles.messageLink}>{inviteLink}</Text>
            </View>
          </View>
        </View>

        {/* Customize */}
        <View style={styles.customSection}>
          <Text style={styles.customTitle}>Customize Link</Text>
          <View style={styles.customCard}>
            <View style={styles.linkRow}>
              <Text style={styles.linkLabel}>Invite Code</Text>
              <Text style={styles.linkValue}>{plan.invite_code}</Text>
            </View>

            <View style={styles.buttonRow}>
              <Button
                title={strings.shareLink}
                onPress={handleShare}
                style={{ flex: 1 }}
                icon={<Text style={{ color: '#fff', fontSize: 16 }}>↗</Text>}
              />
              <Button
                title={copied ? '✓ Copied!' : strings.copyLink}
                variant="secondary"
                onPress={handleCopy}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
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
    paddingBottom: 40,
    gap: 20,
  },
  title: {
    fontFamily: fonts.headlineExtra,
    fontSize: 24,
    color: colors.onSurface,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  whatsappPreview: {
    borderRadius: radii.default,
    overflow: 'hidden',
    backgroundColor: '#e5ddd5',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  chatHeader: {
    backgroundColor: '#075e54',
    padding: 12,
  },
  chatTitle: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
  },
  chatBody: {
    padding: 16,
    alignItems: 'flex-end',
  },
  messageBubble: {
    backgroundColor: '#dcf8c6',
    borderRadius: 12,
    padding: 12,
    maxWidth: '85%',
  },
  messageTitle: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 14,
    color: '#1a1a1a',
  },
  messageDesc: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    lineHeight: 16,
  },
  messageLink: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#0066cc',
    marginTop: 4,
  },
  customSection: {
    gap: 12,
  },
  customTitle: {
    fontFamily: fonts.headlineExtra,
    fontSize: 20,
    color: colors.onSurface,
  },
  customCard: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radii.default,
    padding: 24,
    gap: 16,
  },
  linkRow: {
    gap: 4,
  },
  linkLabel: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 10,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  linkValue: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.onSurface,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
