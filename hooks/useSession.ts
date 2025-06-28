import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '@/providers/authProvider'; 

export function useSession() {

  const { isAuthenticated, isLoading } = useAuth();
  
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {

    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isAppRoot = segments.length === 0;

    if (isAuthenticated) {
      if (inAuthGroup || isAppRoot) {
        router.replace('/tabs');
      }
    } else {
      if (!inAuthGroup) {
        router.replace('/auth/login');
      }
    }
  }, [isAuthenticated, isLoading, segments, router]);
}