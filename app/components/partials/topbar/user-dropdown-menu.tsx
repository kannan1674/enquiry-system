import { ReactNode, useEffect, useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useAppSelector } from '@/lib/store/store';
import { ChevronDown, User, Eye, EyeOff, LoaderCircle, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/app/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// import { Switch } from '@/components/ui/switch';
import { useDispatch } from 'react-redux';
import { logout } from '@/lib/store/features/authSlice';
import { updateProfile, getStates, getCities } from '@/lib/Actions/authActions';
import { getAdminProfileInfo, updateProfile as updateAdminProfile, adminProfileChangePassword } from '@/lib/Actions/adminActions';
import { store } from '@/lib/store/store';
import { AdminProfileInfo } from '@/lib/store/features/adminSlice';
import { useRouter } from 'next/navigation';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { getProfileInfo } from '@/lib/Actions/authActions';
import { showSuccess, showError } from '@/lib/utils/toast';



const editProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  mobile: z.string().min(10, 'Mobile number is required'),
  email: z.string().email('Invalid email').optional(),
  city: z.string().min(1, 'City is required'),
  cityId: z.string().min(1, 'CityId is required'),
  state: z.string().min(1, 'State is required'),
  stateId: z.string().min(1, 'StateId is required'),
  businessName: z.string().min(1, 'Business name is required'),
  country: z.string().min(1, 'Country is required'),
  countryId: z.string().min(1, 'CountryId is required'),
  countryIso: z.string().min(1, 'CountryIso is required').optional(),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type EditProfileFormValues = z.infer<typeof editProfileSchema>;
type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

// Debounce utility
const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

interface EditProfileFormProps {
  onClose: () => void;
  preventAutoClose: boolean;
  setPreventAutoClose: (value: boolean) => void;
  showEditProfileModal: boolean;
}

function EditProfileForm({ onClose, setPreventAutoClose, showEditProfileModal }: EditProfileFormProps) {
  // Use proper useAppSelector hooks instead of complex useSelector with type casting
  const authState = useAppSelector((state) => state.authState);
  const adminState = useAppSelector((state) => state.adminState);
  
  const { content, sessionInfo, profileInfo } = authState || {};
  const { profileInfo: adminProfileInfo } = adminState || {};
  
  // Safely extract userData with proper type checking
  const userData = (profileInfo || sessionInfo || content || adminProfileInfo) as {
    FirstName?: string;
    LastName?: string;
    Email?: string;
    MobileNumber?: string;
    MobileNumberCc?: string;
    MobileNumberCcId?: string;
    BusinessName?: string;
    State?: string;
    Country?: string;
    CountryId?: string;
    CountryIso?: string;
    CityName?: string;
    CityId?: string;
    StateId?: string;
    CreatedDate?: string;
    CreatedDateText?: string;
    ModifiedDate?: string;
    ModifiedDateText?: string;
    RoleId?: number;
  } | null;
  
  const dispatch = useDispatch();

  // States for dropdowns
  const [states, setStates] = useState<unknown[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [cities, setCities] = useState<unknown[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const cityLoadingInProgressRef = useRef(false);
  const profileLoadingInProgressRef = useRef(false);

  // Prioritize adminProfileInfo for admin users, fallback to userData with null safety
  const firstName = adminProfileInfo?.FirstName || userData?.FirstName || '';
  const lastName = adminProfileInfo?.LastName || userData?.LastName || '';
  const email = adminProfileInfo?.Email || userData?.Email || '';
  const mobile = adminProfileInfo?.MobileNumber || userData?.MobileNumber || '';
  const businessName = adminProfileInfo?.BusinessName || userData?.BusinessName || '';
  const state = adminProfileInfo?.State || userData?.State || '';
  const country = adminProfileInfo?.Country || userData?.Country || '';
  const countryId = adminProfileInfo?.CountryId || userData?.CountryId || process.env.NEXT_PUBLIC_COUNTRY_ID || 'Vm5nelJTRnRJMWt5UW5SZVVIZEFVbWRHTjJSVmVsRlFZa1VqVGlFM2RsNU1aaW81WjFSRG1PRW5LQmZ4QmVmRExTbUhYRnpRVWVzWHpLaGN2MzJEVytBNE1wYmkyeE16Kys3RWhVSlFUU3kvU2FhbGlnZmQ';
  const countryIso = userData?.CountryIso || 'IN';

  // Debug logging for admin profile data
  console.log('🔍 [EditProfile] Admin profile data debug:', {
    adminProfileInfo,
    userData,
    businessName,
    state,
    country,
    city: adminProfileInfo?.CityName || userData?.CityName,
    roleId: userData?.RoleId
  });

  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: firstName || '',
      lastName: lastName || '',
      email: email || '',
      mobile: mobile || '',
      businessName: businessName || '',
      state: state || '',
      country: country || '',
      countryId: countryId,
      countryIso: countryIso,
      city: adminProfileInfo?.CityName || userData?.CityName || '',
      cityId: adminProfileInfo?.CityId || userData?.CityId || '',
      stateId: adminProfileInfo?.StateId || userData?.StateId || '',
    },
  });

  // Initialize loading states
  useEffect(() => {
    console.log('🔄 [EditProfile] Component mounted, initializing loading states');
    setLoadingCities(false);
    setLoadingStates(false);
    cityLoadingInProgressRef.current = false;
    profileLoadingInProgressRef.current = false;
  }, []);

  // Centralized function to fetch admin profile with duplicate call prevention
  const fetchAdminProfileData = useCallback(async (source: string) => {
    if (profileLoadingInProgressRef.current) {
      console.log('🔄 [EditProfile] Profile loading already in progress, skipping request from:', source);
      return;
    }

    console.log('🔄 [EditProfile] Fetching profile data from:', source);
    profileLoadingInProgressRef.current = true;

    try {
      // Use userData to get role information with null safety
      if (!userData) {
        console.log('🔄 [EditProfile] No userData available, skipping profile fetch');
        return;
      }
      
      const roleId = userData.RoleId;
      console.log('🔄 [EditProfile] User RoleId:', roleId);
      
      if (roleId === 1) {
        // Admin user - fetch admin profile info
        console.log('🔄 [EditProfile] Fetching admin profile for RoleId 1...');
        await dispatch(getAdminProfileInfo() as any);
        console.log('🔄 [EditProfile] Admin profile data fetched successfully from:', source);
      } else if (roleId === 2) {
        // Regular user - fetch regular profile info
        console.log('🔄 [EditProfile] Fetching regular profile for RoleId 2...');
        await dispatch(getProfileInfo() as any);
        console.log('🔄 [EditProfile] Regular profile data fetched successfully from:', source);
      } else {
        console.log('🔄 [EditProfile] Unknown RoleId:', roleId, '- skipping profile fetch');
      }
    } catch (error) {
      console.error('🔄 [EditProfile] Error fetching profile data from:', source, error);
    } finally {
      profileLoadingInProgressRef.current = false;
    }
  }, [dispatch, userData]);

  // Reset prevent auto-close when modal opens and fetch admin profile data
  useEffect(() => {
    try {
      setPreventAutoClose(false);
      
      // If modal is open and user is admin, ensure admin profile data is loaded
      if (showEditProfileModal && userData) {
        // Use the existing userData to get role information
        const roleId = userData.RoleId;
        
        console.log('🔍 [EditProfile] Modal opened, checking role:', roleId);
        
        if (roleId === 1 && !adminProfileInfo) {
          console.log('🔍 [EditProfile] Admin user but no profile data, fetching...');
          fetchAdminProfileData('modal-open');
        }
      }
    } catch (error) {
      console.error('🔍 [EditProfile] Error in modal open effect:', error);
    }
  }, [setPreventAutoClose, showEditProfileModal, adminProfileInfo, fetchAdminProfileData, userData]);

  // Centralized function to load cities with duplicate call prevention
  const loadCitiesForState = useCallback(async (stateId: string, source: string): Promise<unknown[]> => {
    if (cityLoadingInProgressRef.current) {
      console.log('🔄 [EditProfile] City loading already in progress, skipping request from:', source);
      return [];
    }

    if (!stateId) {
      console.log('🔄 [EditProfile] No stateId provided, skipping city load from:', source);
      setCities([]);
      setLoadingCities(false);
      return [];
    }

    console.log('🔄 [EditProfile] Loading cities for stateId:', stateId, 'from:', source);
    cityLoadingInProgressRef.current = true;
    setLoadingCities(true);

    // Add timeout to prevent stuck loading state
    const timeoutId = setTimeout(() => {
      console.log('🔄 [EditProfile] City loading timeout from:', source);
      setLoadingCities(false);
      cityLoadingInProgressRef.current = false;
    }, 10000); // 10 second timeout

    let fetchedCities: unknown[] = [];

    try {
      const result = await dispatch(getCities({ stateId: stateId }) as any);
      clearTimeout(timeoutId);

      console.log('🔄 [EditProfile] getCities result from:', source, result);
      if (result && result.data) {
        console.log('🔄 [EditProfile] Cities loaded from data:', result.data);
        fetchedCities = result.data as unknown[];
        setCities(result.data);
      } else if (result && result.Content) {
        console.log('🔄 [EditProfile] Cities loaded from Content:', result.Content);
        fetchedCities = result.Content as unknown[];
        setCities(result.Content);
      } else {
        console.log('🔄 [EditProfile] No cities data in result from:', source, result);
        setCities([]);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('🔄 [EditProfile] Error loading cities from:', source, error);
      setCities([]);
    } finally {
      console.log('🔄 [EditProfile] Setting loading states to false from:', source);
      setLoadingCities(false);
      cityLoadingInProgressRef.current = false;
    }

    return fetchedCities;
  }, [dispatch]);

  // Reset form values when adminProfileInfo or userData changes
  useEffect(() => {
    if (adminProfileInfo || userData) {
      const currentFirstName = adminProfileInfo?.FirstName || userData?.FirstName || '';
      const currentLastName = adminProfileInfo?.LastName || userData?.LastName || '';
      const currentEmail = adminProfileInfo?.Email || userData?.Email || '';
      const currentMobile = adminProfileInfo?.MobileNumber || userData?.MobileNumber || '';
      const currentBusinessName = adminProfileInfo?.BusinessName || userData?.BusinessName || '';
      const currentState = adminProfileInfo?.State || userData?.State || '';
      const currentCountry = adminProfileInfo?.Country || userData?.Country || '';
      const currentCity = adminProfileInfo?.CityName || userData?.CityName || '';
      const currentCityId = adminProfileInfo?.CityId || userData?.CityId || '';
      const currentStateId = adminProfileInfo?.StateId || userData?.StateId || '';
      const currentCountryId = adminProfileInfo?.CountryId || userData?.CountryId || process.env.NEXT_PUBLIC_COUNTRY_ID || 'Vm5nelJTRnRJMWt5UW5SZVVIZEFVbWRHTjJSVmVsRlFZa1VqVGlFM2RsNU1aaW81WjFSRG1PRW5LQmZ4QmVmRExTbUhYRnpRVWVzWHpLaGN2MzJEVytBNE1wYmkyeE16Kys3RWhVSlFUU3kvU2FhbGlnZmQ';
      const currentCountryIso = userData?.CountryIso || 'IN';

      console.log('🔄 [EditProfile] Resetting form with data:', {
        currentFirstName,
        currentLastName,
        currentEmail,
        currentMobile,
        currentBusinessName,
        currentState,
        currentCountry,
        currentCity,
        currentCityId,
        currentStateId,
        adminProfileInfo,
        userData
      });

      form.reset({
        firstName: currentFirstName,
        lastName: currentLastName,
        email: currentEmail,
        mobile: currentMobile,
        businessName: currentBusinessName,
        state: currentState,
        country: currentCountry,
        countryId: currentCountryId,
        countryIso: currentCountryIso,
        city: currentCity,
        cityId: currentCityId,
        stateId: currentStateId,
      });

      // Load cities for the current state if stateId is available
      loadCitiesForState(currentStateId, 'data-change');
    }
  }, [adminProfileInfo, userData, form, loadCitiesForState]);

  // Reset form when modal opens to ensure latest data is shown
  useEffect(() => {
    if (showEditProfileModal) {
      console.log('🔄 [EditProfile] Modal opened, resetting form with latest data');
      
      // Fetch latest profile data if not available
      fetchAdminProfileData('modal-open');
      
      // Get the latest data from Redux state
      const latestAdminProfileInfo = adminProfileInfo;
      const latestUserData = userData;
      
      const currentFirstName = latestAdminProfileInfo?.FirstName || latestUserData?.FirstName || '';
      const currentLastName = latestAdminProfileInfo?.LastName || latestUserData?.LastName || '';
      const currentEmail = latestAdminProfileInfo?.Email || latestUserData?.Email || '';
      const currentMobile = latestAdminProfileInfo?.MobileNumber || latestUserData?.MobileNumber || '';
      const currentBusinessName = latestAdminProfileInfo?.BusinessName || latestUserData?.BusinessName || '';
      const currentState = latestAdminProfileInfo?.State || latestUserData?.State || '';
      const currentCountry = latestAdminProfileInfo?.Country || latestUserData?.Country || '';
      const currentCity = latestAdminProfileInfo?.CityName || latestUserData?.CityName || '';
      const currentCityId = latestAdminProfileInfo?.CityId || latestUserData?.CityId || '';
      const currentStateId = latestAdminProfileInfo?.StateId || latestUserData?.StateId || '';
      const currentCountryId = latestAdminProfileInfo?.CountryId || latestUserData?.CountryId || process.env.NEXT_PUBLIC_COUNTRY_ID || 'Vm5nelJTRnRJMWt5UW5SZVVIZEFVbWRHTjJSVmVsRlFZa1VqVGlFM2RsNU1aaW81WjFSRG1PRW5LQmZ4QmVmRExTbUhYRnpRVWVzWHpLaGN2MzJEVytBNE1wYmkyeE16Kys3RWhVSlFUU3kvU2FhbGlnZmQ';
      const currentCountryIso = latestUserData?.CountryIso || 'IN';

    

      form.reset({
        firstName: currentFirstName,
        lastName: currentLastName,
        email: currentEmail,
        mobile: currentMobile,
        businessName: currentBusinessName,
        state: currentState,
        country: currentCountry,
        countryId: currentCountryId,
        countryIso: currentCountryIso,
        city: currentCity,
        cityId: currentCityId,
        stateId: currentStateId,
      });

      // Load cities for the current state if stateId is available
      loadCitiesForState(currentStateId, 'modal-open');
    }
  }, [showEditProfileModal, adminProfileInfo, userData, form, fetchAdminProfileData, loadCitiesForState]);

  // Load states on component mount and set current values
  useEffect(() => {
    const loadStates = async () => {
      setLoadingStates(true);
      try {
        const result = await dispatch(getStates({ countryId: countryId }) as any);
        const resultData = result as { data?: unknown[]; Content?: unknown[] };
        const currentStates = (resultData?.data || resultData?.Content || []) as unknown[];

        if (resultData && resultData.data) {
          setStates(resultData.data as unknown[]);
        } else if (resultData && resultData.Content) {
          setStates(resultData.Content as unknown[]);
        }

        // After loading states, find matching state ID and load cities
        if (userData?.State) {
          const matchingState = currentStates.find((s: unknown) => {
            const stateObj = s as { name?: string; StateName?: string; Name?: string };
            const stateName = stateObj.name || stateObj.StateName || stateObj.Name;
            return stateName === userData.State;
          });

          if (matchingState) {
            const stateObj = matchingState as { id?: string; Id?: string };
            const stateId = stateObj.id || stateObj.Id || '';
            form.setValue('stateId', stateId);

            // Load cities for this state and use the response to match the existing city
            console.log('🔄 [EditProfile] Loading cities for state:', stateId);
            const fetchedCities = await loadCitiesForState(stateId, 'state-selection');

            if (userData.CityName && Array.isArray(fetchedCities)) {
              const matchingCity = fetchedCities.find((c: unknown) => {
                const cityObj = c as { name?: string; CityName?: string; Name?: string };
                const cityName = cityObj.name || cityObj.CityName || cityObj.Name;
                return cityName === userData.CityName;
              });

              if (matchingCity) {
                const cityObj = matchingCity as {
                  id?: string;
                  Id?: string;
                  name?: string;
                  CityName?: string;
                  Name?: string;
                };
                const cityId = cityObj.id || cityObj.Id || '';
                const cityName = cityObj.name || cityObj.CityName || cityObj.Name || userData.CityName;
                form.setValue('cityId', cityId);
                form.setValue('city', cityName);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading states:', error);
      } finally {
        setLoadingStates(false);
        setLoadingCities(false);
      }
    };
    loadStates();
  }, [dispatch, countryId, form, userData?.State, userData?.CityName, userData?.CityId, loadCitiesForState]);

  // Load cities when state changes
  const handleStateChange = async (stateId: string, stateName: string) => {
    form.setValue('stateId', stateId);
    form.setValue('state', stateName);
    form.setValue('city', '');
    form.setValue('cityId', '');
    setCities([]);

    if (stateId) {
      console.log('🔄 [EditProfile] State changed, loading cities for:', stateId);
      await loadCitiesForState(stateId, 'state-change');
    }
  };

  useEffect(() => {
    try {
      if (userData || adminProfileInfo) {
        // Prioritize admin profile data for admin users
        const profileData = adminProfileInfo || userData;
        
        console.log('🔍 [EditProfile] Resetting form with profile data:', {
          profileData,
          isAdmin: !!adminProfileInfo,
          businessName: profileData?.BusinessName,
          state: profileData?.State,
          city: profileData?.CityName
        });
        
        form.reset({
          firstName: profileData?.FirstName || '',
          lastName: profileData?.LastName || '',
          email: profileData?.Email || '',
          mobile: profileData?.MobileNumber || '',
          businessName: profileData?.BusinessName || '',
          state: profileData?.State || '',
          country: profileData?.Country || '',
          countryId: profileData?.CountryId || process.env.NEXT_PUBLIC_COUNTRY_ID || 'Vm5nelJTRnRJMWt5UW5SZVVIZEFVbWRHTjJSVmVsRlFZa1VqVGlFM2RsNU1aaW81WjFSRG1PRW5LQmZ4QmVmRExTbUhYRnpRVWVzWHpLaGN2MzJEVytBNE1wYmkyeE16Kys3RWhVSlFUU3kvU2FhbGlnZmQ',
          countryIso: (profileData as any)?.CountryIso || 'IN',
          city: profileData?.CityName || '',
          cityId: profileData?.CityId || '',
          stateId: profileData?.StateId || '',
        });
      }
    } catch (error) {
      console.error('🔍 [EditProfile] Error resetting form:', error);
    }
  }, [userData, adminProfileInfo, form]);

  async function onSubmit(data: EditProfileFormValues) {
    console.log('🔄 [Edit Profile] Form submitted with data:', data);
    setIsUpdating(true);
    try {
      // Use the actual IDs from userData if form doesn't have them
      const finalStateId = data.stateId || userData?.StateId || '';
      const finalCityId = data.cityId || userData?.CityId || '';
      const finalState = data.state || userData?.State || '';
      const finalCity = data.city || userData?.CityName || '';
      
      console.log('🔄 [Edit Profile] Final IDs:', {
        finalStateId,
        finalCityId,
        finalState,
        finalCity
      });
      
      const payload = {
        FirstName: data.firstName || '',
        LastName: data.lastName || '',
        Email: data.email || '',
        MobileNumber: data.mobile || '',
        MobileNumberCc: '91',
        MobileNumberCcId: process.env.NEXT_PUBLIC_MOBILE_COUNTRY_ID || 'Vm5nelJTRnRJMWt5UW5SZVVIZEFVbWRHTjJSVmVsRlFZa1VqVGlFM2RsNU1aaW81WjFSRG1PRW5LQmZ4QmVmRExTbUhYRnpRVWVzWHpLaGN2MzJEVytBNE1wYmkyeE16Kys3RWhVSlFUU3kvU2FhbGlnZmQ',
        Country: data.country || '',
        CountryId: data.countryId || process.env.NEXT_PUBLIC_COUNTRY_ID || 'Vm5nelJTRnRJMWt5UW5SZVVIZEFVbWRHTjJSVmVsRlFZa1VqVGlFM2RsNU1aaW81WjFSRG1PRW5LQmZ4QmVmRExTbUhYRnpRVWVzWHpLaGN2MzJEVytBNE1wYmkyeE16Kys3RWhVSlFUU3kvU2FhbGlnZmQ',
        CountryIso: data.countryIso || 'IN',
        // Add missing required fields
        rMobileNumberCcId: 0,
        rCountryId: 0,
        BusinessName: data.businessName || '',
        CityId: finalCityId,
        CityName: finalCity,
        StateId: finalStateId,
        State: finalState,
        rStateId: 0,
        rCityId: 0
      };
      
      console.log('🔄 [Edit Profile] Calling updateProfile with payload:', payload);
      
      // Use admin updateProfile if user is admin, otherwise use regular updateProfile
      const isAdmin = adminProfileInfo || userData?.RoleId === 1;
      const updateFunction = isAdmin ? updateAdminProfile : updateProfile;
      
      console.log('🔄 [Edit Profile] Using update function for:', isAdmin ? 'Admin' : 'Regular User');
      const result = await (updateFunction(payload) as any)(dispatch, store.getState);
      console.log('🔄 [Edit Profile] Update result:', result);

      if (result && !result.error) {
        showSuccess('Profile updated successfully!');
        
        // Prevent auto-closing of the modal
        setPreventAutoClose(true);
        
        // Update the form with the new data immediately
        form.reset({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          mobile: data.mobile,
          businessName: data.businessName,
          state: data.state,
          country: data.country,
          countryId: data.countryId,
          countryIso: data.countryIso,
          city: data.city,
          cityId: data.cityId,
          stateId: data.stateId,
        });
        
        // Refresh profile data immediately after successful update
        try {
          if (isAdmin) {
            // For admin users, fetch fresh admin profile data
            await dispatch(getAdminProfileInfo() as any);
          } else {
            // For regular users, fetch fresh profile data
            await dispatch(getProfileInfo() as any);
          }
          
          // Force a small delay to ensure state is updated before closing modal
          setTimeout(() => {
            setPreventAutoClose(false);
            onClose();
          }, 500);
        } catch (error) {
          console.error('Error refreshing profile data:', error);
          // Still close modal even if refresh fails
          setPreventAutoClose(false);
          onClose();
        }
      } else if (result && result.error) {
        showError(result.error);
      } else if (result && result.HttpResponse && result.HttpResponse.Message) {
        showError(result.HttpResponse.Message);
      } else {
        showError('Profile update failed. Please try again.');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      showError('An unexpected error occurred. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-[#fcfcfd]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input {...field} className="h-[52px] rounded-md" placeholder="Enter your first name" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input {...field} className="h-[52px] rounded-md" placeholder="Enter your last name" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mobile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile Number <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input {...field} className="h-[52px] rounded-md" placeholder="Enter your mobile number" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email </FormLabel>
                <FormControl>
                  <Input {...field} className="h-[52px] rounded-md"  placeholder="Enter your email" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Name </FormLabel>
                <FormControl>
                  <Input {...field} className="h-[52px] rounded-md" placeholder="Enter your business name" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={() => (
              <FormItem>
                <FormLabel>State <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Select
                    value={form.watch('stateId') || ''}
                    onValueChange={(value) => {
                      const selectedState = states.find((s: unknown) => {
                        const stateObj = s as { id?: string; Id?: string };
                        return stateObj.id === value || stateObj.Id === value;
                      });
                      if (selectedState) {
                        const stateObj = selectedState as { id?: string; Id?: string; name?: string; StateName?: string; Name?: string };
                        const stateId = stateObj.id || stateObj.Id || '';
                        const stateName = stateObj.name || stateObj.StateName || stateObj.Name || '';
                        handleStateChange(stateId, stateName);
                      }
                    }}
                    disabled={loadingStates}
                  >
                    <SelectTrigger className="h-[52px] rounded-md">
                      <SelectValue placeholder={loadingStates ? "Loading states..." : "Select state"} />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state: unknown) => {
                        const stateObj = state as { id?: string; Id?: string; name?: string; StateName?: string; Name?: string };
                        const stateId = stateObj.id || stateObj.Id || '';
                        const stateName = stateObj.name || stateObj.StateName || stateObj.Name || '';
                        return (
                          <SelectItem key={stateId} value={stateId}>
                            {stateName}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={() => (
              <FormItem>
                <FormLabel>City <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Select
                    value={form.watch('cityId') || ''}
                    onValueChange={(value) => {
                      const selectedCity = cities.find((c: unknown) => {
                        const cityObj = c as { id?: string; Id?: string };
                        return cityObj.id === value || cityObj.Id === value;
                      });
                      if (selectedCity) {
                        const cityObj = selectedCity as { id?: string; Id?: string; name?: string; CityName?: string; Name?: string };
                        const cityId = cityObj.id || cityObj.Id || '';
                        const cityName = cityObj.name || cityObj.CityName || cityObj.Name || '';
                        form.setValue('cityId', cityId);
                        form.setValue('city', cityName);
                      }
                    }}
                    disabled={loadingCities || !form.watch('stateId')}
                  >
                    <SelectTrigger className="h-[52px] rounded-md">
                      <div className="flex items-center justify-between w-full">
                        <SelectValue placeholder={
                          !form.watch('stateId') 
                            ? "Select state first" 
                            : loadingCities 
                              ? "Loading cities..." 
                              : "Select city"
                        } />
                        {loadingCities && (
                          <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
                        )}
                      </div>
                    </SelectTrigger>
                  
                    <SelectContent>
                      {cities.map((city: unknown) => {
                        const cityObj = city as { id?: string; Id?: string; name?: string; CityName?: string; Name?: string };
                        const cityId = cityObj.id || cityObj.Id || '';
                        const cityName = cityObj.name || cityObj.CityName || cityObj.Name || '';
                        return (
                          <SelectItem key={cityId} value={cityId}>
                            {cityName}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input {...field} className="h-[52px] rounded-md" placeholder="Enter your country" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 py-4 px-6">
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              setPreventAutoClose(false);
              onClose();
            }}
            className="bg-gray-50 hover:bg-gray-100 px-5 py-2 h-10 rounded-lg"
          >
            Close
          </Button>
          <Button
            type="submit"
            disabled={isUpdating}
            className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2 h-10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Update
          </Button>
        </div>
      </form>
    </Form>
  );
}

function ChangePasswordForm({ onClose }: { onClose: () => void }) {
  const dispatch = useDispatch();
  const authError = useSelector((state: unknown) => (state as { authState: { error?: string } }).authState.error);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (authError) {
      showError(authError);
    }
  }, [authError]);

  async function onSubmit(data: ChangePasswordFormValues) {
    console.log('🔄 [ChangePassword] Form submitted with data:', data);
    setSubmitting(true);
    try {
      console.log('🔄 [ChangePassword] Calling adminProfileChangePassword...');
      const result = await (adminProfileChangePassword({
        CurrentPassword: data.currentPassword,
        NewPassword: data.newPassword,
      }) as any)(dispatch, store.getState);
      console.log('🔄 [ChangePassword] API result:', result);
      
      // Only close modal if successful
      if (!result?.error) {
        showSuccess('Password changed successfully');
        onClose();
      } else {
        console.log('🔄 [ChangePassword] API returned error:', result.error);
        showError(result.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('🔄 [ChangePassword] Error:', error);
      showError('An unexpected error occurred while changing password');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
        console.log('🔄 [ChangePassword] Form validation errors:', errors);
      })} className="bg-[#fcfcfd]">
        <div className="p-6 space-y-6">
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <div className='relative'>
                <FormItem>
                  <FormLabel>Current Password <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="currentPassword"
                      type={currentPasswordVisible ? 'text' : 'password'}
                      className="h-12 w-full pr-12 rounded-md"
                      placeholder="Enter current password"
                    />
                  </FormControl>
                  {form.formState.errors.currentPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.currentPassword.message}
                    </p>
                  )}
                </FormItem>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                  onClick={() => setCurrentPasswordVisible(!currentPasswordVisible)}
                >
                  {currentPasswordVisible ? (
                    <EyeOff className="h-5 w-5" style={{marginTop: '24px'}}/>
                  ) : (
                    <Eye className="h-5 w-5" style={{marginTop: '24px'}}/>
                  )}
                </Button>
              </div>
            )}
          />

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <div className='relative'>
                <FormItem>
                  <FormLabel>New Password <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="newPassword"
                      type={newPasswordVisible ? 'text' : 'password'}
                      className="h-12 w-full pr-12 rounded-md"
                      placeholder="Enter new password"
                    />
                  </FormControl>
                  {form.formState.errors.newPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.newPassword.message}
                    </p>
                  )}
                </FormItem>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                  onClick={() => setNewPasswordVisible(!newPasswordVisible)}
                >
                  {newPasswordVisible ? (
                    <EyeOff className="h-5 w-5" style={{marginTop: '24px'}}/>
                  ) : (
                    <Eye className="h-5 w-5" style={{marginTop: '24px'}}/>
                  )}
                </Button>
              </div>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <div className='relative'>
                <FormItem>
                  <FormLabel>Confirm New Password <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="confirmPassword"
                      type={confirmPasswordVisible ? 'text' : 'password'}
                      className="h-12 w-full pr-12 rounded-md"
                      placeholder="Re-enter new password"
                    />
                  </FormControl>
                  {form.formState.errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </FormItem>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                  onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                >
                  {confirmPasswordVisible ? (
                    <EyeOff className="h-5 w-5" style={{marginTop: '24px'}}/>
                  ) : (
                    <Eye className="h-5 w-5" style={{marginTop: '24px'}}/>
                  )}
                </Button>
              </div>
            )}
          />
        </div>
        {authError && (
          <div className="text-red-500 text-xs text-center mt-2">{authError}</div>
        )}
        <div className="flex justify-end gap-3 border-t border-gray-200 py-4 px-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="bg-gray-50 hover:bg-gray-100 px-5 py-2 h-10 rounded-lg"
            disabled={submitting}
          >
            Close
          </Button>
          <Button
            type="submit"
            className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2 h-10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            Change
          </Button>
        </div>
      </form>
    </Form>
  );
}

export function UserDropdownMenu({ trigger }: { trigger: ReactNode }) {
  const authState = useAppSelector((state: unknown) => (state as { authState: {
    isAuthenticated: any; content?: unknown; sessionInfo?: unknown; profileInfo?: unknown; loading?: boolean; error?: string 
} }).authState);
  const adminState = useAppSelector((state: unknown) => (state as { adminState: { profileInfo?: AdminProfileInfo | null } }).adminState);
  const { content, sessionInfo, profileInfo } = authState || {};
  const { profileInfo: adminProfileInfo } = adminState || {};
  
  // Theme context with fallback
  let isDarkMode = false;
  let toggleTheme = () => {};
  
  try {
    const themeContext = useTheme();
    isDarkMode = themeContext.isDarkMode;
    toggleTheme = themeContext.toggleTheme;
  } catch {
    // ThemeProvider not available, use fallback
    console.warn('ThemeProvider not available, using fallback theme state');
  }
  const dispatch = useDispatch();
  const router = useRouter();
  const [openProfile, setOpenProfile] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);
  const [preventAutoClose, setPreventAutoClose] = useState(false);
  const [mainDropdownProfileLoading, setMainDropdownProfileLoading] = useState(false);
  const [profileUpdateKey] = useState(0);
  
  // Reset prevent auto-close when edit profile modal opens
  useEffect(() => {
    if (showEditProfileModal) {
      setPreventAutoClose(false);
    }
  }, [showEditProfileModal]);
  
  // Loading states for full-page loaders
  // const [isUpdating, setIsUpdating] = useState(false);
  // const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Use admin profile info if available, otherwise fall back to regular profile data
  const userData = (adminProfileInfo || profileInfo || sessionInfo || content) as {
    MobileNumberCc: string;
    FirstName?: string;
    LastName?: string;
    Email?: string;
    MobileNumber?: string;
    BusinessName?: string;
    State?: string;
    Country?: string;
    CountryId?: string;
    CountryIso?: string;
    CityName?: string;
    CityId?: string;
    StateId?: string;
    RoleId?: number;
  };

  
  // Function to fetch user data
  const fetchUserData = async () => {
    if (mainDropdownProfileLoading) {
  
      return;
    }

    try {
 
      setMainDropdownProfileLoading(true);
      
      // Check if we already have session info and profile data
      const currentAuthState = authState;
      const currentAdminState = adminState;
      
   
      
      // Only fetch profile if not available
      if (!currentAdminState?.profileInfo && !currentAuthState?.profileInfo) {
        // Check user role from session info to call appropriate profile API
        const sessionInfo = currentAuthState?.sessionInfo as { RoleId?: number } | null;
        const roleId = sessionInfo?.RoleId;
      
        
        if (roleId === 1) {
          // Admin user - fetch admin profile info
          await dispatch(getAdminProfileInfo() as any);
        } else if (roleId === 2) {
          // Regular user - fetch regular profile info
          await dispatch(getProfileInfo() as any);
        } else {
          console.log('🔍 [UserDropdown] Unknown role ID:', roleId);
        }
      }
      
     
    } catch (error) {
      console.error('🔍 [UserDropdown] Error fetching user data:', error);
    } finally {
      setMainDropdownProfileLoading(false);
    }
  };

  // Debounced version of fetchUserData
  const debouncedFetchUserData = debounce(fetchUserData, 500);

  // Fetch data when component mounts
  useEffect(() => {
    debouncedFetchUserData();
  }, [dispatch, debouncedFetchUserData]);

  // Always show the dropdown, even if user data is not loaded yet



  

  return (
    <>
      <DropdownMenu onOpenChange={(open) => {
        if (open) {
          // Always fetch fresh user data when dropdown opens
          fetchUserData();
        }
      }}>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent>
          <div>
            {/* Error display */}
            {/* {error && (
              <div style={{ padding: '0.5rem', backgroundColor: '#fef2f2', borderBottom: '1px solid #fecaca', color: '#dc2626', fontSize: '0.875rem' }}>
                Error: {error}
              </div>
            )} */}
            
            {/* User info block at the top of the dropdown */}
            {userData && (userData.FirstName || userData.LastName) ? (
              <div key={profileUpdateKey} className='uppercase' style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
                {userData.FirstName || ''} {userData.LastName || ''}
              </div>
            ) : (
              <div key={profileUpdateKey} style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>No user data</div>
            )}
         
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer"
              onSelect={() => setOpenProfile(true)}
            >
              <User />
              My Profile
            </DropdownMenuItem>
            
            {/* Theme Toggle */}
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer"
              onSelect={(e) => {
                e.preventDefault();
                toggleTheme();
              }}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </DropdownMenuItem>
           {/* Footer */}
       
            <div className="p-2 mt-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  dispatch(logout());
                  router.push('/Home');
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* ...modals and dialogs... */}
      <Modal open={openProfile} onOpenChange={(open) => {
        setOpenProfile(open);
        // Refresh profile data when modal opens
        if (open) {
          fetchUserData();
        }
      }}>
        <ModalContent 
          className="w-full sm:max-w-2xl p-0 overflow-y-auto max-h-[90vh]"
          onPointerDownOutside={(e) => {
            e.preventDefault();
          }}
        >
          <ModalHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
            <ModalTitle>My Profile</ModalTitle>
          </ModalHeader>
          <div className="border-b border-gray-200 w-full" />
          <div key={profileUpdateKey} className="flex flex-col items-center px-4 py-6 sm:p-8 bg-[#fcfcfd] w-full">
            {/* Avatar */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center text-3xl font-semibold text-violet-600">
                {userData?.FirstName && userData.FirstName.length > 0 ? userData.FirstName.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
            {/* Name */}
            <div className="mt-4 text-lg font-semibold text-gray-900 text-center tracking-wide">
              {userData?.FirstName} {userData?.LastName ? userData.LastName.charAt(0).toUpperCase() + userData.LastName.slice(1) : ''}
            </div>

            {/* Info Cards */}
            <div key={`info-cards-${profileUpdateKey}`} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 w-full">
              {[
                { label: 'Email', value: userData?.Email || 'N/A' },
                {
                  label: 'Mobile Number',
                  value: (userData?.MobileNumberCc && userData?.MobileNumber
                    ? `+${userData.MobileNumberCc} ${userData.MobileNumber}`
                    : userData?.MobileNumber) || 'N/A'
                },
                { label: 'Business Name', value: userData?.BusinessName || 'N/A' },
                { label: 'City', value: userData?.CityName || 'N/A' },
                { label: 'State', value: userData?.State || 'N/A' },
                { label: 'Country', value: userData?.Country || 'N/A' },
               
              ].map((item) => (
                <div
                  key={item.label}
                  className="border border-dashed border-gray-200 rounded-lg p-2 bg-white w-full"
                >
                  <div className="text-xs text-gray-400 mb-1">{item.label}</div>
                  <div className="text-sm font-medium text-gray-700 break-words">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Bottom Bar */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-gray-200 p-4 w-full">
            <Button
              variant="outline"
              onClick={() => setOpenProfile(false)}
              className="bg-white text-gray-700 font-medium h-10 rounded-lg border-gray-200 w-full sm:w-auto"
            >
              Close
            </Button>
            <DropdownMenu open={isActionsDropdownOpen} onOpenChange={setIsActionsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button 
                  className="bg-violet-700 hover:bg-violet-700 text-white font-medium h-10 rounded-lg w-full sm:w-auto"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  Actions
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-full sm:w-48 max-w-full"
                onPointerDownOutside={(e) => e.preventDefault()}
              >
                <DropdownMenuItem onSelect={() => setShowEditProfileModal(true)}>
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setShowChangePasswordModal(true)}>
                  Change Password
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </ModalContent>
      </Modal>


      {/* Edit Profile Dialog */}
      
      {showEditProfileModal && (
        <Dialog open={showEditProfileModal} onOpenChange={(open) => {
          if (!open && preventAutoClose) {
            // Don't close if we're preventing auto-close
            return;
          }
          setShowEditProfileModal(open);
        }}>
          <DialogContent  onPointerDownOutside={(e) => {
            e.preventDefault();
          }} className=" w-2xl  px-4 sm:max-w-2xl p-4 overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="border-b border-gray-200 w-full" />
            <EditProfileForm 
              onClose={() => setShowEditProfileModal(false)} 
              preventAutoClose={preventAutoClose}
              setPreventAutoClose={setPreventAutoClose}
              showEditProfileModal={showEditProfileModal}
            />
          </DialogContent>
        </Dialog>
      )}
      {/* Change Password Dialog */}
      {showChangePasswordModal && (
        <Dialog open={showChangePasswordModal} onOpenChange={setShowChangePasswordModal}>
          <DialogContent  onPointerDownOutside={(e) => {
            e.preventDefault();
          }} className="w-full px-4 sm:max-w-md p-4 overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
            </DialogHeader>
            <ChangePasswordForm onClose={() => setShowChangePasswordModal(false)} />
          </DialogContent>
        </Dialog>
      )}

    </>
  );
}
