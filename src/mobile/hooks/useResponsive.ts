import { useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface ResponsiveInfo {
  width: number;
  height: number;
  deviceType: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWeb: boolean;
}

const getDeviceType = (width: number): DeviceType => {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// SSR セーフな初期値
const getInitialDimensions = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return { width: window.innerWidth, height: window.innerHeight };
  }
  try {
    const { width, height } = Dimensions.get('window');
    return { width: width || 375, height: height || 667 };
  } catch {
    return { width: 375, height: 667 };
  }
};

export function useResponsive(): ResponsiveInfo {
  const [dimensions, setDimensions] = useState({ width: 375, height: 667 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDimensions(getInitialDimensions());

    const handleResize = () => {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        setDimensions({ width: window.innerWidth, height: window.innerHeight });
      }
    };

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }

    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });

    return () => subscription?.remove();
  }, []);

  const deviceType = getDeviceType(dimensions.width);

  return {
    width: dimensions.width,
    height: dimensions.height,
    deviceType,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    isWeb: Platform.OS === 'web',
  };
}

// レスポンシブなスタイル値を返す
export function useResponsiveValue<T>(values: {
  mobile: T;
  tablet?: T;
  desktop?: T;
}): T {
  const { deviceType } = useResponsive();

  if (deviceType === 'desktop' && values.desktop !== undefined) {
    return values.desktop;
  }
  if (deviceType === 'tablet' && values.tablet !== undefined) {
    return values.tablet;
  }
  return values.mobile;
}
