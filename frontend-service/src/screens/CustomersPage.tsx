import { useMemo, useState, useCallback, Fragment } from 'react';
import {
  DataGrid,
  GridPaginationModel,
  GridColDef,
  GridRowsProp,
  GridRowParams,
  GridFilterModel,
  GridActionsCellItem,
  GridMenuIcon,
  GridActionsCellItemProps,
} from '@mui/x-data-grid';
import { toast } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';
import { useCustomersSdk } from '../api/sdk';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/PageLayout/PageLayout';
import { MainContent } from '../components/MainContent/MainContent';
import { NavbarContainer } from '../components/NavbarContainer/NavbarContainer';
import { parseAxiosError } from '../utils/errors';
import { CreateCustomerModal } from './CreateCustomerModal';
import { Button, Grid, TextField } from '@mui/material';
import { LocationOn } from '@mui/icons-material';

type ViewCustomerAdressesActionProps = GridActionsCellItemProps & {
  customerId: string;
  refetch: () => Promise<unknown>;
};
function ViewCustomerAdressesAction({
  customerId,
  refetch,
  ...props
}: ViewCustomerAdressesActionProps) {
  const [isViewCustomerAdressesModalOpen, setIsViewCustomerAdressesModalOpen] = useState(false);
  const handleOpenViewCustomerAdressesModal = useCallback(() => {
    setIsViewCustomerAdressesModalOpen(true);
  }, [customerId]);
  const handleCloseViewCustomerAdressesModal = useCallback(() => {
    setIsViewCustomerAdressesModalOpen(false);
  }, []);

  return (
    <Fragment>
      <GridActionsCellItem
        {...props}
        icon={<LocationOn />}
        onClick={handleOpenViewCustomerAdressesModal}
        label="Delete"
      />
      {/* <DeleteCustomerModal
        open={isDeleteCustomerModalOpen}
        onClose={handleCloseDeleteCustomerModal}
        customerId={customerId}
        refetch={refetch}
      /> */}
    </Fragment>
  );
}

type ViewCustomerJobsActionProps = GridActionsCellItemProps & {
  customerId: string;
};

function ViewCustomerJobsAction({ customerId, ...props }: ViewCustomerJobsActionProps) {
  const navigate = useNavigate();
  const handleViewCustomerJobs = useCallback(() => {
    navigate(`/app/customers/${customerId}/jobs`);
  }, [customerId, navigate]);

  return (
    <GridActionsCellItem
      {...props}
      icon={<GridMenuIcon />}
      onClick={handleViewCustomerJobs}
      label="View Jobs"
    />
  );
}

export function CustomersPage() {
  const customersSdk = useCustomersSdk();
  const navigate = useNavigate();

  /**
   * MUI
   */
  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'first_name', headerName: 'First Name' },
      { field: 'last_lame', headerName: 'Last Name' },
      { field: 'email', headerName: 'Email' },
      { field: 'company', headerName: 'Company' },
      { field: 'mobile_number', headerName: 'Mobile Number' },
      { field: 'home_number', headerName: 'Home Number' },
      { field: 'work_number', headerName: 'Work Number' },
      { field: 'notifications_enabled', headerName: 'Notifications?' },
      { field: 'tags', headerName: 'Tags' },
      { field: 'lead_source', headerName: 'Lead Source' },
      {
        field: 'actions',
        type: 'actions',
        getActions: (params: GridRowParams) => [
          <ViewCustomerAdressesAction
            customerId={params.row.customerId}
            label="Addresses"
            refetch={refetch}
            showInMenu
          />,
          <ViewCustomerJobsAction
            customerId={params.row.customerId}
            label="View Jobs"
            showInMenu
          />,
        ],
      },
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
        const q = '';
        const response = await customersSdk.getV1Customers(
          q,
          paginationModel.page,
          paginationModel.pageSize
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
  const rows = useMemo<GridRowsProp>(() => data?.customers ?? [], [data]);
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
          <p className="title">Customers</p>
        </div>
        <div className="forms-navbar-content">
          <Button onClick={handleOpenCreateCustomerModal}>Create New Customer</Button>
        </div>
      </NavbarContainer>
      <MainContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField label="Search" variant="outlined" fullWidth />
          </Grid>
          <Grid item xs={12}>
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
          </Grid>
        </Grid>
      </MainContent>
      <CreateCustomerModal
        open={isCreateCustomerModalOpen}
        onClose={handleCloseCreateCustomerModal}
        refetch={refetch}
      />
    </PageLayout>
  );
}
