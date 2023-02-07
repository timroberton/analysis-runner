import { MutableRefObject } from "react";
import { AnalysisStatus, LogCode } from "./types";
type AnalysisProviderProps = {
    children: React.ReactNode;
};
export default function AnalysisProvider(p: AnalysisProviderProps): JSX.Element;
export declare const useAnalysis: () => {
    analysisStatus: AnalysisStatus;
    analyze: (url: string) => void;
    stop: () => void;
    logAsStaticArrayRef: MutableRefObject<{
        text: string;
        code: LogCode;
    }[]>;
    logCount: number;
    serverIP: string;
    updateServerIP: (ip: string) => void;
};
export {};
//# sourceMappingURL=analysis_provider.d.ts.map