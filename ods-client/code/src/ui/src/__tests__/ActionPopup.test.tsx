/**
 * Copyright (c) 2025 Capital One
*/

/** @jest-environment jsdom */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActionPopup } from '../components/ActionPopup';

describe('ActionPopup', () => {
    it('renders the MoreVert icon button', () => {
        render(<ActionPopup />);
        expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
        expect(screen.getByTestId('MoreVertIcon')).toBeInTheDocument();
    });

    it('opens the menu when the icon button is clicked', () => {
        render(
            <ActionPopup>
                <div>Menu Item</div>
            </ActionPopup>
        );
        fireEvent.click(screen.getByRole('button', { name: /action/i }));
        expect(screen.getByRole('menu')).toBeVisible();
        expect(screen.getByText('Menu Item')).toBeInTheDocument();
    });

    it('closes the menu when a menu item is clicked', () => {
        render(
            <ActionPopup>
                <div>Menu Item</div>
            </ActionPopup>
        );
        fireEvent.click(screen.getByRole('button', { name: /action/i }));
        fireEvent.click(screen.getByText('Menu Item'));
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('closes the menu when clicking outside or onClose is triggered', () => {
        render(
            <ActionPopup>
                <div>Menu Item</div>
            </ActionPopup>
        );
        fireEvent.click(screen.getByRole('button', {name: /action/i}));
        fireEvent.mouseDown(document.querySelector('.MuiBackdrop-root')!);
        fireEvent.click(document.querySelector('.MuiBackdrop-root')!);
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    });

    it('renders children inside the menu', () => {
        render(
            <ActionPopup>
                <div>Child 1</div>
                <div>Child 2</div>
            </ActionPopup>
        );
        fireEvent.click(screen.getByRole('button', { name: /action/i }));
        expect(screen.getByText('Child 1')).toBeInTheDocument();
        expect(screen.getByText('Child 2')).toBeInTheDocument();
    });

    it('does not throw if no children are provided', () => {
        expect(() => render(<ActionPopup />)).not.toThrow();
    });
});