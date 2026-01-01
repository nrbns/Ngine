import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { ProofGallery } from '../ProofGallery';

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
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({ canceled: false, assets: [{ uri: 'file://note.jpg' }] });

    // Mock Alert to automatically choose the "Choose from Gallery" option
    jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
      // Call the second button (Choose from Gallery) if available
      const btn = buttons && buttons[1];
      if (btn && typeof (btn as any).onPress === 'function') (btn as any).onPress();
    });

    const { getByText, getByTestId, queryByTestId } = render(<ProofGallery resolutionId={resolutionId} userId={userId} />);

    // Start add flow
    const addBtn = await waitFor(() => getByText('+ Add Proof'));
    fireEvent.press(addBtn);

    // Wait for note modal input to appear
    await waitFor(() => expect(getByTestId('input-proof-note')).toBeTruthy());

    const noteInput = getByTestId('input-proof-note');
    fireEvent.changeText(noteInput, 'This is my proof note');

    const uploadBtn = getByTestId('btn-upload-proof');
    fireEvent.press(uploadBtn);

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