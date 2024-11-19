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
import { NavbarContainer } from '../components/NavbarContainer/NavbarContainer';
import { parseAxiosError } from '../utils/errors';
import { CreateCustomerModal } from './CreateCustomerModal';
import { Button } from '@mui/material';

export function JobsPage() {
  const jobsSdk = useJobsSdk();
  const navigate = useNavigate();

  /**
   * MUI
   */
  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'selfExclusionFormId', headerName: 'Form ID', width: 150 },
      { field: 'userId', headerName: 'User ID', width: 150 },
      { field: 'exclusionPeriod', headerName: 'Exclusion Period', width: 150 },
      { field: 'dateOfBirth', headerName: 'Date of Birth', width: 150 },
      { field: 'createdAt', headerName: 'Submission Date', width: 150 },
      { field: 'lastName', headerName: 'Last Name', width: 150 },
      { field: 'firstName', headerName: 'First Name', width: 150 },
      { field: 'middleName', headerName: 'Middle Name', width: 150 },
      { field: 'aliases', headerName: 'Aliases', width: 150 },
      { field: 'address', headerName: 'Address', width: 150 },
      { field: 'aptNumber', headerName: 'Apt Number', width: 150 },
      { field: 'city', headerName: 'City', width: 150 },
      { field: 'state', headerName: 'State', width: 150 },
      { field: 'zipCode', headerName: 'Zip Code', width: 150 },
      { field: 'telephoneNumber', headerName: 'Telephone Number', width: 150 },
      { field: 'ssn', headerName: 'SSN', width: 150 },
      { field: 'employedAtCasino', headerName: 'Employed at Casino', width: 150 },
      { field: 'casinoJobTitle', headerName: 'Casino Job Title', width: 150 },
      { field: 'height', headerName: 'Height', width: 150 },
      { field: 'weight', headerName: 'Weight', width: 150 },
      { field: 'gender', headerName: 'Gender', width: 150 },
      { field: 'hairColor', headerName: 'Hair Color', width: 150 },
      { field: 'eyeColor', headerName: 'Eye Color', width: 150 },
      {
        field: 'distinguishingCharacteristics',
        headerName: 'Distinguishing Characteristics',
        width: 150,
      },
      { field: 'otherExclusionPeriod', headerName: 'Other Exclusion Period', width: 150 },
      { field: 'signature', headerName: 'Signature', width: 150 },
      { field: 'createdAt', headerName: 'Created At', width: 150 },
      { field: 'updatedAt', headerName: 'Updated At', width: 150 },
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

  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      'getCustomers',
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
  const handleRowClick = useCallback(
    (params: GridRowParams) => {
      navigate(`/app/customers/${params.row.customerId}`);
    },
    [navigate]
  );

  /**
   * Manage the state of the Create Customer Modal
   */
  const [isCreateCustomerModalOpen, setIsCreateCustomerModalOpen] = useState(false);
  const handleOpenCreateCustomerModal = useCallback(() => {
    setIsCreateCustomerModalOpen(true);
  }, []);
  const handleCloseCreateCustomerModal = useCallback(() => {
    setIsCreateCustomerModalOpen(false);
  }, []);

  return (
    <PageLayout>
      <NavbarContainer>
        <div className="forms-navbar-title-container">
          <p className="title">Jobs</p>
        </div>
        <div className="forms-navbar-content">
          <Button onClick={handleOpenCreateCustomerModal}>Create New Job</Button>
        </div>
      </NavbarContainer>
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
            getRowId={(row) => row.selfExclusionFormId}
            onRowClick={handleRowClick}
            pageSizeOptions={[10, 25, 50, 100]}
          />
        </div>
      </MainContent>
      <CreateCustomerModal
        open={isCreateCustomerModalOpen}
        onClose={handleCloseCreateCustomerModal}
        refetch={refetch}
      />
    </PageLayout>
  );
}
