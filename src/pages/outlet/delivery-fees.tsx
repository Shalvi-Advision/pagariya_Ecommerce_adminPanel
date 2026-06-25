import type { Store } from 'src/types/api';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import InputAdornment from '@mui/material/InputAdornment';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { CONFIG } from 'src/config-global';
import { getAllStores } from 'src/services/stores';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { PermissionButton } from 'src/components/permission-button/permission-button';

import { DeliveryFeeDialog } from './components/delivery-fee-dialog';

const formatSlabSummary = (store: Store) => {
  const slabs = store.delivery_distance_slabs || [];
  if (!slabs.length) {
    return `Flat ₹${store.delivery_per_km_charge ?? 5}/km`;
  }
  return `${slabs.length} slab(s)`;
};

export default function Page() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getAllStores({
        page,
        limit,
        search: searchQuery || undefined,
      });
      if (response.success) {
        setStores(response.data);
        setTotalPages(response.pagination.pages || response.pagination.totalPages || 1);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load stores');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleConfigure = (store: Store) => {
    setSelectedStore(store);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedStore(null);
  };

  const handleSaveSuccess = () => {
    setOpenDialog(false);
    setSelectedStore(null);
    fetchStores();
  };

  return (
    <>
      <title>{`Delivery Fees - ${CONFIG.appName}`}</title>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4">Delivery Fees</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Configure per-km slabs, handling fee, and package fee for each store.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Card>
            <Box sx={{ p: 2 }}>
              <TextField
                fullWidth
                placeholder="Search by store code or store name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

            <Scrollbar>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Store</TableCell>
                      <TableCell>Base charge</TableCell>
                      <TableCell>Per km / slabs</TableCell>
                      <TableCell>Handling</TableCell>
                      <TableCell>Package</TableCell>
                      <TableCell>Free above ₹</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : stores.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                          <Typography variant="body2" color="text.secondary">
                            No stores found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      stores.map((store) => (
                        <TableRow key={store._id}>
                          <TableCell>
                            <Typography variant="subtitle2">{store.mobile_outlet_name}</Typography>
                            <Chip label={store.store_code} size="small" variant="outlined" sx={{ mt: 0.5 }} />
                          </TableCell>
                          <TableCell>
                            ₹{store.delivery_base_charge ?? 30} / {store.delivery_base_distance_km ?? 3} km
                          </TableCell>
                          <TableCell>{formatSlabSummary(store)}</TableCell>
                          <TableCell>₹{store.handling_fee ?? 0}</TableCell>
                          <TableCell>₹{store.package_fee ?? 0}</TableCell>
                          <TableCell>₹{store.free_delivery_threshold ?? 6000}</TableCell>
                          <TableCell align="right">
                            <PermissionButton section="outlet" action="edit">
                              <IconButton size="small" color="primary" onClick={() => handleConfigure(store)}>
                                <Iconify icon="solar:settings-bold-duotone" />
                              </IconButton>
                            </PermissionButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary" />
              </Box>
            )}
          </Card>
        </Stack>
      </Container>

      <DeliveryFeeDialog
        open={openDialog}
        store={selectedStore}
        onClose={handleDialogClose}
        onSuccess={handleSaveSuccess}
      />
    </>
  );
}
