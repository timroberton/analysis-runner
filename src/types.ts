export type AnalysisStatus = {
  analyzing: boolean;
  //
  [Stage.InitializeAnalysis]: StageResult;
  [Stage.ImportInputFiles]: StageResult;
  [Stage.CleanRun]: StageResult;
  [Stage.OutputFiles]: StageResult;
  //
  finalStatus: Status;
};

export enum MessageType {
  Heartbeat = "Heartbeat",
  Waiting = "Waiting",
  NotFoundInJobMap = "NotFoundInJobMap",
  Stage = "Stage",
  LogOut = "LogOut",
  LogErr = "LogErr",
  EndSuccess = "EndSuccess",
  EndFailure = "EndFailure",
}

export type RealTimeMessage =
  | RTMWaiting
  | RTMLog
  | RTMHeartbeat
  | RTMStage
  | RTMNotFoundInJobMap
  | RTMEnd;

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

export enum Status {
  NotRun = "NotRun",
  Running = "Running",
  Failed = "Failed",
  Success = "Success",
  StoppedByUser = "StoppedByUser",
}

export enum Stage {
  InitializeAnalysis = "InitializeAnalysis",
  ImportInputFiles = "ImportInputFiles",
  CleanRun = "CleanRun",
  OutputFiles = "OutputFiles",
}

export enum StageResult {
  NA = "NA",
  Pending = "Pending",
  Success = "Success",
  Failure = "Failure",
}

export enum LogCode {
  StatusUpdate,
  Out,
  Err,
  Waiting,
}

export type AnalysisPackage = {
  id: string;
  code: string;
  language: "typescript" | "r" | "stata";
  inputs: { analysisId: string; fileName: string }[];
  outputs: { fileName: string }[];
};
