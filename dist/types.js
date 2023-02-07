export var MessageType;
(function (MessageType) {
    MessageType["Heartbeat"] = "Heartbeat";
    MessageType["Waiting"] = "Waiting";
    MessageType["NotFoundInJobMap"] = "NotFoundInJobMap";
    MessageType["Stage"] = "Stage";
    MessageType["LogOut"] = "LogOut";
    MessageType["LogErr"] = "LogErr";
    MessageType["EndSuccess"] = "EndSuccess";
    MessageType["EndFailure"] = "EndFailure";
})(MessageType || (MessageType = {}));
export var Status;
(function (Status) {
    Status["NotRun"] = "NotRun";
    Status["Running"] = "Running";
    Status["Failed"] = "Failed";
    Status["Success"] = "Success";
    Status["StoppedByUser"] = "StoppedByUser";
})(Status || (Status = {}));
export var Stage;
(function (Stage) {
    Stage["InitializeAnalysis"] = "InitializeAnalysis";
    Stage["ImportInputFiles"] = "ImportInputFiles";
    Stage["CleanRun"] = "CleanRun";
    Stage["OutputFiles"] = "OutputFiles";
})(Stage || (Stage = {}));
export var StageResult;
(function (StageResult) {
    StageResult["NA"] = "NA";
    StageResult["Pending"] = "Pending";
    StageResult["Success"] = "Success";
    StageResult["Failure"] = "Failure";
})(StageResult || (StageResult = {}));
export var LogCode;
(function (LogCode) {
    LogCode[LogCode["StatusUpdate"] = 0] = "StatusUpdate";
    LogCode[LogCode["Out"] = 1] = "Out";
    LogCode[LogCode["Err"] = 2] = "Err";
    LogCode[LogCode["Waiting"] = 3] = "Waiting";
})(LogCode || (LogCode = {}));
//# sourceMappingURL=types.js.map