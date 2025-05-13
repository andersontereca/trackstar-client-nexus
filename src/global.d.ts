
interface Window {
  XLSX: {
    read: (data: any, options?: any) => any;
    utils: {
      sheet_to_json: (worksheet: any, options?: any) => any[];
    };
  };
}
