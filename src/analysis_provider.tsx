"use client";

import {
  createContext,
  MutableRefObject,
  useContext,
  useRef,
  useState,
} from "react";
import {
  AnalysisStatus,
  LogCode,
  MessageType,
  RealTimeMessage,
  Stage,
  StageResult,
  Status,
} from "./types";

type AnalysisProviderProps = {
  children: React.ReactNode;
};

//@ts-ignore
const Context = createContext<{
  analysisStatus: AnalysisStatus;
  analyze: (url: string, onSuccessCallback?: () => Promise<void>) => void;
  stop: () => void;
  logAsStaticArrayRef: MutableRefObject<
    {
      text: string;
      code: LogCode;
    }[]
  >;
  logCount: number;
  serverIP: string;
  updateServerIP: (ip: string) => void;
}>();

export default function AnalysisRunnerProvider(p: AnalysisProviderProps) {
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>(
    freshAnalysisStatus()
  );

  const eventsRef = useRef<EventSource | undefined>(undefined);
  const isAnalysingRef = useRef<boolean>(false);
  const logAsStaticArrayRef = useRef<{ text: string; code: LogCode }[]>([
    { text: "Not yet run", code: LogCode.StatusUpdate },
  ]);

  const [serverIP, setServerIP] = useState<string>("");
  const [logCount, setLogCount] = useState<number>(1);

  function updateServerIP(ip: string) {
    setServerIP(ip);
  }

  function updateLog() {
    window.setTimeout(() => {
      setLogCount(logAsStaticArrayRef.current.length);
      if (isAnalysingRef.current) {
        updateLog();
      }
    }, 500);
  }

  function analyze(url: string, onSuccessCallback?: () => Promise<void>) {
    if (
      eventsRef.current &&
      eventsRef.current.readyState !== eventsRef.current.CLOSED
    ) {
      console.log("EventSource readyState =", eventsRef.current.readyState);
      return;
    }
    const astatus = freshAnalysisStatus();
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

    eventsRef.current = new EventSource(
      url
      // { withCredentials: true }
    );

    eventsRef.current.onmessage = function (ev) {
      const msgObj: RealTimeMessage = JSON.parse(ev.data);
      // console.log(msgObj);
      switch (msgObj.msgType) {
        case MessageType.Heartbeat:
          return;
        case MessageType.Stage:
          setAnalysisStatus((prev) => {
            const newStatus = { ...prev };
            newStatus[msgObj.stage] = msgObj.stageResult;
            return newStatus;
          });
          // Failures
          if (
            msgObj.stage === Stage.InitializeAnalysis &&
            msgObj.stageResult === StageResult.Failure
          ) {
            logAsStaticArrayRef.current.push({
              text: "*** Could not start analysis ***",
              code: LogCode.StatusUpdate,
            });
          }
          if (
            msgObj.stage === Stage.ImportInputFiles &&
            msgObj.stageResult === StageResult.Failure
          ) {
            logAsStaticArrayRef.current.push({
              text: "*** Could not find all input files ***",
              code: LogCode.StatusUpdate,
            });
          }
          if (
            msgObj.stage === Stage.CleanRun &&
            msgObj.stageResult === StageResult.Failure
          ) {
            logAsStaticArrayRef.current.push({
              text: "*** Could not finish script ***",
              code: LogCode.StatusUpdate,
            });
          }
          if (
            msgObj.stage === Stage.OutputFiles &&
            msgObj.stageResult === StageResult.Failure
          ) {
            logAsStaticArrayRef.current.push({
              text: "*** Could not find all output files ***",
              code: LogCode.StatusUpdate,
            });
          }
          // Successes (only mention script stuff, otherwise overwhelming)
          if (
            msgObj.stage === Stage.ImportInputFiles &&
            msgObj.stageResult === StageResult.Success
          ) {
            logAsStaticArrayRef.current.push({
              text: "*** Started script ***",
              code: LogCode.StatusUpdate,
            });
          }
          if (
            msgObj.stage === Stage.CleanRun &&
            msgObj.stageResult === StageResult.Success
          ) {
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
          if (
            eventsRef.current &&
            eventsRef.current.readyState !== eventsRef.current.CLOSED
          ) {
            logAsStaticArrayRef.current.push({
              text: "*** Closed analysis: FAILED ***",
              code: LogCode.StatusUpdate,
            });
            isAnalysingRef.current = false;
            setAnalysisStatus((prev) => {
              const newStatus = { ...prev };
              newStatus.finalStatus = Status.Failed;
              newStatus.analyzing = false;
              return newStatus;
            });
            eventsRef.current.close();
          }
          return;
        case MessageType.EndSuccess:
          if (
            eventsRef.current &&
            eventsRef.current.readyState !== eventsRef.current.CLOSED
          ) {
            logAsStaticArrayRef.current.push({
              text: "*** Closed analysis: SUCCESS ***",
              code: LogCode.StatusUpdate,
            });
            isAnalysingRef.current = false;
            setAnalysisStatus((prev) => {
              const newStatus = { ...prev };
              newStatus.finalStatus = Status.Success;
              newStatus.analyzing = false;
              return newStatus;
            });
            eventsRef.current.close();
            if (typeof onSuccessCallback === "function") {
              onSuccessCallback();
            }
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
      if (
        eventsRef.current &&
        eventsRef.current.readyState !== eventsRef.current.CLOSED
      ) {
        logAsStaticArrayRef.current.push({
          text: "*** Closed analysis prematurely because of connection error ***",
          code: LogCode.StatusUpdate,
        });
        isAnalysingRef.current = false;
        setAnalysisStatus((prev) => {
          const newStatus = { ...prev };
          newStatus.analyzing = false;
          return newStatus;
        });
        eventsRef.current.close();
      }
    };
  }

  function stop() {
    if (
      eventsRef.current &&
      eventsRef.current.readyState !== eventsRef.current.CLOSED
    ) {
      logAsStaticArrayRef.current.push({
        text: "*** Stopped by user ***",
        code: LogCode.StatusUpdate,
      });
      isAnalysingRef.current = false;
      setAnalysisStatus((prev) => {
        const newStatus = { ...prev };
        newStatus.analyzing = false;
        newStatus.finalStatus = Status.StoppedByUser;
        return newStatus;
      });
      eventsRef.current.close();
    }
  }
  return (
    <Context.Provider
      value={{
        analysisStatus,
        analyze,
        stop,
        logAsStaticArrayRef,
        logCount,
        serverIP,
        updateServerIP,
      }}
    >
      {p.children}
    </Context.Provider>
  );
}

export const useAnalysisRunner = () => useContext(Context);

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
  return {
    analyzing: false,
    //
    [Stage.InitializeAnalysis]: StageResult.NA,
    [Stage.ImportInputFiles]: StageResult.NA,
    [Stage.CleanRun]: StageResult.NA,
    [Stage.OutputFiles]: StageResult.NA,
    //
    finalStatus: Status.NotRun,
  };
}
