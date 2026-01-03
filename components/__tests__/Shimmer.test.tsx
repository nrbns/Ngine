import React from 'react';
import { render } from '@testing-library/react-native';
import Shimmer from '../Shimmer';

describe('Shimmer', () => {
  it('renders the shimmer placeholder', () => {
    const { getByTestId } = render(<Shimmer width={120} height={80} testID="my-shimmer" />);
    const node = getByTestId('my-shimmer');
    expect(node).toBeTruthy();
  });
});
