import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLayoutType, Workspace2 } from '@openmrs/esm-framework';
import { type PatientWorkspace2DefinitionProps } from '@openmrs/esm-patient-common-lib';
import ProceduresFormComponent from './procedures-form.component';

const schema = z
  .object({
    procedureCoded: z.string().min(1, 'A procedure is required'),
    procedureType: z.string().min(1, 'Procedure type is required'),
    bodySite: z.string().min(1, 'Body site is required'),
    startDateTime: z.date().optional().nullable(),
    endDateTime: z.date().optional().nullable(),
    status: z.string().min(1, 'Status is required'),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.startDateTime && data.endDateTime) {
        return data.endDateTime >= data.startDateTime;
      }
      return true;
    },
    { message: 'End date must be on or after start date', path: ['endDateTime'] },
  );

export type ProceduresFormSchema = z.infer<typeof schema>;

const ProceduresForm: React.FC<PatientWorkspace2DefinitionProps<object, object>> = ({
  closeWorkspace,
  groupProps: { patientUuid },
}) => {
  const { t } = useTranslation();
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const methods = useForm<ProceduresFormSchema>({
    mode: 'all',
    resolver: zodResolver(schema),
    defaultValues: {
      procedureCoded: '',
      procedureType: '',
      bodySite: '',
      startDateTime: null,
      endDateTime: null,
      status: '',
      notes: '',
    },
  });

  const closeWorkspaceWithSavedChanges = useCallback(() => {
    closeWorkspace({ discardUnsavedChanges: true });
  }, [closeWorkspace]);

  return (
    <Workspace2 title={t('recordProcedure', 'Record procedure')} hasUnsavedChanges={methods.formState.isDirty}>
      <FormProvider {...methods}>
        <ProceduresFormComponent
          closeWorkspaceWithSavedChanges={closeWorkspaceWithSavedChanges}
          isSubmittingForm={isSubmittingForm}
          patientUuid={patientUuid}
        />
      </FormProvider>
    </Workspace2>
  );
};

export default ProceduresForm;
