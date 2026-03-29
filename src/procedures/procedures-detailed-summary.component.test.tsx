import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type FetchResponse, launchWorkspace2, openmrsFetch } from '@openmrs/esm-framework';
import { mockPatient, renderWithSwr, waitForLoadingToFinish } from 'tools';
import ProceduresDetailedSummary from './procedures-detailed-summary.component';
import {mockProceduresResponse} from "../../__mocks__/procedures.mock";

const mockOpenmrsFetch = jest.mocked(openmrsFetch);
const mockLaunchWorkspace2 = jest.mocked(launchWorkspace2);

describe('ProceduresDetailedSummary', () => {
  it('renders an empty state view if procedures data is unavailable', async () => {
    mockOpenmrsFetch.mockResolvedValueOnce({ data: { results: [] } } as FetchResponse);

    renderWithSwr(<ProceduresDetailedSummary patient={mockPatient} />);

    await waitForLoadingToFinish();

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /procedures/i })).toBeInTheDocument();
    expect(screen.getByTestId('empty-card-illustration')).toBeInTheDocument();
    expect(screen.getByText(/There are no procedures to display/i)).toBeInTheDocument();
  });

  it('renders an error state view if there is a problem fetching procedures', async () => {
    const error = {
      message: 'You are not logged in',
      response: {
        status: 401,
        statusText: 'Unauthorized',
      },
    };

    mockOpenmrsFetch.mockRejectedValueOnce(error);

    renderWithSwr(<ProceduresDetailedSummary patient={mockPatient} />);

    await waitForLoadingToFinish();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText('Error State')).toBeInTheDocument();
  });

  it("renders a detailed summary of all the patient's procedures without pagination", async () => {
    mockOpenmrsFetch.mockResolvedValueOnce({ data: mockProceduresResponse } as FetchResponse);

    renderWithSwr(<ProceduresDetailedSummary patient={mockPatient} />);

    await waitForLoadingToFinish();

    expect(screen.getByRole('heading', { name: /procedures/i })).toBeInTheDocument();

    const expectedColumnHeaders = [/^procedure$/i, /^date$/i];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: header })).toBeInTheDocument();
    });

    // All 6 non-voided procedures should be displayed
    const expectedTableRows = [/appendectomy/i, /colonoscopy/i, /blood draw/i, /chest x-ray/i, /ecg/i, /mri brain/i];
    expectedTableRows.forEach((row) => {
      expect(screen.getByRole('row', { name: row })).toBeInTheDocument();
    });

    // Header row + 6 data rows = 7; no pagination controls
    expect(screen.getAllByRole('row').length).toEqual(7);
    expect(screen.queryByRole('button', { name: /next page/i })).not.toBeInTheDocument();

    // Voided procedure should not appear
    expect(screen.queryByText(/Should Not Appear/i)).not.toBeInTheDocument();
  });

  it('renders an "Add" button that launches the procedures form workspace', async () => {
    const user = userEvent.setup();

    mockOpenmrsFetch.mockResolvedValueOnce({ data: mockProceduresResponse } as FetchResponse);

    renderWithSwr(<ProceduresDetailedSummary patient={mockPatient} />);

    await waitForLoadingToFinish();

    const addButton = screen.getByRole('button', { name: /add/i });
    expect(addButton).toBeInTheDocument();

    await user.click(addButton);
    expect(mockLaunchWorkspace2).toHaveBeenCalledWith('procedures-form-workspace');
  });
});
