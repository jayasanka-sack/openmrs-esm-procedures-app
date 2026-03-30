import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import {
  Button,
  ButtonSet,
  ComboBox,
  Form,
  FormGroup,
  InlineLoading,
  InlineNotification,
  Layer,
  Search,
  Stack,
  TextArea,
  Tile,
} from '@carbon/react';
import { Controller, useFormContext } from 'react-hook-form';
import { OpenmrsDatePicker, ResponsiveWrapper, showSnackbar, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import {
  type ConceptResult,
  type ProcedureType,
  saveProcedure,
  useConceptSearchField,
  useMutatePatientProcedures,
  useProcedureTypes,
} from './procedures.resource';
import { type ProceduresFormSchema } from './procedures-form.workspace';
import styles from './procedures-form.scss';

interface ProceduresFormComponentProps {
  closeWorkspaceWithSavedChanges: () => void;
  isSubmittingForm: boolean;
  patientUuid: string;
}

interface ConceptSearchResultsProps {
  isSearching: boolean;
  onSelect: (result: ConceptResult) => void;
  searchResults: Array<ConceptResult>;
  selectedItem: ConceptResult;
  value: string;
}

const ProceduresFormComponent: React.FC<ProceduresFormComponentProps> = ({
  closeWorkspaceWithSavedChanges,
  patientUuid,
}) => {
  const { t } = useTranslation();
  const { procedureCodedConceptClassUuid, bodySiteConceptClassUuid, statusConceptClassUuid } =
    useConfig<ConfigObject>();
  const mutate = useMutatePatientProcedures(patientUuid);

  const {
    handleSubmit,
    control,
    formState: { errors },
    getValues,
    setValue,
  } = useFormContext<ProceduresFormSchema>();

  const { procedureTypes, isLoading: isLoadingProcedureTypes } = useProcedureTypes();

  const isTablet = useLayoutType() === 'tablet';
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const procedureField = useConceptSearchField(procedureCodedConceptClassUuid);
  const bodySiteField = useConceptSearchField(bodySiteConceptClassUuid);
  const statusField = useConceptSearchField(statusConceptClassUuid);

  const [errorSaving, setErrorSaving] = useState(null);

  const handleSave = useCallback(async () => {
    const procedureType = getValues('procedureType');
    const startDateTime = getValues('startDateTime');
    const endDateTime = getValues('endDateTime');
    const notes = getValues('notes');

    const payload = {
      patient: patientUuid,
      procedureCoded: procedureField.selectedConcept!.uuid,
      procedureType: procedureType,
      bodySite: bodySiteField.selectedConcept!.uuid,
      startDateTime: startDateTime ? dayjs(startDateTime).format() : undefined,
      endDateTime: endDateTime ? dayjs(endDateTime).format() : undefined,
      status: statusField.selectedConcept?.uuid,
      notes: notes,
    };

    try {
      await saveProcedure(payload);
      await mutate();
      showSnackbar({
        kind: 'success',
        title: t('procedureSaved', 'Procedure saved'),
        subtitle: t('procedureNowVisible', 'It is now visible on the Procedures page'),
      });
      closeWorkspaceWithSavedChanges();
    } catch (error) {
      setIsSubmittingForm(false);
      setErrorSaving(error);
    }
  }, [
    bodySiteField.selectedConcept,
    closeWorkspaceWithSavedChanges,
    getValues,
    mutate,
    patientUuid,
    procedureField.selectedConcept,
    statusField.selectedConcept,
    t,
  ]);

  const onError = () => setIsSubmittingForm(false);

  return (
    <Form className={styles.form} onSubmit={handleSubmit(handleSave, onError)}>
      <div className={styles.formContainer}>
        <Stack gap={7}>
          <FormGroup legendText={<RequiredFieldLabel label={t('procedure', 'Procedure')} />}>
            <ConceptSearchField
              label={t('enterProcedure', 'Enter procedure')}
              placeholder={t('searchProcedures', 'Search procedures')}
              field={procedureField}
              onChange={(selectedConcept) => setValue('procedureCoded', selectedConcept.uuid)}
            />
            {errors.procedureCoded && <p className={styles.errorMessage}>{errors.procedureCoded.message}</p>}
          </FormGroup>

          <FormGroup legendText={<RequiredFieldLabel label={t('procedureType', 'Procedure type')} />}>
            {isLoadingProcedureTypes ? (
              <InlineLoading className={styles.loader} description={t('loading', 'Loading') + '...'} />
            ) : (
              <ResponsiveWrapper>
                <ComboBox
                  id="procedureType"
                  titleText=""
                  placeholder={t('selectProcedureType', 'Select procedure type')}
                  items={procedureTypes}
                  itemToString={(item: ProcedureType) => item?.name ?? ''}
                  onChange={({ selectedItem }: { selectedItem: ProcedureType }) =>
                    setValue('procedureType', selectedItem.uuid)
                  }
                  selectedItem={selectedProcedureType}
                />
              </ResponsiveWrapper>
            )}
            {errors.procedureType && <p className={styles.errorMessage}>{errors.procedureType.message}</p>}
          </FormGroup>

          <FormGroup legendText={<RequiredFieldLabel label={t('bodySite', 'Body site')} />}>
            <ConceptSearchField
              label={t('enterBodySite', 'Enter body site')}
              placeholder={t('searchBodySites', 'Search body sites')}
              field={bodySiteField}
              onChange={(selectedConcept) => setValue('bodySite', selectedConcept.uuid)}
            />
            {errors.bodySite && <p className={styles.errorMessage}>{errors.bodySite.message}</p>}
          </FormGroup>

          <FormGroup legendText={t('startDate', 'Start date')}>
            <Controller
              name="startDateTime"
              control={control}
              render={({ field, fieldState }) => (
                <ResponsiveWrapper>
                  <OpenmrsDatePicker
                    {...field}
                    id="startDateTime"
                    invalid={Boolean(fieldState?.error?.message)}
                    invalidText={fieldState?.error?.message}
                  />
                </ResponsiveWrapper>
              )}
            />
            {errors.startDateTime && <p className={styles.errorMessage}>{errors.startDateTime.message}</p>}
          </FormGroup>

          <FormGroup legendText={t('endDate', 'End date')}>
            <Controller
              name="endDateTime"
              control={control}
              render={({ field, fieldState }) => (
                <ResponsiveWrapper>
                  <OpenmrsDatePicker
                    {...field}
                    id="endDateTime"
                    invalid={Boolean(fieldState?.error?.message)}
                    invalidText={fieldState?.error?.message}
                  />
                </ResponsiveWrapper>
              )}
            />
            {errors.endDateTime && <p className={styles.errorMessage}>{errors.endDateTime.message}</p>}
          </FormGroup>

          <FormGroup legendText={<RequiredFieldLabel label={t('status', 'Status')} />}>
            <ConceptSearchField
              label={t('enterStatus', 'Enter status')}
              placeholder={t('searchStatus', 'Search status')}
              field={statusField}
              onChange={(selectedConcept) => setValue('status', selectedConcept.uuid)}
            />
            {errors.status && <p className={styles.errorMessage}>{errors.status.message}</p>}
          </FormGroup>

          <FormGroup legendText={t('notes', 'Notes')}>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <ResponsiveWrapper>
                  <TextArea
                    {...field}
                    id="notes"
                    labelText=""
                    placeholder={t('enterNotes', 'Enter notes (optional)')}
                  />
                </ResponsiveWrapper>
              )}
            />
            {errors.notes && <p className={styles.errorMessage}>{errors.notes.message}</p>}
          </FormGroup>
        </Stack>
      </div>
      <div>
        {errorSaving ? (
          <div className={styles.errorContainer}>
            <InlineNotification
              role="alert"
              kind="error"
              lowContrast
              title={t('errorSavingProcedure', 'Error saving procedure')}
              subtitle={errorSaving?.message}
            />
          </div>
        ) : null}
        <ButtonSet className={classNames({ [styles.tablet]: isTablet, [styles.desktop]: !isTablet })}>
          <Button className={styles.button} kind="secondary" onClick={() => closeWorkspaceWithSavedChanges()}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button className={styles.button} disabled={isSubmittingForm} kind="primary" type="submit">
            {isSubmittingForm ? (
              <InlineLoading className={styles.spinner} description={t('saving', 'Saving') + '...'} />
            ) : (
              <span>{t('saveAndClose', 'Save & close')}</span>
            )}
          </Button>
        </ButtonSet>
      </div>
    </Form>
  );
};

