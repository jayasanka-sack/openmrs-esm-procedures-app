export const mockProcedureTypes = [
  { uuid: 'pt-uuid-1', name: 'Surgery' },
  { uuid: 'pt-uuid-2', name: 'Endoscopy' },
  { uuid: 'pt-uuid-3', name: 'Radiology' },
];

export const searchedProcedure = [{ uuid: 'proc-concept-uuid-1', display: 'Appendectomy' }];

export const mockProceduresResponse = {
  results: [
    {
      uuid: 'proc-uuid-1',
      procedureCoded: { display: 'Appendectomy' },
      procedureType: { name: 'Surgery' },
      startDateTime: '2021-01-10T00:00:00.000+0000',
      status: { display: 'Completed' },
      voided: false,
    },
    {
      uuid: 'proc-uuid-2',
      procedureCoded: { display: 'Colonoscopy' },
      procedureType: { name: 'Endoscopy' },
      startDateTime: '2021-02-15T00:00:00.000+0000',
      status: { display: 'Completed' },
      voided: false,
    },
    {
      uuid: 'proc-uuid-3',
      procedureNonCoded: 'Blood draw',
      procedureType: { name: 'Lab' },
      startDateTime: '2021-03-20T00:00:00.000+0000',
      status: { display: 'Completed' },
      voided: false,
    },
    {
      uuid: 'proc-uuid-4',
      procedureCoded: { display: 'Chest X-Ray' },
      procedureType: { name: 'Radiology' },
      startDateTime: '2021-04-05T00:00:00.000+0000',
      status: { display: 'Completed' },
      voided: false,
    },
    {
      uuid: 'proc-uuid-5',
      procedureCoded: { display: 'ECG' },
      procedureType: { name: 'Cardiology' },
      startDateTime: '2021-05-12T00:00:00.000+0000',
      status: { display: 'Completed' },
      voided: false,
    },
    {
      uuid: 'proc-uuid-6',
      procedureCoded: { display: 'MRI Brain' },
      procedureType: { name: 'Radiology' },
      startDateTime: '2021-06-18T00:00:00.000+0000',
      status: { display: 'Completed' },
      voided: false,
    },
    {
      uuid: 'proc-uuid-7-voided',
      procedureCoded: { display: 'Should Not Appear' },
      procedureType: { name: 'Surgery' },
      startDateTime: '2021-07-01T00:00:00.000+0000',
      status: { display: 'Completed' },
      voided: true,
    },
  ],
  links: [],
};
