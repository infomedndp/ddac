import { useCompany } from '../../../../context/CompanyContext';

export function useZealCheck() {
  const { companyData, updateCompanyData } = useCompany();

  const saveZealData = async (data: any) => {
    await updateCompanyData({
      tools: {
        ...companyData?.tools,
        zealCheck: {
          ...companyData?.tools?.zealCheck,
          ...data
        }
      }
    });
  };

  return {
    zealData: companyData?.tools?.zealCheck || {},
    saveZealData
  };
} 