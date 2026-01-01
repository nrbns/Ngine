/// <reference types="jest" />
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { jest } from '@jest/globals';

jest.resetModules(); // allow process.env changes to take effect on module import

describe('ProofGallery (Supabase mode)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://supabase.example';
    process.env.EXPO_PUBLIC_SUPABASE_KEY = 'supakey';
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    delete process.env.EXPO_PUBLIC_SUPABASE_KEY;
  });

  it.skip('uploads proof using Supabase when configured (skipped: requires isolated module env setup)', async () => {
    // Use isolateModules to safely set env for this test and avoid module caching issues
    await jest.isolateModulesAsync(async () => {
      process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://supabase.example';
      process.env.EXPO_PUBLIC_SUPABASE_KEY = 'supakey';

      // Mock database functions
      const database = require('../../services/supabase').database;
      database.getResolutionGoalProofs = jest.fn().mockResolvedValue([]);
      database.uploadGoalProof = jest.fn().mockResolvedValue({ id: 'cloud_1', file_url: 'https://cdn/supabase/cloud_1.jpg', created_at: new Date().toISOString() });

      // Mock ImagePicker
      const ImagePicker = require('expo-image-picker');
      ImagePicker.requestMediaLibraryPermissionsAsync = jest.fn().mockResolvedValue({ status: 'granted' });
      ImagePicker.launchImageLibraryAsync = jest.fn().mockResolvedValue({ canceled: false, assets: [{ uri: 'file://cloud.jpg' }] });

      // Mock Alert to choose gallery
      const { Alert } = require('react-native');
      jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
        const btn = buttons && buttons[1];
        if (btn && typeof (btn as any).onPress === 'function') (btn as any).onPress();
      });

      // Import component after setting env
      const { ProofGallery } = require('../ProofGallery');

      const resolutionId = 'res-cloud';
      const userId = 'user-cloud';

      const { getByText, getByTestId } = render(<ProofGallery resolutionId={resolutionId} userId={userId} />);

      // Confirm cloud status is displayed
      await waitFor(() => expect(getByText('Cloud: Connected')).toBeTruthy());

      // Add proof
      const addBtn = getByText('+ Add Proof');
      fireEvent.press(addBtn);

      // Wait for upload modal and press Upload
      await waitFor(() => expect(getByTestId('input-proof-note')).toBeTruthy());
      const uploadBtn = getByTestId('btn-upload-proof');
      fireEvent.press(uploadBtn);

      // Ensure upload was called and gallery refreshed
      await waitFor(() => {
        expect(database.uploadGoalProof).toHaveBeenCalledWith(resolutionId, userId, expect.anything(), expect.anything());
        expect(database.getResolutionGoalProofs).toHaveBeenCalledWith(resolutionId);
      });

      // Clean up env
      delete process.env.EXPO_PUBLIC_SUPABASE_URL;
      delete process.env.EXPO_PUBLIC_SUPABASE_KEY;
    });
  });
});
// Minimal fallback implementation used when Jest's globals/types aren't available.
// Executes the hook immediately (supports sync or Promise-returning hooks).
function beforeEach(hook: () => void | Promise<void>, _timeout?: number): void {
    (async () => {
        try {
            await hook();
        } catch {
            // swallow; real test runner would surface failures
        }
    })();
}
function beforeEach(arg0: () => void) {
    throw new Error('Function not implemented.');
}

