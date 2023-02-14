"use client";

import { useEffect, useRef, useState } from "react";
import { FixedSizeList } from "react-window";
import { useClientRect } from "./client_rect";
import {
  LogCode,
  MessageType,
  RealTimeMessage,
  Stage,
  StageResult,
} from "./types";

type AnalysisLogProps = {
  listenUrl: string;
};

export const AnalysisRunnerLog: React.FC<AnalysisLogProps> = (p) => {
  const { rect, ref } = useClientRect();
  const listRef = useRef<FixedSizeList<string> | null>(null);
  const listBodyRef = useRef<HTMLDivElement>();
  const wasListAtBottom = useRef(true);
  const eventSourceRef = useRef<EventSource | undefined>(undefined);
  const logAsStaticArrayRef = useRef<{ text: string; code: LogCode }[]>([
    { text: "Not yet run", code: LogCode.StatusUpdate },
  ]);
  const [logCount, setLogCount] = useState<number>(1);

  useEffect(() => {
    const id = window.setInterval(() => {
      setLogCount(logAsStaticArrayRef.current.length);
    }, 500);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    eventSourceRef.current = new EventSource(p.listenUrl);

    logAsStaticArrayRef.current = [
      { text: "*** Opened connection ***", code: LogCode.StatusUpdate },
    ];

    eventSourceRef.current.onmessage = function (ev) {
      const msgObj: RealTimeMessage = JSON.parse(ev.data);
      switch (msgObj.msgType) {
        case MessageType.Heartbeat:
          break;
        case MessageType.Stage:
          if (
            msgObj.stage === Stage.InitializeAnalysis &&
            msgObj.stageResult === StageResult.Success
          ) {
            logAsStaticArrayRef.current = [
              {
                text: "*** Starting new analysis ***",
                code: LogCode.StatusUpdate,
              },
            ];
          }
          break;
        case MessageType.LogOut:
          logAsStaticArrayRef.current.push({
            text: msgObj.log,
            code: LogCode.Out,
          });
          break;
        case MessageType.LogErr:
          logAsStaticArrayRef.current.push({
            text: msgObj.log,
            code: LogCode.Err,
          });
          break;
        default:
          logAsStaticArrayRef.current.push({
            text: "Different msg type " + msgObj.msgType,
            code: LogCode.StatusUpdate,
          });
      }
    };

    eventSourceRef.current.onopen = function (ev) {
      // This means that analysis was launched from client
      // console.log("Open", ev);
    };

    eventSourceRef.current.onerror = function (ev) {
      // This means that analysis ended on server
      console.log("Error", ev);
      if (
        eventSourceRef.current &&
        eventSourceRef.current.readyState !== eventSourceRef.current.CLOSED
      ) {
        logAsStaticArrayRef.current.push({
          text: "*** Error ***",
          code: LogCode.StatusUpdate,
        });
        // eventSourceRef.current.close();
      }
      // updateLog();
    };

    return () => eventSourceRef.current.close();
  }, []);

  useEffect(() => {
    if (logCount <= 1) {
      wasListAtBottom.current = true;
    }
    if (
      listRef.current &&
      listBodyRef.current &&
      wasListAtBottom.current &&
      !isListAtBottom(listBodyRef.current)
    ) {
      listRef.current.scrollToItem(logCount - 1);
    }
  }, [logCount]);

  function updateScrolledState() {
    requestAnimationFrame(() => {
      // Measure async, once the scroll has actually happened
      if (listBodyRef.current) {
        wasListAtBottom.current = isListAtBottom(listBodyRef.current);
      }
    });
  }

  return (
    <div
      className="h-full w-full select-text whitespace-pre bg-neutral font-mono text-xs leading-none text-white"
      ref={ref}
    >
      {rect && rect.width && rect.height && (
        <FixedSizeList
          width={rect.width}
          height={rect.height}
          itemCount={logCount}
          itemSize={20}
          ref={listRef}
          innerRef={listBodyRef}
          onScroll={updateScrolledState}
        >
          {({ index, style }) => {
            const item = logAsStaticArrayRef.current[index];
            return (
              <div
                key={index}
                style={{
                  ...style,
                  lineHeight: "20px",
                  color: colorForCode(item.code),
                }}
                className="m-0 select-text px-2 py-0"
              >
                {item.text}
              </div>
            );
          }}
        </FixedSizeList>
      )}
    </div>
  );
};

const _SCROLL_BOTTOM_MARGIN = 5;

function isListAtBottom(bodyRefElement: HTMLDivElement) {
  const listWindow = bodyRefElement.parentElement;
  if (!listWindow) {
    return true; // This means no rows, so we are effectively at the bottom
  } else {
    return (
      listWindow.scrollTop + _SCROLL_BOTTOM_MARGIN >=
      listWindow.scrollHeight - listWindow.offsetHeight
    );
  }
}
function colorForCode(code: LogCode): string {
  switch (code) {
    case LogCode.Out:
      return "white";
    case LogCode.Err:
      return "red";
    case LogCode.StatusUpdate:
      return "blue";
    case LogCode.Waiting:
      return "purple";
    default:
      return "white";
  }
}
