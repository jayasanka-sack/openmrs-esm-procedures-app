import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, useWatch } from 'react-hook-form';
import { DateTimeField } from './date-time-field.component';
import { type ProceduresFormSchema } from './procedures-form.workspace';

interface HarnessProps {
  defaultValue?: Date | null;
  fieldName?: 'startDateTime' | 'endDateTime';
  idPrefix?: string;
}

function Harness({ defaultValue = null, fieldName = 'startDateTime', idPrefix = 'start' }: HarnessProps) {
  const { control } = useForm<ProceduresFormSchema>({
    defaultValues: { [fieldName]: defaultValue } as Partial<ProceduresFormSchema>,
  });
  const value = useWatch({ control, name: fieldName });
  return (
    <div>
      <DateTimeField name={fieldName} idPrefix={idPrefix} control={control} />
      <output data-testid="iso">{value ? (value as Date).toISOString() : ''}</output>
      <output data-testid="hours">{value ? String((value as Date).getHours()) : ''}</output>
      <output data-testid="minutes">{value ? String((value as Date).getMinutes()) : ''}</output>
    </div>
  );
}

function pickDate(date = '2026-04-27') {
  fireEvent.change(screen.getByLabelText(/^date$/i), { target: { value: date } });
}

describe('DateTimeField', () => {
  it('renders date, time, and AM/PM controls', () => {
    render(<Harness />);

    expect(screen.getByLabelText(/^date$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^time$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/am\/pm/i)).toBeInTheDocument();
  });

  it('disables the time and meridiem inputs until a date is picked', () => {
    render(<Harness />);

    expect(screen.getByLabelText(/^time$/i)).toBeDisabled();
    expect(screen.getByLabelText(/am\/pm/i)).toBeDisabled();

    pickDate();

    expect(screen.getByLabelText(/^time$/i)).toBeEnabled();
    expect(screen.getByLabelText(/am\/pm/i)).toBeEnabled();
  });

  it('combines a 12-hour time with the AM meridiem into a morning datetime', () => {
    render(<Harness />);

    pickDate();
    fireEvent.change(screen.getByLabelText(/^time$/i), { target: { value: '09:15' } });

    expect(screen.getByTestId('hours')).toHaveTextContent('9');
    expect(screen.getByTestId('minutes')).toHaveTextContent('15');
  });

  it('flips the underlying hour by 12 when the meridiem changes from AM to PM', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    pickDate();
    fireEvent.change(screen.getByLabelText(/^time$/i), { target: { value: '02:30' } });
    expect(screen.getByTestId('hours')).toHaveTextContent('2');

    await user.selectOptions(screen.getByLabelText(/am\/pm/i), 'PM');

    expect(screen.getByTestId('hours')).toHaveTextContent('14');
    expect(screen.getByTestId('minutes')).toHaveTextContent('30');
  });

  it('treats 12:00 AM as midnight and 12:00 PM as noon', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    pickDate();
    fireEvent.change(screen.getByLabelText(/^time$/i), { target: { value: '12:00' } });
    expect(screen.getByTestId('hours')).toHaveTextContent('0');

    await user.selectOptions(screen.getByLabelText(/am\/pm/i), 'PM');
    expect(screen.getByTestId('hours')).toHaveTextContent('12');
  });

  it('ignores time input that does not match the 12-hour pattern', () => {
    render(<Harness />);

    pickDate();
    fireEvent.change(screen.getByLabelText(/^time$/i), { target: { value: '09:15' } });
    fireEvent.change(screen.getByLabelText(/^time$/i), { target: { value: '25:99' } });

    expect(screen.getByTestId('hours')).toHaveTextContent('9');
    expect(screen.getByTestId('minutes')).toHaveTextContent('15');
  });

  it('reflects the meridiem of the initial value (PM)', () => {
    render(<Harness defaultValue={new Date(2026, 3, 27, 14, 30)} />);

    expect(screen.getByLabelText(/am\/pm/i)).toHaveValue('PM');
    const timeInput = screen.getByLabelText(/^time$/i) as HTMLInputElement;
    expect(timeInput.value).toBe('02:30');
  });

  it('reflects the meridiem of the initial value (AM at midnight)', () => {
    render(<Harness defaultValue={new Date(2026, 3, 27, 0, 0)} />);

    expect(screen.getByLabelText(/am\/pm/i)).toHaveValue('AM');
    const timeInput = screen.getByLabelText(/^time$/i) as HTMLInputElement;
    expect(timeInput.value).toBe('12:00');
  });

  it('uses the idPrefix prop for the rendered control ids', () => {
    render(<Harness fieldName="endDateTime" idPrefix="end" />);

    expect(screen.getByLabelText(/^date$/i)).toHaveAttribute('id', 'end-date');
    expect(screen.getByLabelText(/^time$/i)).toHaveAttribute('id', 'end-time');
    expect(screen.getByLabelText(/am\/pm/i)).toHaveAttribute('id', 'end-meridiem');
  });

  it('keeps the date when only the time changes', () => {
    render(<Harness />);

    pickDate('2026-04-27');
    fireEvent.change(screen.getByLabelText(/^time$/i), { target: { value: '09:15' } });

    expect(screen.getByTestId('iso')).toHaveTextContent(/^2026-04-27T/);
  });

  it('does not change the value when re-selecting the same meridiem', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    pickDate();
    fireEvent.change(screen.getByLabelText(/^time$/i), { target: { value: '09:15' } });
    const before = screen.getByTestId('iso').textContent ?? '';

    await user.selectOptions(screen.getByLabelText(/am\/pm/i), 'AM');

    expect(screen.getByTestId('iso')).toHaveTextContent(before);
  });

  it('initialises with no value when defaultValue is null', () => {
    render(<Harness defaultValue={null} />);

    expect(screen.getByTestId('iso')).toBeEmptyDOMElement();
    expect(screen.getByLabelText(/am\/pm/i)).toHaveValue('AM');
  });
});
