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
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({ canceled: false, assets: [{ uri: 'file://mock.jpg' }] });

    // Mock Alert to automatically choose the "Choose from Gallery" option
    jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
      const chooseBtn = buttons?.find(b => (b as any).text === 'Choose from Gallery');
      // call the onPress handler
      (chooseBtn as any).onPress();
    });

    const { getByText, getByTestId, queryAllByTestId } = render(<ProofGallery resolutionId={resolutionId} userId={userId} />);

    expect(getByText('No proofs yet')).toBeTruthy();

    const addBtn = getByText('+ Add Proof');
    fireEvent.press(addBtn);

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