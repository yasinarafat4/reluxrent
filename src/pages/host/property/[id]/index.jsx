import HostingLayout from '@/components/layout/host/HostingLayout';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Sidebar from './Sidebar';

const Property = () => {
  const router = useRouter();
  const { id, tab } = router.query;
  console.log('aaa',router.query);

  useEffect(() => {
    // Function to check screen width
    const checkScreenSize = () => {
      const isDesktop = window.innerWidth > 768;
      if (isDesktop) {
        router.replace(`/host/property/${id}/edit/property-type?tab=space`);
      } else {
        router.replace(`/host/property/${id}?tab=${tab}`);
      }
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <HostingLayout>
      <Sidebar id={id} />
    </HostingLayout>
  );
};

export default Property;
