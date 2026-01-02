/// <reference types="jest" />
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { PermissionStatus } from 'expo-modules-core';
import { Alert } from 'react-native';
import { ProofGallery } from '../ProofGallery';

jest.mock('expo-image-picker');

describe('ProofGallery (mock mode)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('shows empty state and adds a proof via gallery', async () => {
    const resolutionId = 'test-res';
    const userId = 'user-1';

    // Mock ImagePicker to return an asset
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.MockedFunction<typeof ImagePicker.requestMediaLibraryPermissionsAsync>).mockResolvedValue({
      status: PermissionStatus.GRANTED,
      granted: true,
      expires: 'never',
      canAskAgain: true,
    });
    (ImagePicker.launchImageLibraryAsync as jest.MockedFunction<typeof ImagePicker.launchImageLibraryAsync>).mockResolvedValue({ canceled: false, assets: [{ uri: 'file://mock.jpg', width: 100, height: 100 }] });

    // Mock Alert to automatically choose the "Choose from Gallery" option
    /* eslint-disable @typescript-eslint/no-explicit-any */
    jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
      const btn = buttons && buttons[1];
      if (btn && typeof (btn as any).onPress === 'function') (btn as any).onPress();
    });
    /* eslint-enable @typescript-eslint/no-explicit-any */

    const { getByText, getByTestId, queryAllByTestId } = render(<ProofGallery resolutionId={resolutionId} userId={userId} />);

    await waitFor(() => expect(getByText('No proofs yet')).toBeTruthy());

    const addBtn = await waitFor(() => getByText('+ Add Proof'));

    fireEvent.press(addBtn);

    // Wait for note modal and press Upload (no note)
    await waitFor(() => expect(getByTestId('input-proof-note')).toBeTruthy());
    const uploadBtn = getByTestId('btn-upload-proof');
    await act(async () => { fireEvent.press(uploadBtn); });

    // wait for upload to finish and AsyncStorage to be updated
    await waitFor(async () => {
      const keys = await AsyncStorage.getItem(`mock_proofs_${resolutionId}`);
      expect(keys).toBeTruthy();
      const items = JSON.parse(keys || '[]');
      expect(items.length).toBe(1);
    });

    // the proof card should be rendered
    const proofs = queryAllByTestId(/^proof-/);
    expect(proofs.length).toBe(1);
  });
});