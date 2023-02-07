"use client";
import { __assign } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useRef, useState, } from "react";
import { LogCode, MessageType, Stage, StageResult, Status, } from "./types";
//@ts-ignore
var Context = createContext();
export default function AnalysisProvider(p) {
    var _a = useState(freshAnalysisStatus()), analysisStatus = _a[0], setAnalysisStatus = _a[1];
    var eventsRef = useRef(undefined);
    var isAnalysingRef = useRef(false);
    var logAsStaticArrayRef = useRef([
        { text: "Not yet run", code: LogCode.StatusUpdate },
    ]);
    var _b = useState(""), serverIP = _b[0], setServerIP = _b[1];
    var _c = useState(1), logCount = _c[0], setLogCount = _c[1];
    function updateServerIP(ip) {
        setServerIP(ip);
    }
    function updateLog() {
        window.setTimeout(function () {
            setLogCount(logAsStaticArrayRef.current.length);
            if (isAnalysingRef.current) {
                updateLog();
            }
        }, 500);
    }
    function analyze(url) {
        if (eventsRef.current &&
            eventsRef.current.readyState !== eventsRef.current.CLOSED) {
            console.log("EventSource readyState =", eventsRef.current.readyState);
            return;
        }
        var astatus = freshAnalysisStatus();
        astatus.analyzing = true;
        astatus[Stage.InitializeAnalysis] = StageResult.Pending;
        astatus.finalStatus = Status.Running;
        isAnalysingRef.current = true;
        setAnalysisStatus(astatus);
        logAsStaticArrayRef.current = [
            { text: "*** Queued analysis ***", code: LogCode.StatusUpdate },
        ];
        setLogCount(1);
        updateLog();
        eventsRef.current = new EventSource(url
        // { withCredentials: true }
        );
        eventsRef.current.onmessage = function (ev) {
            var msgObj = JSON.parse(ev.data);
            // console.log(msgObj);
            switch (msgObj.msgType) {
                case MessageType.Heartbeat:
                    return;
                case MessageType.Stage:
                    setAnalysisStatus(function (prev) {
                        var newStatus = __assign({}, prev);
                        newStatus[msgObj.stage] = msgObj.stageResult;
                        return newStatus;
                    });
                    // Failures
                    if (msgObj.stage === Stage.InitializeAnalysis &&
                        msgObj.stageResult === StageResult.Failure) {
                        logAsStaticArrayRef.current.push({
                            text: "*** Could not start analysis ***",
                            code: LogCode.StatusUpdate,
                        });
                    }
                    if (msgObj.stage === Stage.ImportInputFiles &&
                        msgObj.stageResult === StageResult.Failure) {
                        logAsStaticArrayRef.current.push({
                            text: "*** Could not find all input files ***",
                            code: LogCode.StatusUpdate,
                        });
                    }
                    if (msgObj.stage === Stage.CleanRun &&
                        msgObj.stageResult === StageResult.Failure) {
                        logAsStaticArrayRef.current.push({
                            text: "*** Could not finish script ***",
                            code: LogCode.StatusUpdate,
                        });
                    }
                    if (msgObj.stage === Stage.OutputFiles &&
                        msgObj.stageResult === StageResult.Failure) {
                        logAsStaticArrayRef.current.push({
                            text: "*** Could not find all output files ***",
                            code: LogCode.StatusUpdate,
                        });
                    }
                    // Successes (only mention script stuff, otherwise overwhelming)
                    if (msgObj.stage === Stage.ImportInputFiles &&
                        msgObj.stageResult === StageResult.Success) {
                        logAsStaticArrayRef.current.push({
                            text: "*** Started script ***",
                            code: LogCode.StatusUpdate,
                        });
                    }
                    if (msgObj.stage === Stage.CleanRun &&
                        msgObj.stageResult === StageResult.Success) {
                        logAsStaticArrayRef.current.push({
                            text: "*** Finished script ***",
                            code: LogCode.StatusUpdate,
                        });
                    }
                    return;
                case MessageType.NotFoundInJobMap:
                    logAsStaticArrayRef.current.push({
                        text: "Not found in job map",
                        code: LogCode.StatusUpdate,
                    });
                    return;
                case MessageType.Waiting:
                    logAsStaticArrayRef.current.push({
                        text: msgObj.log,
                        code: LogCode.Waiting,
                    });
                    return;
                case MessageType.LogOut:
                    logAsStaticArrayRef.current.push({
                        text: msgObj.log,
                        code: LogCode.Out,
                    });
                    return;
                case MessageType.LogErr:
                    logAsStaticArrayRef.current.push({
                        text: msgObj.log,
                        code: LogCode.Err,
                    });
                    return;
                case MessageType.EndFailure:
                    if (eventsRef.current &&
                        eventsRef.current.readyState !== eventsRef.current.CLOSED) {
                        logAsStaticArrayRef.current.push({
                            text: "*** Closed analysis: FAILED ***",
                            code: LogCode.StatusUpdate,
                        });
                        isAnalysingRef.current = false;
                        setAnalysisStatus(function (prev) {
                            var newStatus = __assign({}, prev);
                            newStatus.finalStatus = Status.Failed;
                            newStatus.analyzing = false;
                            return newStatus;
                        });
                        eventsRef.current.close();
                    }
                    return;
                case MessageType.EndSuccess:
                    if (eventsRef.current &&
                        eventsRef.current.readyState !== eventsRef.current.CLOSED) {
                        logAsStaticArrayRef.current.push({
                            text: "*** Closed analysis: SUCCESS ***",
                            code: LogCode.StatusUpdate,
                        });
                        isAnalysingRef.current = false;
                        setAnalysisStatus(function (prev) {
                            var newStatus = __assign({}, prev);
                            newStatus.finalStatus = Status.Success;
                            newStatus.analyzing = false;
                            return newStatus;
                        });
                        eventsRef.current.close();
                    }
                    return;
                default:
            }
        };
        eventsRef.current.onopen = function (ev) {
            // This means that analysis was launched from client
            // console.log("Open", ev);
        };
        eventsRef.current.onerror = function (ev) {
            // This means that analysis ended on server
            console.log("Error", ev);
            if (eventsRef.current &&
                eventsRef.current.readyState !== eventsRef.current.CLOSED) {
                logAsStaticArrayRef.current.push({
                    text: "*** Closed analysis prematurely because of connection error ***",
                    code: LogCode.StatusUpdate,
                });
                isAnalysingRef.current = false;
                setAnalysisStatus(function (prev) {
                    var newStatus = __assign({}, prev);
                    newStatus.analyzing = false;
                    return newStatus;
                });
                eventsRef.current.close();
            }
        };
    }
    function stop() {
        if (eventsRef.current &&
            eventsRef.current.readyState !== eventsRef.current.CLOSED) {
            logAsStaticArrayRef.current.push({
                text: "*** Stopped by user ***",
                code: LogCode.StatusUpdate,
            });
            isAnalysingRef.current = false;
            setAnalysisStatus(function (prev) {
                var newStatus = __assign({}, prev);
                newStatus.analyzing = false;
                newStatus.finalStatus = Status.StoppedByUser;
                return newStatus;
            });
            eventsRef.current.close();
        }
    }
    return (_jsx(Context.Provider, __assign({ value: {
            analysisStatus: analysisStatus,
            analyze: analyze,
            stop: stop,
            logAsStaticArrayRef: logAsStaticArrayRef,
            logCount: logCount,
            serverIP: serverIP,
            updateServerIP: updateServerIP,
        } }, { children: p.children })));
}
export var useAnalysis = function () { return useContext(Context); };
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
function freshAnalysisStatus() {
    var _a;
    return _a = {
            analyzing: false
        },
        //
        _a[Stage.InitializeAnalysis] = StageResult.NA,
        _a[Stage.ImportInputFiles] = StageResult.NA,
        _a[Stage.CleanRun] = StageResult.NA,
        _a[Stage.OutputFiles] = StageResult.NA,
        //
        _a.finalStatus = Status.NotRun,
        _a;
}
//# sourceMappingURL=analysis_provider.js.map