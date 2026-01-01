import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
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
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({ canceled: false, assets: [{ uri: 'file://mock.jpg' }] });

    // Mock Alert to automatically choose the "Choose from Gallery" option
    jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
      const btn = buttons && buttons[1];
      if (btn && typeof (btn as any).onPress === 'function') (btn as any).onPress();
    });

    const { getByText, getByTestId, queryAllByTestId } = render(<ProofGallery resolutionId={resolutionId} userId={userId} />);

    await waitFor(() => expect(getByText('No proofs yet')).toBeTruthy());

    const addBtn = await waitFor(() => getByText('+ Add Proof'));

    fireEvent.press(addBtn);

    // Wait for note modal and press Upload (no note)
    await waitFor(() => expect(getByTestId('input-proof-note')).toBeTruthy());
    const uploadBtn = getByTestId('btn-upload-proof');
    fireEvent.press(uploadBtn);

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