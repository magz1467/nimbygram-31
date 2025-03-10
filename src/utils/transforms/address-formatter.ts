
/**
 * Constructs a readable address from application data
 * @param app Application data object
 * @returns Formatted address string
 */
export const formatAddress = (app: any): string => {
  let address = 'Address unavailable';
  
  if (app.street_name || app.site_name || app.locality || app.postcode) {
    address = [
      app.site_name, 
      app.street_name, 
      app.locality, 
      app.postcode
    ].filter(Boolean).join(', ');
  } else if (app.address) {
    // Use direct address field if available
    address = app.address;
  }
  
  return address;
};
