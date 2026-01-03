import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { ProofGallery } from '../ProofGallery';

jest.mock('../../services/supabase', () => ({
  database: {
    getResolutionGoalProofs: jest.fn(() => Promise.resolve([])),
    uploadGoalProof: jest.fn(),
    deleteGoalProof: jest.fn(),
    hasShownAdToday: jest.fn(() => Promise.resolve(false)),
    markAdShownToday: jest.fn(() => Promise.resolve()),
  },
  subscribeToGoalProofs: jest.fn(() => null),
}));

jest.mock('../../services/ads', () => ({
  showRewardedAd: jest.fn(() => Promise.resolve(true)),
  DashboardAd: () => null,
}));

// Mock ImagePicker
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({ canceled: false, assets: [{ uri: 'file://mock.jpg' }] })),
  requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  launchCameraAsync: jest.fn(() => Promise.resolve({ canceled: false, assets: [{ uri: 'file://mock.jpg' }] })),
}));

describe('ProofGallery upload retry flow', () => {
  it('prompts for ad and retries upload when upload is locked', async () => {
    // Ensure component runs in Supabase mode for this test
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.EXPO_PUBLIC_SUPABASE_KEY = 'anon-test-key';

    // Mock global fetch to return an object with blob method
    (global as any).fetch = jest.fn(() => Promise.resolve({ blob: () => Promise.resolve({}) }));

    // Arrange: db.uploadGoalProof rejects first with lock error, then succeeds
    const db = require('../../services/supabase').database;
    db.uploadGoalProof.mockImplementationOnce(() => Promise.reject(new Error('Proof upload locked: watch a rewarded ad to unlock uploads for today.')))
      .mockImplementationOnce(() => Promise.resolve({ id: 'proof-1', file_url: 'file://mock.jpg', file_type: 'image', created_at: new Date().toISOString() }));

    // Mock Alert: choose gallery for the Add Proof dialog, and choose Watch Ad for Unlock dialog
    jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
      if (String(title).includes('Add Proof')) {
        const btn = buttons && buttons[1]; // Choose from Gallery
        const b = btn as { onPress?: () => void };
        if (b && typeof b.onPress === 'function') b.onPress();
        return;
      }

      // For unlock upload dialog, choose Watch Ad
      const btn = buttons && buttons[0];
      const b = btn as { onPress?: () => void };
      if (b && typeof b.onPress === 'function') b.onPress();
    });

    const { getByText, getByTestId } = render(<ProofGallery resolutionId="r1" userId="u1" db={db} />);

    await waitFor(() => expect(getByText('No proofs yet')).toBeTruthy());

    // Press add -> triggers ImagePicker permission & selection -> opens note modal
    const addBtn = getByText('+ Add Proof');
    await fireEvent.press(addBtn);

    // Wait for modal input to appear and press upload
    await waitFor(() => expect(getByTestId('input-proof-note')).toBeTruthy());
    const uploadBtn = getByTestId('btn-upload-proof');

    await fireEvent.press(uploadBtn);

    // Expect upload tried, ad shown and marked, and upload retried
    await waitFor(() => expect(db.uploadGoalProof).toHaveBeenCalledTimes(2));
    expect(db.markAdShownToday).toHaveBeenCalledWith('u1');
  });
});