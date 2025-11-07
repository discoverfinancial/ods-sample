/**
 * Copyright (c) 2025 Capital One
*/

/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AddPerson from "../components/AddPerson";
import '@testing-library/jest-dom';

describe('AddPerson', () => {
    it('renders input and button when not disabled', () => {
        render(<AddPerson label="Name" handleAdd={jest.fn()} />);
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Add')).toBeInTheDocument();
    });

    it('does not render anything when disabled', () => {
        const { container } = render(<AddPerson label="Name" handleAdd={jest.fn()} disabled />);
        expect(container.firstChild).toBeNull();
    });

    it('calls handleAdd with input value and clears input on button click', () => {
        const handleAdd = jest.fn();
        render(<AddPerson label="Name" handleAdd={handleAdd} />);
        const input = screen.getByLabelText('Name');
        fireEvent.change(input, { target: { value: 'John Doe' } });
        fireEvent.click(screen.getByLabelText('Add'));
        expect(handleAdd).toHaveBeenCalledWith('John Doe');
        expect(input).toHaveValue('');
    });

    it('does not call handleAdd if input is empty', () => {
        const handleAdd = jest.fn();
        render(<AddPerson label="Name" handleAdd={handleAdd} />);
        fireEvent.click(screen.getByLabelText('Add'));
        expect(handleAdd).toHaveBeenCalledWith('');
    });

    it('input and button are disabled when disabled prop is true', () => {
        render(<AddPerson label="Name" handleAdd={jest.fn()} disabled />);
        expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Add')).not.toBeInTheDocument();
    });
});