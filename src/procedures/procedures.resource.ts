import useSWR, { useSWRConfig } from 'swr';
import { openmrsFetch, restBaseUrl, useDebounce } from '@openmrs/esm-framework';
import { useState } from 'react';

interface RawProcedure {
  uuid: string;
  procedureCoded?: { display: string };
  procedureNonCoded?: string;
  procedureType?: { name: string };
  startDateTime: string;
  status?: { display: string };
  voided: boolean;
}

export interface Procedure {
  uuid: string;
  display: string;
  procedureType: string;
  startDateTime: string;
  status: string;
}

interface ProcedureApiResponse {
  results: Array<RawProcedure>;
  links: Array<{ rel: string; uri: string }>;
}

export interface ProcedureType {
  uuid: string;
  name: string;
  description?: string;
}

export interface ConceptResult {
  uuid: string;
  display: string;
}

export interface ProcedurePayload {
  patient: string;
  procedureCoded?: string;
  procedureType?: string;
  bodySite?: string;
  startDateTime?: string;
  endDateTime?: string;
  status?: string;
  notes?: string;
}

interface ProcedureTypeApiResponse {
  results: Array<ProcedureType>;
}

export function useProcedureTypes() {
  const url = `${restBaseUrl}/proceduretype?v=full`;
  const { data, error, isLoading } = useSWR<{ data: ProcedureTypeApiResponse }, Error>(url, openmrsFetch);
  return { procedureTypes: data?.data?.results ?? [], isLoading };
}

export function useConceptSearch(query: string, conceptClassUuid: string) {
  const classParam = conceptClassUuid ? `&class=${conceptClassUuid}` : '';
  const url = `${restBaseUrl}/concept?name=${query}&searchType=fuzzy${classParam}&v=custom:(uuid,display)`;
  const { data, error, isLoading } = useSWR<{ data: { results: Array<ConceptResult> } }, Error>(
    query ? url : null,
    openmrsFetch,
  );
  return { searchResults: data?.data?.results ?? [], isSearching: isLoading };
}

export async function saveProcedure(payload: ProcedurePayload) {
  const url = `${restBaseUrl}/procedure`;
  return openmrsFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
  });
}

export function useMutatePatientProcedures(patientUuid: string) {
  const { mutate } = useSWRConfig();
  return () => mutate(`${restBaseUrl}/procedure?patient=${patientUuid}&v=full&limit=100`);
}

export function useProcedures(patientUuid: string) {
  const url = `${restBaseUrl}/procedure?patient=${patientUuid}&v=full&limit=100`;
  const { data, error, isLoading, isValidating } = useSWR<{ data: ProcedureApiResponse }, Error>(
    patientUuid ? url : null,
    openmrsFetch,
  );

  const procedures = data?.data?.results
    ?.filter((p) => !p.voided)
    .map((p) => ({
      uuid: p.uuid,
      display: p.procedureCoded?.display ?? p.procedureNonCoded ?? '--',
      procedureType: p.procedureType?.name,
      startDateTime: p.startDateTime,
      status: p.status?.display,
    }));

  return { procedures: data ? procedures ?? [] : null, error, isLoading, isValidating };
}

export function useConceptSearchField(conceptClassUuid: string) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConcept, setSelectedConcept] = useState<ConceptResult | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm);

  const { searchResults, isSearching } = useConceptSearch(debouncedSearchTerm, conceptClassUuid);

  const clear = () => {
    setSearchTerm('');
    setSelectedConcept(null);
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedConcept,
    setSelectedConcept,
    searchResults,
    isSearching,
    clear,
  };
}
