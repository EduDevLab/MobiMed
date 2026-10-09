/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import { AppButton, Chip } from '../src/app/ui/components';

describe('Componentes de UI compartidos', () => {
  it('AppButton renderiza su etiqueta', async () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <AppButton label="Guardar" onPress={() => {}} />,
      );
    });
    const texts = tree.root.findAllByType(Text);
    expect(texts.some(node => node.props.children === 'Guardar')).toBe(true);
  });

  it('Chip refleja su estado seleccionado', async () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <Chip label="Lun" selected onPress={() => {}} />,
      );
    });
    const instance = tree.root.findByType(Chip);
    expect(instance.props.selected).toBe(true);
  });
});