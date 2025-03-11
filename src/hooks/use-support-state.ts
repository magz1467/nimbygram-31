
export const useSupportState = (applicationId: number, user: any) => {
  // For now, we'll just return placeholder values since we're not 
  // using the application_support table anymore
  return {
    supportCount: 0,
    isSupportedByUser: false,
    isLoading: false,
    tableExists: false
  };
};
