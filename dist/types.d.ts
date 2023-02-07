export type AnalysisStatus = {
    analyzing: boolean;
    [Stage.InitializeAnalysis]: StageResult;
    [Stage.ImportInputFiles]: StageResult;
    [Stage.CleanRun]: StageResult;
    [Stage.OutputFiles]: StageResult;
    finalStatus: Status;
};
export declare enum MessageType {
    Heartbeat = "Heartbeat",
    Waiting = "Waiting",
    NotFoundInJobMap = "NotFoundInJobMap",
    Stage = "Stage",
    LogOut = "LogOut",
    LogErr = "LogErr",
    EndSuccess = "EndSuccess",
    EndFailure = "EndFailure"
}
export type RealTimeMessage = RTMWaiting | RTMLog | RTMHeartbeat | RTMStage | RTMNotFoundInJobMap | RTMEnd;
export type RTMStage = {
    msgType: MessageType.Stage;
    stage: Stage;
    stageResult: StageResult;
};
export type RTMNotFoundInJobMap = {
    msgType: MessageType.NotFoundInJobMap;
};
export type RTMWaiting = {
    msgType: MessageType.Waiting;
    log: string;
};
export type RTMLog = {
    msgType: MessageType.LogErr | MessageType.LogOut;
    log: string;
};
export type RTMHeartbeat = {
    msgType: MessageType.Heartbeat;
};
export type RTMEnd = {
    msgType: MessageType.EndSuccess | MessageType.EndFailure;
};
export declare enum Status {
    NotRun = "NotRun",
    Running = "Running",
    Failed = "Failed",
    Success = "Success",
    StoppedByUser = "StoppedByUser"
}
export declare enum Stage {
    InitializeAnalysis = "InitializeAnalysis",
    ImportInputFiles = "ImportInputFiles",
    CleanRun = "CleanRun",
    OutputFiles = "OutputFiles"
}
export declare enum StageResult {
    NA = "NA",
    Pending = "Pending",
    Success = "Success",
    Failure = "Failure"
}
export declare enum LogCode {
    StatusUpdate = 0,
    Out = 1,
    Err = 2,
    Waiting = 3
}
//# sourceMappingURL=types.d.ts.map