import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { usePlan } from '../../hooks/usePlan';
import { shareViaWhatsApp, buildInviteMessage, buildInviteLink } from '../../lib/whatsapp';
import { colors, fonts, spacing, radii } from '../../constants/theme';
import { strings } from '../../constants/strings';
import * as Clipboard from 'expo-clipboard';
import { showAlert } from '../../lib/alert';
import { WebContainer } from '../../components/WebContainer';
import QRCode from 'react-native-qrcode-svg';

export default function ShareScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { plan } = usePlan(id);
  const [copied, setCopied] = useState(false);
  const [fullscreenQR, setFullscreenQR] = useState(false);

  if (!plan) return null;

  const inviteLink = buildInviteLink(plan.invite_code);
  const message = buildInviteMessage(plan.title, plan.invite_code);

  const handleShare = async () => {
    const opened = await shareViaWhatsApp(plan.title, plan.invite_code);
    if (!opened) {
      showAlert(strings.copiedToClipboard, 'WhatsApp not found. Link copied to clipboard.');
    }
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const screenWidth = Dimensions.get('window').width;
  const qrSize = Math.min(screenWidth - 80, 200);
  const fullscreenQRSize = Math.min(screenWidth - 60, 400);

  return (
    <SafeAreaView style={styles.safe}>
      <WebContainer>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{strings.shareTitle}</Text>
          <Text style={styles.subtitle}>{strings.shareSubtitle}</Text>

          {/* QR Code */}
          <TouchableOpacity onPress={() => setFullscreenQR(true)} activeOpacity={0.9}>
            <View style={styles.qrCard}>
              <Text style={styles.qrLabel}>Scan to Join</Text>
              <View style={styles.qrContainer}>
                <QRCode
                  value={inviteLink}
                  size={qrSize}
                  color={colors.onSurface}
                  backgroundColor="#ffffff"
                />
              </View>
              <Text style={styles.qrHint}>Tap for fullscreen</Text>
            </View>
          </TouchableOpacity>

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
      </WebContainer>

      {/* Fullscreen QR Modal (for projector) */}
      <Modal visible={fullscreenQR} animationType="fade" transparent>
        <Pressable style={styles.qrOverlay} onPress={() => setFullscreenQR(false)}>
          <View style={styles.qrFullscreenCard}>
            <Text style={styles.qrFullscreenTitle}>{plan.title}</Text>
            <QRCode
              value={inviteLink}
              size={fullscreenQRSize}
              color={colors.onSurface}
              backgroundColor="#ffffff"
            />
            <Text style={styles.qrFullscreenCode}>{plan.invite_code}</Text>
            <Text style={styles.qrFullscreenHint}>Scan to join · Tap anywhere to close</Text>
          </View>
        </Pressable>
      </Modal>
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
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  backText: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 15,
    color: colors.primary,
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
  // QR Code Card
  qrCard: {
    backgroundColor: '#ffffff',
    borderRadius: radii.lg,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 4,
  },
  qrLabel: {
    fontFamily: fonts.headlineExtra,
    fontSize: 16,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  qrContainer: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: radii.default,
  },
  qrHint: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.outline,
  },
  // Fullscreen QR
  qrOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrFullscreenCard: {
    backgroundColor: '#ffffff',
    borderRadius: radii.lg,
    padding: 40,
    alignItems: 'center',
    gap: 20,
  },
  qrFullscreenTitle: {
    fontFamily: fonts.headlineExtra,
    fontSize: 24,
    color: colors.onSurface,
  },
  qrFullscreenCode: {
    fontFamily: fonts.headlineExtra,
    fontSize: 32,
    color: colors.primary,
    letterSpacing: 4,
  },
  qrFullscreenHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.outline,
  },
  // WhatsApp Preview
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
