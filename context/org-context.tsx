"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface OrgContextType {
    orgId: string | null;
    setOrgId: (id: string | null) => void;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

export function OrgProvider({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const [orgId, setOrgId] = useState<string | null>(null);

    useEffect(() => {
        setOrgId((params.orgId as string | undefined) ?? null);
    }, [params.orgId]);

    return (
        <OrgContext.Provider value={{ orgId, setOrgId }}>
            {children}
        </OrgContext.Provider>
    );
}

export function useOrg() {
    const context = useContext(OrgContext);

    if (!context) {
        throw new Error("useOrg must be used within an OrgProvider");
    }

    return context;
}
