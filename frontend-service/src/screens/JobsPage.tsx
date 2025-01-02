import { useMemo, useState, useCallback } from 'react';
import {
  DataGrid,
  GridPaginationModel,
  GridColDef,
  GridRowsProp,
  GridRowParams,
  GridFilterModel,
} from '@mui/x-data-grid';
import { toast } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';
import { useJobsSdk } from '../api/sdk';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/PageLayout/PageLayout';
import { MainContent } from '../components/MainContent/MainContent';
import { parseAxiosError } from '../utils/errors';
import { Job } from '@unconventional-jackson/avoca-external-api';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { EditJobModal } from './EditJobModal';

export function JobsPage() {
  const jobsSdk = useJobsSdk();
  const navigate = useNavigate();

  /**
   * MUI
   */
  const columns: GridColDef<Job>[] = useMemo(
    () => [
      { field: 'id', headerName: 'id' },
      { field: 'invoice_number', headerName: 'Invoice Number' },
      { field: 'description', headerName: 'Description' },
      { field: 'customer', headerName: 'Customer' },
      { field: 'address', headerName: 'Address' },
      {
        field: 'notes',
        headerName: 'Notes',
        renderCell: (params) => params.row.notes?.map((n) => n.content)?.join(', '),
      },
      { field: 'work_status', headerName: 'Work Status' },
      { field: 'work_timestamps', headerName: 'Work Timestamps' },
      {
        field: 'schedule',
        headerName: 'Schedule',
        renderCell: (params) =>
          `From ${params.row.schedule?.scheduled_start ?? '?'} to ${params.row.schedule?.scheduled_end ?? '?'} (${params.row.schedule?.arrival_window ?? '?'} min. Arrival)`,
      },
      { field: 'total_amount', headerName: 'Total Amount' },
      { field: 'outstanding_balance', headerName: 'Outstanding Balance' },
      { field: 'assigned_employees', headerName: 'Assigned Employees' },
      { field: 'tags', headerName: 'Tags' },
      { field: 'original_estimate_id', headerName: 'Original Estimate ID' },
      { field: 'lead_source', headerName: 'Lead Source' },
      { field: 'job_fields', headerName: 'Job Fields' },
      { field: 'attachments', headerName: 'Attachments' },
      { field: 'created_at', headerName: 'Created At' },
      { field: 'updated_at', headerName: 'Updated At' },
      { field: 'company_name', headerName: 'Company Name' },
      { field: 'company_id', headerName: 'Company ID' },
    ],
    []
  );

  /**
   * MUI
   */
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
  });
  const handleFilterModelChange = useCallback((newFilterModel: GridFilterModel) => {
    if (newFilterModel.items[0].operator === 'isAnyOf') {
      newFilterModel.items[0].value = newFilterModel.items[0].value.join(' ');
    }
    setFilterModel(newFilterModel);
  }, []);

  /**
   * MUI
   */
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const handlePaginationModelChange = useCallback((model: GridPaginationModel) => {
    setPaginationModel(model);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: [
      'getJobs',
      {
        paginationModel,
        filterModel,
      },
    ],
    queryFn: async () => {
      try {
        const scheduledStartMin = undefined;
        const scheduledStartMax = undefined;
        const scheduledEndMin = undefined;
        const scheduledEndMax = undefined;
        const employeeIds = undefined;
        const customerId = undefined;
        const page = String(paginationModel.page);
        const franchiseeIds = undefined;
        const workStatus = undefined;
        const pageSize = paginationModel.pageSize;
        const sortDirection = undefined;
        const locationIds = undefined;
        const expand = undefined;

        const response = await jobsSdk.getJobs(
          scheduledStartMin,
          scheduledStartMax,
          scheduledEndMin,
          scheduledEndMax,
          employeeIds,
          customerId,
          page,
          franchiseeIds,
          workStatus,
          pageSize,
          sortDirection,
          locationIds,
          expand
        );

        return response.data;
      } catch (error) {
        console.error('Error fetching customers:', error);
        toast.error(`Failed to fetch customers: ${parseAxiosError(error)}`);
      }
    },
  });

  /**
   * MUI
   */
  const rows = useMemo<GridRowsProp>(() => data?.jobs ?? [], [data]);
  const rowCount = useMemo<number>(() => data?.total_items ?? 0, [data]);

  /**
   * MUI
   */
  const [isEditJobModalOpen, setIsEditJobModalOpen] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const handleClosedEditJobModal = useCallback(() => {
    setIsEditJobModalOpen(false);
    setJobId(null);
    setCustomerId(null);
  }, []);
  const handleRowClick = useCallback(
    (params: GridRowParams) => {
      const row = params.row as Job;
      setJobId(row.id ?? null);
      // @ts-ignore Bad API definition
      setCustomerId(row.customer_id ?? row.customer?.id ?? null);
      setIsEditJobModalOpen(true);
    },
    [navigate]
  );

  return (
    <PageLayout>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Jobs
          </Typography>
        </Toolbar>
      </AppBar>
      <MainContent>
        <div style={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            rowCount={rowCount}
            loading={isLoading}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            filterMode="server"
            filterModel={filterModel}
            onFilterModelChange={handleFilterModelChange}
            onRowClick={handleRowClick}
            pageSizeOptions={[10, 25, 50, 100]}
          />
        </div>
      </MainContent>
      {jobId && customerId && (
        <EditJobModal
          open={isEditJobModalOpen}
          onClose={handleClosedEditJobModal}
          jobId={jobId}
          customerId={customerId}
        />
      )}
    </PageLayout>
  );
}
