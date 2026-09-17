import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "../services/api";

const DEFAULT_BRAND = "VaultSend";

const BrandContext = createContext<string>(DEFAULT_BRAND);

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brandName, setBrandName] = useState(DEFAULT_BRAND);

  useEffect(() => {
    api
      .get("/config")
      .then((res) => {
        const name = res.data?.brand_name;
        if (name) {
          setBrandName(name);
          document.title = name;
        }
      })
      .catch(() => {
        // API'ye erişilemezse varsayılan marka adıyla devam edilir
      });
  }, []);

  return <BrandContext.Provider value={brandName}>{children}</BrandContext.Provider>;
}

export function useBrand(): string {
  return useContext(BrandContext);
}
