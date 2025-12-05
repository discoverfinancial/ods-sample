/**
 * Copyright (c) 2025 Capital One
*/

/** @jest-environment jsdom */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import AttestationPlanIcon from '../components/AttestationPlanIcon';

it('renders StopCircleIcon for created state', () => {
    render(<AttestationPlanIcon state="created" />);
    expect(screen.getByTestId('StopCircleIcon')).toBeInTheDocument();
});

it('renders StopCircleIcon for active state', () => {
    render(<AttestationPlanIcon state="active" />);
    expect(screen.getByTestId('StopCircleIcon')).toBeInTheDocument();
});

it('renders ReportIcon for rejected state', () => {
    render(<AttestationPlanIcon state="rejected" />);
    expect(screen.getByTestId('ReportIcon')).toBeInTheDocument();
});

it('renders ChangeCircleIcon for pending state', () => {
    render(<AttestationPlanIcon state="pending" />);
    expect(screen.getByTestId('ChangeCircleIcon')).toBeInTheDocument();
});

it('renders CheckCircleIcon for complete state', () => {
    render(<AttestationPlanIcon state="complete" />);
    expect(screen.getByTestId('CheckCircleIcon')).toBeInTheDocument();
});

it('renders WarningAmberRoundedIcon for overdue state', () => {
    render(<AttestationPlanIcon state="overdue" />);
    expect(screen.getByTestId('WarningAmberRoundedIcon')).toBeInTheDocument();
});

it('renders DoDisturbOnRoundedIcon for deferred state', () => {
    render(<AttestationPlanIcon state="deferred" />);
    expect(screen.getByTestId('DoDisturbOnRoundedIcon')).toBeInTheDocument();
});

it('renders CancelIcon for cancelled state', () => {
    render(<AttestationPlanIcon state="cancelled" />);
    expect(screen.getByTestId('CancelIcon')).toBeInTheDocument();
});

it('renders HelpIcon for unknown state', () => {
    render(<AttestationPlanIcon state="unknown" />);
    expect(screen.getByTestId('HelpIcon')).toBeInTheDocument();
});

it('renders HelpIcon when state is undefined', () => {
    // @ts-expect-error: testing undefined state
    render(<AttestationPlanIcon />);
    expect(screen.getByTestId('HelpIcon')).toBeInTheDocument();
});