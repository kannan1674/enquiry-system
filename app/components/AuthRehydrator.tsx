'use client';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { rehydrateAuth } from '@/lib/store/features/authSlice';
import { getAdminProfileInfo } from '@/lib/Actions/adminActions';
import { getProfileInfo, getSessionInfo } from '@/lib/Actions/authActions';
import { useSessionExpiry } from '@/hooks/useSessionExpiry';

export default function AuthRehydrator() {
  const dispatch = useDispatch();
  const authState = useSelector((state: any) => state.authState);
  const adminState = useSelector((state: any) => state.adminState);
  const hasInitialized = useRef(false);
  const retryCount = useRef(0);
  const maxRetries = 3;

  // Ensure session expiry monitoring runs globally for authenticated users
  useSessionExpiry();
  
  // Separate effect for initial rehydration - runs only once
  useEffect(() => {
    if (!hasInitialized.current) {
    
      dispatch(rehydrateAuth());
      hasInitialized.current = true;
    }
  }, [dispatch]);
  
  // Separate effect for fetching data based on auth state changes
  useEffect(() => {
    // Only run if we've initialized and have auth state
    if (!hasInitialized.current) return;
    
    const fetchDataIfNeeded = async () => {
      try {
        // Check if we already have session info and profile data
        if (authState?.sessionInfo && (adminState?.profileInfo || authState?.profileInfo)) {
         
          return;
        }
        
        // Only fetch session info if not available and user appears to be authenticated
        if (!authState?.sessionInfo && authState?.isAuthenticated) {
          
          
          // Add a delay to ensure cookies are properly set after login
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const result = await dispatch(getSessionInfo() as any);
          
          // Check if session info fetch failed
          if (result && result.error) {
            
            
            // If it's a 401 error, retry with exponential backoff
            if ((result.error.includes('Authorization token required') || result.error.includes('invalid')) && retryCount.current < maxRetries) {
              retryCount.current++;
              const delay = Math.pow(2, retryCount.current) * 1000; // 2s, 4s, 8s
             
              setTimeout(() => {
                dispatch(getSessionInfo() as any);
              }, delay);
            } else if (retryCount.current >= maxRetries) {
            
            }
          } else {
            // Success, reset retry count
            retryCount.current = 0;
          }
        } else if (!authState?.isAuthenticated) {
         
        }
        
      } catch (error) {
        console.error('AuthRehydrator session fetch error:', error);
      }
    };
    
    fetchDataIfNeeded();
  }, [dispatch, authState?.isAuthenticated]); // Only depend on isAuthenticated, not sessionInfo
  
  // Separate effect for fetching profile data when session info becomes available
  useEffect(() => {
    // Only run if we have session info but no profile data
    if (!authState?.sessionInfo || (adminState?.profileInfo || authState?.profileInfo)) {
      return;
    }
    
    const fetchProfileData = async () => {
      try {
        const sessionInfo = authState.sessionInfo as { RoleId?: number } | null;
        const roleId = sessionInfo?.RoleId;
        
       
        
        if (roleId === 1) {
          // Admin user - fetch admin profile info
          await dispatch(getAdminProfileInfo() as any);
        } else if (roleId === 2) {
          // Regular user - fetch regular profile info
          await dispatch(getProfileInfo() as any);
        }
      } catch (error) {
        console.error('AuthRehydrator profile fetch error:', error);
      }
    };
    
    fetchProfileData();
  }, [dispatch, authState?.sessionInfo]); // Only depend on sessionInfo

  return null;
} 