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
import { parseAxiosError } from '../utils/errors';
import { CreateCustomerModal } from './CreateCustomerModal';
import { AppBar, Box, Button, Grid, TextField, Toolbar, Typography } from '@mui/material';
import { AddLocationAlt, LocationOn, PersonAdd } from '@mui/icons-material';
import { ViewCustomerAddressesModal } from './ViewCustomerAddressesModal';
import { CreateCustomerAddressesModal } from './CreateCustomerAddressModal';
import { Customer } from '@unconventional-jackson/avoca-external-api';
import { EditCustomerModal } from './EditCustomerModal';

type ViewCustomerAddressesActionProps = GridActionsCellItemProps & {
  id: string;
  refetch: () => Promise<unknown>;
};
function ViewCustomerAddressesAction({ id, refetch, ...props }: ViewCustomerAddressesActionProps) {
  const [isViewCustomerAddressesModalOpen, setIsViewCustomerAddressesModalOpen] = useState(false);
  const handleOpenViewCustomerAddressesModal = useCallback(() => {
    setIsViewCustomerAddressesModalOpen(true);
  }, [id]);
  const handleCloseViewCustomerAddressesModal = useCallback(() => {
    setIsViewCustomerAddressesModalOpen(false);
  }, []);

  return (
    <Fragment>
      <GridActionsCellItem
        {...props}
        onClick={handleOpenViewCustomerAddressesModal}
        label="Addresses"
      />
      <ViewCustomerAddressesModal
        open={isViewCustomerAddressesModalOpen}
        onClose={handleCloseViewCustomerAddressesModal}
        customerId={id}
        refetch={refetch}
      />
    </Fragment>
  );
}

type CreateCustomerAddressActionProps = GridActionsCellItemProps & {
  id: string;
  refetch: () => Promise<unknown>;
};
function CreateCustomerAddressAction({ id, refetch, ...props }: CreateCustomerAddressActionProps) {
  const [isCreateCustomerAddressModalOpen, setIsCreateCustomerAddressModalOpen] = useState(false);
  const handleOpenCreateCustomerAddressModal = useCallback(() => {
    setIsCreateCustomerAddressModalOpen(true);
  }, [id]);
  const handleCloseCreateCustomerAddressModal = useCallback(() => {
    setIsCreateCustomerAddressModalOpen(false);
  }, []);

  return (
    <Fragment>
      <GridActionsCellItem
        {...props}
        onClick={handleOpenCreateCustomerAddressModal}
        label="Address"
      />
      <CreateCustomerAddressesModal
        open={isCreateCustomerAddressModalOpen}
        onClose={handleCloseCreateCustomerAddressModal}
        customerId={id}
        refetch={refetch}
      />
    </Fragment>
  );
}

type ViewCustomerJobsActionProps = GridActionsCellItemProps & {
  id: string;
};

function ViewCustomerJobsAction({ id, ...props }: ViewCustomerJobsActionProps) {
  const navigate = useNavigate();
  const handleViewCustomerJobs = useCallback(() => {
    navigate(`/app/customers/${id}/jobs`);
  }, [id, navigate]);

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
          <ViewCustomerAddressesAction
            id={params.row.id}
            label="Addresses"
            refetch={refetch}
            showInMenu={false}
            icon={<LocationOn />}
          />,
          <CreateCustomerAddressAction
            id={params.row.id}
            label="Address"
            refetch={refetch}
            showInMenu={false}
            icon={<AddLocationAlt />}
          />,
          <ViewCustomerJobsAction
            id={params.row.id}
            label="View Jobs"
            showInMenu={false}
            icon={<GridMenuIcon />}
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

  const [searchTerm, setSearchTerm] = useState<string>('');
  const handleChangeSearchTerm = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, []);

  const q = useMemo(() => {
    if (searchTerm) {
      return searchTerm;
    }
    return undefined;
  }, [searchTerm]);
  const page = useMemo(() => paginationModel.page, [paginationModel]);
  const pageSize = useMemo(() => paginationModel.pageSize, [paginationModel]);
  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      'getCustomers',
      {
        q,
        page,
        pageSize,
      },
    ],
    queryFn: async () => {
      try {
        const response = await customersSdk.getV1Customers(q, page, pageSize);

        return response.data;
      } catch (error) {
        console.error('Error fetching customers:', error);
        toast.error(`Failed to fetch customers: ${parseAxiosError(error)}`);
      }
    },
    // enabled: !!validFilters,
  });

  /**
   * MUI
   */
  const rows = useMemo<GridRowsProp>(() => data?.customers ?? [], [data]);
  const rowCount = useMemo<number>(() => data?.total_items ?? 0, [data]);

  /**
   * MUI
   */
  const [isEditCustomerModalOpen, setIsEditCustomerModalOpen] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const handleClosedEditCustomerModal = useCallback(() => {
    setIsEditCustomerModalOpen(false);
    setCustomerId(null);
  }, []);
  const handleRowClick = useCallback(
    (params: GridRowParams) => {
      const row = params.row as Customer;
      setCustomerId(row.id ?? null);
      setIsEditCustomerModalOpen(true);
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
      <Box sx={{}}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Customers
            </Typography>
            <Button
              onClick={handleOpenCreateCustomerModal}
              color="inherit"
              startIcon={<PersonAdd />}
            >
              Create New Customer
            </Button>
          </Toolbar>
        </AppBar>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} m={2} flexShrink={1}>
          <TextField
            label="Search"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={handleChangeSearchTerm}
          />
        </Grid>
        <Grid item xs={12}>
          <Box style={{ height: 600, width: '100%' }} justifyContent="flex-start">
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
          </Box>
        </Grid>
      </Grid>
      <CreateCustomerModal
        open={isCreateCustomerModalOpen}
        onClose={handleCloseCreateCustomerModal}
        refetch={refetch}
      />
      {customerId && (
        <EditCustomerModal
          open={isEditCustomerModalOpen}
          onClose={handleClosedEditCustomerModal}
          customerId={customerId}
          refetch={refetch}
        />
      )}
    </PageLayout>
  );
}
