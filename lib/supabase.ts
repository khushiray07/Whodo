import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';

let storageAdapter: any = undefined;

if (Platform.OS !== 'web') {
  // SecureStore is native-only; on web we use the default localStorage adapter
  const SecureStore = require('expo-secure-store');
  storageAdapter = {
    getItem: (key: string) => SecureStore.getItemAsync(key),
    setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
    removeItem: (key: string) => SecureStore.deleteItemAsync(key),
  };
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://adbdlaxmgkxlwivwydbr.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkYmRsYXhtZ2t4bHdpdnd5ZGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0Nzg0NjIsImV4cCI6MjA5MTA1NDQ2Mn0.-S9sb7QRntnc8cneEeVrY70e0cRbDsdEAvWlNxA3eGw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    ...(storageAdapter ? { storage: storageAdapter } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
