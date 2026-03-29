import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  InlineLoading,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
} from '@carbon/react';
import { Add } from '@carbon/react/icons';
import {
  formatDate,
  isDesktop as isDesktopLayout,
  launchWorkspace2,
  parseDate,
  useLayoutType,
} from '@openmrs/esm-framework';
import { CardHeader, EmptyCard, ErrorState } from '@openmrs/esm-framework';
import { useProcedures } from './procedures.resource';
import styles from './procedures-overview.scss';

interface ProceduresDetailedSummaryProps {
  patient: fhir.Patient;
}

function ProceduresDetailedSummary({ patient }: ProceduresDetailedSummaryProps) {
  const { t } = useTranslation();
  const headerTitle = t('procedures', 'Procedures');
  const displayText = t('procedures_lower', 'procedures');
  const layout = useLayoutType();
  const isDesktop = isDesktopLayout(layout);
  const launchProceduresForm = useCallback(() => launchWorkspace2('procedures-form-workspace'), []);

  const { procedures, error, isLoading, isValidating } = useProcedures(patient.id);

  const headers = useMemo(
    () => [
      { key: 'display', header: t('procedure', 'Procedure') },
      { key: 'startDateTimeRender', header: t('date', 'Date') },
    ],
    [t],
  );

  const tableRows = useMemo(
    () =>
      procedures?.map((p) => ({
        id: p.uuid,
        display: p.display,
        startDateTimeRender: p.startDateTime ? formatDate(parseDate(p.startDateTime), { mode: 'wide' }) : '--',
      })),
    [procedures],
  );

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" zebra />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={headerTitle} />;
  }

  if (procedures?.length) {
    return (
      <div className={styles.widgetCard}>
        <CardHeader title={headerTitle}>
          <span>{isValidating ? <InlineLoading /> : null}</span>
          <Button
            kind="ghost"
            renderIcon={(props) => <Add size={16} {...props} />}
            iconDescription={t('addProcedure', 'Add procedure')}
            onClick={launchProceduresForm}
          >
            {t('add', 'Add')}
          </Button>
        </CardHeader>
        <DataTable
          aria-label="procedures detailed summary"
          headers={headers}
          overflowMenuOnHover={isDesktop}
          rows={tableRows}
          size={isDesktop ? 'sm' : 'lg'}
          useZebraStyles
        >
          {({ rows, headers, getHeaderProps, getTableProps }) => (
            <>
              <TableContainer>
                <Table {...getTableProps()} className={styles.table}>
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHeader {...getHeaderProps({ header })} key={header.key}>
                          {header.header}
                        </TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {rows.length === 0 ? (
                <div className={styles.tileContainer}>
                  <Tile className={styles.tile}>
                    <div className={styles.tileContent}>
                      <p className={styles.content}>{t('noProceduresToDisplay', 'No procedures to display')}</p>
                    </div>
                  </Tile>
                </div>
              ) : null}
            </>
          )}
        </DataTable>
      </div>
    );
  }

  return <EmptyCard displayText={displayText} headerTitle={headerTitle} launchForm={launchProceduresForm} />;
}

export default ProceduresDetailedSummary;
