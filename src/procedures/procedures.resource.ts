import useSWR, { useSWRConfig } from 'swr';
import { openmrsFetch, restBaseUrl, useDebounce } from '@openmrs/esm-framework';
import { useState } from 'react';
import {
  type ConceptReference,
  type ProcedureApiResponse,
  type ProcedureTypeApiResponse,
  type RawProcedure,
} from '../types';

export function useProcedureTypes() {
  const url = `${restBaseUrl}/proceduretype?v=full`;
  const { data, error, isLoading } = useSWR<{ data: ProcedureTypeApiResponse }, Error>(url, openmrsFetch);
  return { procedureTypes: data?.data?.results ?? [], isLoading };
}

export function useConceptSearch(query: string, conceptClassUuid: string) {
  const classParam = conceptClassUuid ? `&class=${conceptClassUuid}` : '';
  const url = `${restBaseUrl}/concept?name=${query}&searchType=fuzzy${classParam}&v=custom:(uuid,display)`;
  const { data, error, isLoading } = useSWR<{ data: { results: ConceptReference[] } }, Error>(
    query ? url : null,
    openmrsFetch,
  );
  return { searchResults: data?.data?.results ?? [], isSearching: isLoading };
}

export async function saveProcedure(payload: RawProcedure) {
  const url = `${restBaseUrl}/procedure`;
  return openmrsFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
  });
}

export function useMutatePatientProcedures(patientUuid: string) {
  const { mutate } = useSWRConfig();
  return () =>
    mutate((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/procedure?patient=${patientUuid}`));
}

export function useProcedures(patientUuid: string) {
  const url = `${restBaseUrl}/procedure?patient=${patientUuid}&v=full&limit=100`;
  const { data, error, isLoading, isValidating } = useSWR<{ data: ProcedureApiResponse }, Error>(
    patientUuid ? url : null,
    openmrsFetch,
  );
  return { procedures: data ? (data.data?.results ?? []) : null, error, isLoading, isValidating };
}

export async function deleteProcedure(procedureId: string) {
  const controller = new AbortController();
  const url = `${restBaseUrl}/procedure/${procedureId}`;

  return await openmrsFetch(url, {
    method: 'DELETE',
    signal: controller.signal,
  });
}

export function useConceptSearchField(conceptClassUuid: string) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConcept, setSelectedConcept] = useState<ConceptReference | null>(null);

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
