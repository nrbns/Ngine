/// <reference types="jest" />

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { ProofGallery } from '../ProofGallery';
import { jest, it, beforeEach, describe, expect } from '@jest/globals';

jest.mock('expo-image-picker');

describe('ProofGallery note flow (mock mode)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('allows adding a proof with a note', async () => {
    const resolutionId = 'test-note-res';
    const userId = 'user-1';

    // Mock ImagePicker to return an asset
        (ImagePicker.requestMediaLibraryPermissionsAsync as jest.MockedFunction<typeof ImagePicker.requestMediaLibraryPermissionsAsync>).mockResolvedValue({
          status: ImagePicker.PermissionStatus.GRANTED,
          granted: true,
          expires: 'never',
          canAskAgain: true,
        });
        (ImagePicker.launchImageLibraryAsync as jest.MockedFunction<typeof ImagePicker.launchImageLibraryAsync>).mockResolvedValue({ canceled: false, assets: [{ uri: 'file://note.jpg', width: 100, height: 100 }] });

    // Mock Alert to automatically choose the "Choose from Gallery" option
    interface TestAlertButton {
      text?: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }

    jest.spyOn(Alert, 'alert').mockImplementation((title: string, message?: string, buttons?: TestAlertButton[]) => {
      // Call the second button (Choose from Gallery) if available
      const btn: TestAlertButton | undefined = buttons && buttons[1];
      if (btn && typeof btn.onPress === 'function') btn.onPress?.();
    });
    /* eslint-enable @typescript-eslint/no-explicit-any */
    /* eslint-enable @typescript-eslint/no-explicit-any */

    const { getByText, getByTestId, queryByTestId } = render(<ProofGallery resolutionId={resolutionId} userId={userId} />);

    // Start add flow
    const addBtn = await waitFor(() => getByText('+ Add Proof'));
    await act(async () => { fireEvent.press(addBtn); });

    // Wait for note modal input to appear
    await waitFor(() => expect(getByTestId('input-proof-note')).toBeTruthy());

    const noteInput = getByTestId('input-proof-note');
    fireEvent.changeText(noteInput, 'This is my proof note');

    const uploadBtn = getByTestId('btn-upload-proof');
    await act(async () => { fireEvent.press(uploadBtn); });

    // Wait for AsyncStorage to have the mock proof
    await waitFor(async () => {
      const raw = await AsyncStorage.getItem(`mock_proofs_${resolutionId}`);
      const items = raw ? JSON.parse(raw) : [];
      expect(items.length).toBe(1);
      expect(items[0].note).toBe('This is my proof note');
    });

    // The proof card should be rendered
    await waitFor(() => expect(queryByTestId(/^proof-/)).toBeTruthy());
  });
});