function RequiredFieldLabel({ label }: { label: string }) {
  const { t } = useTranslation();
  return (
    <span>
      {label}
      <span title={t('required', 'Required')} className={styles.required}>
        *
      </span>
    </span>
  );
}

function ConceptSearchField({
  label,
  placeholder,
  field,
  onChange,
}: {
  label: string;
  placeholder: string;
  field: ReturnType<typeof useConceptSearchField>;
  onChange: (selectedConcept: ConceptResult) => void;
}) {
  return (
    <>
      <ResponsiveWrapper>
        <Search
          labelText={label}
          placeholder={placeholder}
          onChange={(e) => field.setSearchTerm(e.target.value)}
          onClear={field.clear}
          value={field.selectedConcept ? field.selectedConcept.display : field.searchTerm}
        />
      </ResponsiveWrapper>

      <ConceptSearchResults
        isSearching={field.isSearching}
        searchResults={field.searchResults}
        selectedItem={field.selectedConcept}
        value={field.searchTerm}
        onSelect={(result) => {
          field.setSelectedConcept(result);
          field.setSearchTerm('');
          onChange(result);
        }}
      />
    </>
  );
}

function ConceptSearchResults({
  isSearching,
  onSelect,
  searchResults,
  selectedItem,
  value,
}: ConceptSearchResultsProps) {
  const { t } = useTranslation();

  if (!value || selectedItem) {
    return null;
  }

  if (isSearching) {
    return <InlineLoading className={styles.loader} description={t('searching', 'Searching') + '...'} />;
  }

  if (searchResults?.length > 0) {
    return (
      <ul className={styles.resultsList}>
        {searchResults.map((result) => (
          <li className={styles.resultItem} key={result.uuid} onClick={() => onSelect(result)} role="menuitem">
            {result.display}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Layer>
      <Tile className={styles.emptyResults}>
        <span>
          {t('noResultsFor', 'No results for')} <strong>"{value}"</strong>
        </span>
      </Tile>
    </Layer>
  );
}

export default ProceduresFormComponent;
