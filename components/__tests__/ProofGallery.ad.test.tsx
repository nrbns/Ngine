import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import { ProofGallery } from '../ProofGallery';

// Mock ImagePicker to return granted permissions and a mock asset
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({ canceled: false, assets: [{ uri: 'file://mock.jpg', width: 100, height: 100 }] })),
  requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  launchCameraAsync: jest.fn(() => Promise.resolve({ canceled: false, assets: [{ uri: 'file://mock.jpg', width: 100, height: 100 }] })),
}));

// Mock the ads module used by the component
jest.mock('../../services/ads', () => ({
  showRewardedAd: jest.fn(() => Promise.resolve(true)),
  DashboardAd: () => null,
}));

import { Alert } from 'react-native';

describe('ProofGallery ad gating', () => {
  it('prompts to watch ad when first upload of day', async () => {
    // Ensure Supabase-mode detection is enabled for this test
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.EXPO_PUBLIC_SUPABASE_KEY = 'anon-test-key';

    const db = {
      getResolutionGoalProofs: jest.fn(() => Promise.resolve([])),
      uploadGoalProof: jest.fn(() => Promise.resolve()),
      deleteGoalProof: jest.fn(() => Promise.resolve()),
      hasShownAdToday: jest.fn(() => Promise.resolve(false)),
      markAdShownToday: jest.fn(() => Promise.resolve()),
    } as unknown as Record<string, unknown>;

    // Mock Alert to automatically pick "Watch Ad"
    jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
      const btn = buttons && buttons[0];
      const b = btn as { onPress?: () => void };
      if (b && typeof b.onPress === 'function') b.onPress();
    });

    // Prevent realtime subscribe from attempting to call the live Supabase client during tests
    const supabaseModule = require('../../services/supabase');
    if (supabaseModule && supabaseModule.subscribeToGoalProofs) {
      jest.spyOn(supabaseModule, 'subscribeToGoalProofs').mockImplementation(() => null);
    }

    const { getByText } = render(<ProofGallery resolutionId="r1" userId="u1" db={db as any} />);

    // Wait for empty state
    await waitFor(() => expect(getByText('No proofs yet')).toBeTruthy());

    const addBtn = getByText('+ Add Proof');

    // Press add - Alert will auto-select 'Watch Ad'
    await fireEvent.press(addBtn);

    // Ensure ad gating functions were invoked
    await waitFor(() => expect(db.hasShownAdToday).toHaveBeenCalledWith('u1'));
    await waitFor(() => expect(db.markAdShownToday).toHaveBeenCalledWith('u1'));

  });
});
