'use client';

import { ReactNode, useEffect, useState, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
// import { format } from 'date-fns';
import { useBodyClass } from '@/hooks/use-body-class';
import { useSettings } from '@/providers/settings-provider';
import { Button } from '@/components/ui/button';
import { Footer } from './components/footer';
import { Header } from './components/header';
import { Toolbar, ToolbarActions, ToolbarHeading } from './components/toolbar';
import { useAppSelector, useAppDispatch } from '@/lib/store/store';
// import { getProfile } from '@/lib/Actions/authActions'; // Unused import
// import { getAdminProfileInfo } from '@/lib/Actions/adminActions'; // Unused import

import { clientApiCallPublic } from '@/lib/clientApi';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { wishListGet, wishListDetail, wishListDelete, wishListSearch } from '@/lib/Actions/SearchActions';
import { Input } from '@/components/ui/input';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';
import { useSessionExpiry } from '@/hooks/useSessionExpiry';
import AuthModalManager from '@/app/(auth)/components/SignInForm';
import {
  MaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import { I18nProvider } from 'react-aria-components';
import Link from 'next/link';
import { ThemeProvider } from '@/app/contexts/ThemeContext';

function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  return hasMounted;
}

interface WishlistItem {
  StateCode: string;
  id?: string;
  TemplateId?: string;
  TemplateName?: string;
  searchInput?: {
    series: string;
    numerologyValue: string;
    selectedState: string;
    rto: string;
    digit1Conditions: unknown[];
    digit2Conditions: unknown[];
    digit3Conditions: unknown[];
    digit4Conditions: unknown[];
  };
  CreatedDateText?: string;
  CreatedTimeText?: string;
  name?: string;
  wishListDetail?: string;
  // Flat detail fields
  StateName?: string;
  RtoCode?: string;
  SeriesCode?: string;
  NumerologyValue?: number;
  Digit1_Conditions?: unknown[];
  Digit2_Conditions?: unknown[];
  Digit3_Conditions?: unknown[];
  Digit4_Conditions?: unknown[];
  TemplateData?: string; // Added for API-based wishlists
}

function getFilterTypeLabel(filterType: number): string {
  switch (filterType) {
    case 1: return 'Equal To';
    case 2: return 'Not Equal To';
    case 3: return 'Greater Than';
    case 4: return 'Less Than';
    case 5: return 'Odd Number';
    case 6: return 'Even Number';
    default: return String(filterType);
  }
}

const Demo7Layout = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const wishlistState = useAppSelector((state) => state.wishlistState);
  const wishlistDetailState = useAppSelector((state) => state.wishlistDetailState || state.wishlistState); // fallback for legacy
  const { setOption } = useSettings();
  const isAuthenticated = useAppSelector((state: unknown) => (state as { authState: { isAuthenticated: boolean } }).authState.isAuthenticated);
  const authState = useAppSelector((state: unknown) => (state as { authState: { user: { RoleId: number } | null; token: string | null; isAuthenticated: boolean; loading: boolean } }).authState);
  const userRoleId = authState.user?.RoleId;
  // const authLoading = authState.loading; // Unused variable
  const pathname = usePathname();
  const router = useRouter();

  // Initialize token refresh functionality
  useTokenRefresh();
  
  // Initialize session expiry monitoring
  useSessionExpiry();

  const [showWishlistDialog, setShowWishlistDialog] = useState(false);
  const [showConditionsDialog, setShowConditionsDialog] = useState(false);
  const [selectedWishlistItem, setSelectedWishlistItem] = useState<WishlistItem | null>(null);
  const [showSigninModal, setShowSigninModal] = useState(false);
  const hasMounted = useHasMounted();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const filteredData = useMemo(
    () => {
    

      // Handle nested structure: content[0].Records
      let wishlistItems = [];
      if (wishlistState.content && Array.isArray(wishlistState.content) && wishlistState.content.length > 0) {
       

        // Check if it's the nested structure with Records
        if (wishlistState.content[0] && wishlistState.content[0].Records && Array.isArray(wishlistState.content[0].Records)) {
         
          wishlistItems = wishlistState.content[0].Records;
        } else {
          // Fallback to direct array structure
        
          wishlistItems = wishlistState.content;
        }
      } else {
       
      }

      

      // Since we're now using API search, return the items directly from the API response
      // The API will handle the filtering based on the search query
      return wishlistItems;
    },
    [wishlistState]
  );

  // Remove unused wishlistItems and tableData
  // const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  // const [tableData, setTableData] = useState<WishlistItem[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [wishlistToDelete, setWishlistToDelete] = useState<WishlistItem | null>(null);


  // Using the custom hook to set multiple CSS variables and class properties
  useBodyClass(`
    [--header-height-default:95px]
    data-[sticky-header=on]:[--header-height:60px]
    [--header-height:var(--header-height-default)]	
    [--header-height-mobile:70px]	
  `);

  useEffect(() => {
    setOption('layout', 'demo7');
  }, [setOption]);

  // Listen for signin modal event from refresh token failure
  useEffect(() => {
    const handleOpenSigninModal = () => {
      setShowSigninModal(true);
    };

    // Listen for both event names to ensure compatibility
    window.addEventListener('openSigninModal', handleOpenSigninModal);
    window.addEventListener('showSigninModal', handleOpenSigninModal);

    return () => {
      window.removeEventListener('openSigninModal', handleOpenSigninModal);
      window.removeEventListener('showSigninModal', handleOpenSigninModal);
    };
  }, []);

  // Add this useEffect to initialize filteredData when wishlistItems changes
  useEffect(() => {
    // setFilteredData(wishlistState.content); // This line is no longer needed
  }, [wishlistState.content]);

  // Update handleSearch to call API with search query
  const handleSearch = () => {
    if (searchInput.trim()) {
      // Call the API with search query
      dispatch(wishListSearch(searchInput.trim()));
      setSearch(searchInput); // Keep the search term visible
    } else {
      // If search is empty, load all wishlist items
      dispatch(wishListGet());
      setSearch('');
    }
  };

  // Load wishlist items from cookies
  useEffect(() => {
    try {
      const searchDataCookie = typeof window !== 'undefined' ? sessionStorage.getItem('searchData') : null;
      if (searchDataCookie) {
        // const searchData = JSON.parse(searchDataCookie);
        // setWishlistItems(searchData.wishlist || []); // This line is no longer needed
      }
    } catch {
      console.error('Error loading wishlist:');
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && userRoleId) {
      // Load wishlist only for users with role ID = 2
      if (userRoleId === 2) {
        dispatch(wishListGet());
      } else {
        console.log('[Demo7Layout] User role ID is', userRoleId, ', skipping wishlist load');
      }
    }
  }, [isAuthenticated, userRoleId, dispatch]);



  const loadWishlistItem = (item: WishlistItem) => {
    let searchInput = item.searchInput;



    // First, try to get detailed data from the backend
    const loadWishlistDetail = async () => {
      try {
        const response = await clientApiCallPublic(`/wishlist-save?TemplateId=${encodeURIComponent(item.TemplateId || '')}`, undefined, 'GET');

        if (response.ok) {
          const detailData = response.data as any;


          // Check if detail data has conditions
          if (detailData?.Content && (detailData.Content.Digit1_Conditions || detailData.Content.Digit2_Conditions || detailData.Content.Digit3_Conditions || detailData.Content.Digit4_Conditions)) {

            // Convert API format conditions to UI format
            const convertConditions = (apiConditions: unknown[] | undefined) => {
              if (!Array.isArray(apiConditions)) return [];
              return apiConditions.map((condition: unknown) => ({
                operator: (condition as { FilterType?: unknown })?.FilterType?.toString() ?? '',
                value: (condition as { FilterValue?: unknown })?.FilterValue?.toString() ?? '',
                error: ''
              }));
            };

            searchInput = {
              series: detailData.Content.SeriesCode ?? item.SeriesCode ?? '',
              numerologyValue: detailData.Content.NumerologyValue?.toString() ?? item.NumerologyValue?.toString() ?? '',
              selectedState: detailData.Content.StateName ?? item.StateName ?? '',
              rto: detailData.Content.RtoCode ?? item.RtoCode ?? '',
              digit1Conditions: convertConditions(detailData.Content.Digit1_Conditions),
              digit2Conditions: convertConditions(detailData.Content.Digit2_Conditions),
              digit3Conditions: convertConditions(detailData.Content.Digit3_Conditions),
              digit4Conditions: convertConditions(detailData.Content.Digit4_Conditions),
            };

            // Continue with loading the form
            loadFormWithSearchInput(searchInput);
            return;
          }
        }
      } catch (error) {
        console.error('Error fetching wishlist detail:', error);
      }

      // Fallback to existing logic if detail fetch fails or has no conditions
      loadFormWithExistingLogic();
    };

    const loadFormWithSearchInput = (searchInput: unknown) => {
      try {
        setShowConditionsDialog(false);
        const existingSearchDataCookie = typeof window !== 'undefined' ? sessionStorage.getItem('searchData') : null;
        let existingSearchData = { currentSearch: null, wishlist: [] };
        if (existingSearchDataCookie) {
          try {
            existingSearchData = JSON.parse(existingSearchDataCookie);
          } catch {
            existingSearchData = { currentSearch: null, wishlist: [] };
          }
        }
        const updatedSearchData = {
          ...existingSearchData,
          currentSearch: searchInput
        };
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('searchData', JSON.stringify(updatedSearchData));
        }
        const reloadEvent = new CustomEvent('reloadFormData', {
          detail: {
            searchInput,
            TemplateId: item.TemplateId,
            TemplateName: item.TemplateName
          }
        });
        window.dispatchEvent(reloadEvent);
        if (!pathname?.includes('/Home')) {
          router.push('/Home');
          setTimeout(() => {
            window.scrollTo(0, 2000);
          }, 1500);
        } else {
          setTimeout(() => {
            window.scrollTo(0, 2000);
          }, 300);
        }
      } catch {
        console.error('❌ Error loading wishlist item:');
      }
    };

    const loadFormWithExistingLogic = () => {
      // If no searchInput, try to create it from the API data structure
      if (!searchInput) {
        // Check if we have the API data structure (direct properties)
        if (item.SeriesCode || item.RtoCode || item.NumerologyValue !== undefined) {
          // Convert API format conditions to UI format
          const convertConditions = (apiConditions: unknown[] | undefined) => {
            if (!Array.isArray(apiConditions)) return [];
            return apiConditions.map((condition: unknown) => ({
              operator: (condition as { FilterType?: unknown })?.FilterType?.toString() ?? '',
              value: (condition as { FilterValue?: unknown })?.FilterValue?.toString() ?? '',
              error: ''
            }));
          };

          searchInput = {
            series: item.SeriesCode ?? '',
            numerologyValue: item.NumerologyValue?.toString() ?? '',
            selectedState: item.StateName ?? '',
            rto: item.RtoCode ?? '',
            digit1Conditions: convertConditions(item.Digit1_Conditions),
            digit2Conditions: convertConditions(item.Digit2_Conditions),
            digit3Conditions: convertConditions(item.Digit3_Conditions),
            digit4Conditions: convertConditions(item.Digit4_Conditions),
          };
        }
        // Fallback to TemplateData parsing
        else if (item.TemplateData) {
          try {
            const parsed = JSON.parse(item.TemplateData);

            // Convert API format conditions to UI format
            const convertConditions = (apiConditions: unknown[] | undefined) => {
              if (!Array.isArray(apiConditions)) return [];
              return apiConditions.map((condition: unknown) => {
                const cond = condition as { FilterType?: unknown; FilterValue?: unknown };
                return {
                  operator: cond.FilterType?.toString() ?? '',
                  value: cond.FilterValue?.toString() ?? '',
                  error: ''
                };
              });
            };

            searchInput = {
              series: parsed.SeriesCode ?? '',
              numerologyValue: parsed.NumerologyValue?.toString() ?? '',
              selectedState: parsed.StateName ?? '',
              rto: parsed.RtoCode ?? '',
              digit1Conditions: convertConditions(parsed.Digit1_Conditions),
              digit2Conditions: convertConditions(parsed.Digit2_Conditions),
              digit3Conditions: convertConditions(parsed.Digit3_Conditions),
              digit4Conditions: convertConditions(parsed.Digit4_Conditions),
            };
          } catch (e) {
            console.error('Failed to parse TemplateData:', e);
            searchInput = undefined;
          }
        }
      }

      if (!searchInput) {
        console.error('No valid searchInput. item:', item);
        alert('This wishlist item has no search data to load.');
        return;
      }

      loadFormWithSearchInput(searchInput);
    };

    // Start the loading process
    loadWishlistDetail();
  };

  // Define columns for MaterialReactTable
  const columns: MRT_ColumnDef<WishlistItem>[] = useMemo(() => [

    {
      header: 'S.No',
      size: 60,
      Cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: 'TemplateName',
      header: 'Name',
      size: 200,
      Cell: ({ cell }) => (
        <span style={{ color: '#009ef7', cursor: 'pointer' }}>
          {String(cell.getValue())}
        </span>
      ),
    },
    {
      accessorKey: 'StateCode',
      header: 'State',
      size: 100,
      Cell: ({ row }) => row.original.StateCode ?? '',
    },
    {
      accessorKey: 'RtoCode',
      header: 'RTO',
      size: 100,
      Cell: ({ row }) => row.original.RtoCode ?? '',
    },
    {
      accessorKey: 'SeriesCode',
      header: 'Series',
      size: 100,
      Cell: ({ row }) => row.original.SeriesCode ?? '',
    },
    {
      accessorKey: 'NumerologyValue',
      header: 'Value',
      size: 100,
      Cell: ({ row }) => row.original.NumerologyValue ?? '',
    },
    {
      header: 'Action',
      size: 120,
      Cell: ({ row }) => (
        <div className='flex justify-center items-center gap-2'>
          <a
            href="#"
            style={{ color: '#009ef7', textDecoration: 'none', cursor: 'pointer' }}
            onClick={e => {
              e.preventDefault();
              setSelectedWishlistItem(row.original);
              setShowConditionsDialog(true);
              dispatch(wishListDetail(row.original.TemplateId || ''));
              // handle view action here
            }}
          >
            <span className='text-sm font-normal'>View</span>
          </a>
          <span
            className='text-xs text-red-500 font-normal cursor-pointer'
            onClick={e => {
              e.stopPropagation();
              setWishlistToDelete(row.original);
              setDeleteDialogOpen(true);
            }}
          >
            Delete
          </span>
        </div>
      ),
    },
  ], [dispatch]); // Add dispatch to dependencies

  // Update wishlistDetailItem to use wishlistDetailState.content if available
  const wishlistDetailItem: WishlistItem | null = useMemo(() => {
    if (wishlistDetailState && wishlistDetailState.content && (wishlistDetailState.content as WishlistItem)?.TemplateId) {
      return wishlistDetailState.content as WishlistItem;
    }
    return selectedWishlistItem;
  }, [wishlistDetailState, selectedWishlistItem]);

  // Removed loading spinner as per user request

  return (
    <ThemeProvider>
      <I18nProvider>
        <div className="branded-bg flex grow flex-col in-data-[sticky-header=on]:pt-(--header-height-default)">
        <Header />
        {hasMounted && (
          <>
            {isAuthenticated && (
              <div role="content">
                {(pathname === '/Home' || pathname === '/Home/') && (
                  <>
                    <div  >
                      <div className="max-w-7xl mx-auto mt-5 ">
                        <div className="flex items-center space-x-2 px-4">
                          <Link href="/Home" className="text-gray-700 hover:text-primary">
                            <i className="ki-outline ki-home text-lg"></i>
                          </Link>
                          <i className="ki-outline ki-right text-sm text-gray-900"></i>
                          <span className="text-gray-700 font-semibold text-sm">Home</span>
                        </div>
                      </div>

                      <div className="border-b border-border mb-5 lg:mb-3.5 max-w-7xl mx-auto px-4 h-0"></div>
                    </div>
                  </>
                )}
                {pathname?.includes('/Home') && (() => {
                  // Check if there are wishlist items to show
                  if (wishlistState.content && Array.isArray(wishlistState.content) && wishlistState.content.length > 0) {
                    // Check if it's the nested structure with Records
                    if (wishlistState.content[0] && wishlistState.content[0].Records && Array.isArray(wishlistState.content[0].Records)) {
                      return wishlistState.content[0].Records.length > 0;
                    } else {
                      // Fallback to direct array structure
                      return wishlistState.content.length > 0;
                    }
                  }
                  return false;
                })() && (
                  <div>
                    <Toolbar>

                      <p className="text-base mx-2">
                        My Ultimate Wishlist
                      </p>
                      <ToolbarHeading />
                      <ToolbarActions>
                        <div className="relative">
                          <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={() => {
                              if (!showWishlistDialog) {
                                dispatch(wishListGet());
                              }
                              setShowWishlistDialog((open) => !open);
                            }}
                          >

                            Wishlist ({(() => {
                              if (wishlistState.content && Array.isArray(wishlistState.content) && wishlistState.content.length > 0) {
                                // Check if it's the nested structure with Records
                                if (wishlistState.content[0] && wishlistState.content[0].Records && Array.isArray(wishlistState.content[0].Records)) {
                                  return wishlistState.content[0].Records.length;
                                } else {
                                  // Fallback to direct array structure
                                  return wishlistState.content.length;
                                }
                              }
                              return 0;
                            })()})
                          </Button>

                        </div>
                      </ToolbarActions>
                    </Toolbar>
                  </div>
                )}
                {children}

                {/* Wishlist Dialog */}
                <Dialog
                  open={showWishlistDialog}
                  onClose={() => setShowWishlistDialog(false)}
                  maxWidth="md"
                  fullWidth
                  PaperProps={{
                    sx: {
                      borderRadius: 3,
                      p: 0,
                      maxHeight: '80vh',
                    }
                  }}
                >
                  <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0 }}>
                    <div>
                      <p className="text-base font-normal text-black">My Wishlists</p>
                    </div>
                    <IconButton onClick={() => setShowWishlistDialog(false)} style={{ marginRight: '-11px' }}>
                      <CloseIcon />
                    </IconButton>
                  </DialogTitle>
                  <DialogContent dividers sx={{ p: 3, background: '#fff' }}>
                    <div className="flex items-center gap-2 justify-end mt-[-14px] mb-[10px]">
                      <Input
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSearch();
                          }
                        }}
                        placeholder="Search"
                        className="border px-3 py-2 rounded-md w-55"
                        style={{ height: '40px' }}
                      />
                      <button
                        onClick={handleSearch}
                        className="w-10 h-10 flex items-center justify-center border rounded-md hover:bg-gray-50"
                        title="Search"
                        type="button"
                        disabled={wishlistState.loading}
                      >
                        {wishlistState.loading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                        ) : (
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setSearch('');
                          setSearchInput(''); // Also clear the input field
                          // Reload all wishlist items when search is cleared
                          dispatch(wishListGet());
                        }}
                        className="w-10 h-10 flex items-center justify-center border rounded-md hover:bg-gray-50"
                        title="Clear search"
                        type="button"
                      >
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                    {filteredData.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No wishlist items found.</p>
                        {search && (
                          <p className="text-sm mt-2">No items match your search criteria.</p>
                        )}
                      </div>
                    ) : (
                      <MaterialReactTable
                        columns={columns}
                        data={filteredData}
                        enableSorting={false}
                        enableGlobalFilter={false}
                        enableColumnFilters={false}
                        enableColumnActions={false}
                        enableDensityToggle={false}
                        enableFullScreenToggle={false}
                        enableFilters={false}
                        renderTopToolbar={false}
                        muiTableHeadCellProps={({ column }) => ({
                          sx: {
                            backgroundColor: '#f5f5f5',
                            borderRight: column.id === 'actions' ? 'none' : '1px solid #e0e0e0',
                            textAlign: 'center',
                          },
                        })}
                        muiTableBodyCellProps={({ cell, row, table }) => ({
                          sx: {
                            borderRight: cell.column.id === 'actions' ? 'none' : '1px solid #e0e0e0',
                            paddingLeft: '10px',
                            color: '#1f2937',
                            fontWeight: 400,
                            padding: '12px',
                            minWidth: 0,
                            maxWidth: 80,
                            borderBottom:
                              row.index === table.getRowModel().rows.length - 1
                                ? 'none'
                                : '1px solid #e0e0e0',
                          },
                        })}
                        muiTablePaperProps={{
                          sx: {
                            border: '1px solid #e0e0e0',
                            borderRadius: '6px',
                            boxShadow: 'none',
                          },
                        }}
                      />
                    )}
                  </DialogContent>
                </Dialog>

                {/* 
// Conditions Dialog */}
                <Dialog
                  open={showConditionsDialog}
                  onClose={() => setShowConditionsDialog(false)}
                  maxWidth="md"
                  fullWidth
                >
                  <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0 }}>
                    <div>

                      <div className="flex items-center gap-6 mt-1 mb-2">
                        <p className='text-lg text-bold  text-[#009ef7]'>{wishlistDetailItem?.TemplateName || wishlistDetailItem?.name || ''}</p>
                      </div>
                    </div>
                    <IconButton onClick={() => setShowConditionsDialog(false)} style={{ marginRight: '-11px' }}>
                      <CloseIcon />
                    </IconButton>
                  </DialogTitle>
                  {wishlistDetailItem && (
                    <DialogContent dividers sx={{ p: 3, background: '#fff' }}>
                      <>
                        <div className='flex flex-wrap gap-4 mt-[-14px] mb-[10px]'>
                          <div className='flex items-center'>
                            <p className='text-sm font-normal text-gray-500'>State: </p>
                            <p className='text-base font-bold text-black ml-1'>
                              {wishlistDetailItem.StateName && wishlistDetailItem.StateName.trim() !== '' ? wishlistDetailItem.StateName : 'N/A'}
                            </p>
                          </div>
                          <div className='flex items-center'>
                            <p className='text-sm font-normal text-gray-500'>RTO: </p>
                            <p className='text-base font-bold text-black ml-1'>{wishlistDetailItem.RtoCode || 'N/A'}</p>
                          </div>
                          <div className='flex items-center'>
                            <p className='text-sm font-normal text-gray-500'>Series: </p>
                            <p className='text-base font-bold text-black ml-1'>{wishlistDetailItem.SeriesCode || 'N/A'}</p>
                          </div>
                          <div className='flex items-center'>
                            <p className='text-sm font-normal text-gray-500'>Value: </p>
                            <p className='text-base font-bold text-amber-500 ml-1'>{wishlistDetailItem.NumerologyValue || 'N/A'}</p>
                          </div>
                        </div>
                        <div className='flex items-center gap-2  mt-[-14px] mb-[10px] '>
                          <p className='text-sm font-normal text-gray-500 mt-1'>Created Date: <span className='text-base text-black'>{wishlistDetailItem.CreatedDateText || ''}  <span className='text-sm font-normal text-gray-500 '>{wishlistDetailItem.CreatedTimeText}</span></span></p>
                        </div>
                        {/* Wishlist Detail Section */}
                        {wishlistDetailItem.wishListDetail && wishlistDetailItem.wishListDetail.trim() !== '' && (
                          <div className="mb-4 mt-2">
                            <span className="text-sm font-semibold text-gray-600">Wishlist Detail:</span>
                            <p className="text-base text-black bg-gray-50 rounded px-3 py-2 mt-1 border border-gray-200 whitespace-pre-line">{wishlistDetailItem.wishListDetail}</p>
                          </div>
                        )}
                      </>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                        <div className="space-y-1 bg-gray-100 rounded-lg p-4 ">
                          <span className="text-black font-bold">DIGIT 1:</span>
                          <div className="space-y-1 mt-1 flex flex-col">
                            {wishlistDetailItem.Digit1_Conditions?.map((condition: unknown, idx: number) => {
                              const cond = condition as { id?: string; FilterType?: number; FilterValue?: string };
                              return (
                                <div key={cond.id ?? idx}>
                                  <span className="text-sm font-normal text-gray-500">{getFilterTypeLabel(cond.FilterType || 0)} : </span>
                                  <span className="text-base font-bold text-black ml-1">{cond.FilterValue}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="space-y-1 bg-gray-100 rounded-lg p-4 ">
                          <span className="text-black font-bold">DIGIT 2:</span>
                          <div className="space-y-1 mt-1 flex flex-col">
                            {wishlistDetailItem.Digit2_Conditions?.map((condition: unknown, idx: number) => {
                              const cond = condition as { id?: string; FilterType?: number; FilterValue?: string };
                              return (
                                <div key={cond.id ?? idx}>
                                  <span className="text-sm font-normal text-gray-500">{getFilterTypeLabel(cond.FilterType || 0)} : </span>
                                  <span className="text-base font-bold text-black ml-1">{cond.FilterValue}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="space-y-1 bg-gray-100 rounded-lg p-4 ">
                          <span className="text-black font-bold">DIGIT 3:</span>
                          <div className="space-y-1 mt-1 flex flex-col">
                            {wishlistDetailItem.Digit3_Conditions?.map((condition: unknown, idx: number) => {
                              const cond = condition as { id?: string; FilterType?: number; FilterValue?: string };
                              return (
                                <div key={cond.id ?? idx}>
                                  <span className="text-sm font-normal text-gray-500">{getFilterTypeLabel(cond.FilterType || 0)} : </span>
                                  <span className="text-base font-bold text-black ml-1">{cond.FilterValue}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="space-y-1 bg-gray-100 rounded-lg p-4 ">
                          <span className="text-black font-bold">DIGIT 4:</span>
                          <div className="space-y-1 mt-1 flex flex-col">
                            {wishlistDetailItem.Digit4_Conditions?.map((condition: unknown, idx: number) => {
                              const cond = condition as { id?: string; FilterType?: number; FilterValue?: string };
                              return (
                                <div key={cond.id ?? idx}>
                                  <span className="text-sm font-normal text-gray-500">{getFilterTypeLabel(cond.FilterType || 0)} : </span>
                                  <span className="text-base font-bold text-black ml-1">{cond.FilterValue}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  )}

                  <div className="mt-6 flex justify-end mr-5 mb-3">
                    <Button variant="outline" onClick={() => {
                      if (selectedWishlistItem) loadWishlistItem(selectedWishlistItem);
                      setShowWishlistDialog(false);
                    }} className="bg-indigo-600 text-white font-medium h-10 mr-2 rounded-lg  w-full sm:w-auto hover:bg-indigo-600">
                      Load Wishlist
                    </Button>
                    <Button variant="outline" onClick={() => setShowConditionsDialog(false)} className="bg-white text-gray-700 font-medium h-10 rounded-lg border-gray-200 w-full sm:w-auto">
                      Close
                    </Button>
                  </div>
                </Dialog>
              </div>
            )}
            {!isAuthenticated && (
              <div className="grow" role="content">
                {children}
              </div>
            )}
          </>
        )}
        <Footer />
      </div>
      {deleteDialogOpen && (
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogContent>
            <DialogTitle>
              Are you sure you want to delete this wishlist {wishlistToDelete?.TemplateName || wishlistToDelete?.name}?
            </DialogTitle>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (wishlistToDelete) {
                    console.log('🗑️ [Delete Button] Clicked, deleting wishlist item:', {
                      TemplateId: wishlistToDelete.TemplateId,
                      TemplateName: wishlistToDelete.TemplateName,
                      fullItem: wishlistToDelete
                    });
                    dispatch(wishListDelete(wishlistToDelete.TemplateId || ''));
                    setDeleteDialogOpen(false);
                  } else {
                    console.error('❌ [Delete Button] No wishlist item to delete');
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Signin Modal for refresh token failure */}
      {showSigninModal && (
        <AuthModalManager initialMode="signin" onClose={() => setShowSigninModal(false)} />
      )}
      </I18nProvider>
    </ThemeProvider>
  );
};

export { Demo7Layout };
