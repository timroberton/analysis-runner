import { MutableRefObject } from "react";
import { LogCode } from "./types";
type AnalysisLogProps = {
    show: boolean;
    logCount: number;
    logAsStaticArrayRef: MutableRefObject<{
        text: string;
        code: LogCode;
    }[]>;
};
export declare const AnalysisLog: React.FC<AnalysisLogProps>;
export {};
//# sourceMappingURL=analysis_log.d.ts.map