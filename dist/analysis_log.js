"use client";
import { __assign } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { FixedSizeList } from "react-window";
import { useClientRect } from "./client_rect";
import { LogCode, MessageType, Stage, StageResult, } from "./types";
export var AnalysisRunnerLog = function (p) {
    var _a = useClientRect(), rect = _a.rect, ref = _a.ref;
    var listRef = useRef(null);
    var listBodyRef = useRef();
    var wasListAtBottom = useRef(true);
    var eventSourceRef = useRef(undefined);
    var logAsStaticArrayRef = useRef([
        { text: "Not yet run", code: LogCode.StatusUpdate },
    ]);
    var _b = useState(1), logCount = _b[0], setLogCount = _b[1];
    useEffect(function () {
        var id = window.setInterval(function () {
            setLogCount(logAsStaticArrayRef.current.length);
        }, 500);
        return function () { return window.clearInterval(id); };
    }, []);
    useEffect(function () {
        eventSourceRef.current = new EventSource(p.listenUrl);
        logAsStaticArrayRef.current = [
            { text: "*** Opened connection ***", code: LogCode.StatusUpdate },
        ];
        eventSourceRef.current.onmessage = function (ev) {
            var msgObj = JSON.parse(ev.data);
            switch (msgObj.msgType) {
                case MessageType.Heartbeat:
                    break;
                case MessageType.Stage:
                    if (msgObj.stage === Stage.InitializeAnalysis &&
                        msgObj.stageResult === StageResult.Success) {
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
            if (eventSourceRef.current &&
                eventSourceRef.current.readyState !== eventSourceRef.current.CLOSED) {
                logAsStaticArrayRef.current.push({
                    text: "*** Error ***",
                    code: LogCode.StatusUpdate,
                });
                // eventSourceRef.current.close();
            }
            // updateLog();
        };
        return function () { var _a; return (_a = eventSourceRef.current) === null || _a === void 0 ? void 0 : _a.close(); };
    }, []);
    useEffect(function () {
        if (logCount <= 1) {
            wasListAtBottom.current = true;
        }
        if (listRef.current &&
            listBodyRef.current &&
            wasListAtBottom.current &&
            !isListAtBottom(listBodyRef.current)) {
            listRef.current.scrollToItem(logCount - 1);
        }
    }, [logCount]);
    function updateScrolledState() {
        requestAnimationFrame(function () {
            // Measure async, once the scroll has actually happened
            if (listBodyRef.current) {
                wasListAtBottom.current = isListAtBottom(listBodyRef.current);
            }
        });
    }
    return (_jsx("div", __assign({ className: "h-full w-full select-text whitespace-pre font-mono text-sm leading-none text-white", ref: ref }, { children: rect && rect.width && rect.height && (_jsx(FixedSizeList, __assign({ width: rect.width, height: rect.height, itemCount: logCount, itemSize: 20, ref: listRef, innerRef: listBodyRef, onScroll: updateScrolledState }, { children: function (_a) {
                var index = _a.index, style = _a.style;
                var item = logAsStaticArrayRef.current[index];
                return (_jsx("div", __assign({ style: __assign(__assign({}, style), { lineHeight: "20px", color: colorForCode(item.code) }), className: "m-0 select-text px-2 py-0" }, { children: item.text }), index));
            } }))) })));
};
var _SCROLL_BOTTOM_MARGIN = 5;
function isListAtBottom(bodyRefElement) {
    var listWindow = bodyRefElement.parentElement;
    if (!listWindow) {
        return true; // This means no rows, so we are effectively at the bottom
    }
    else {
        return (listWindow.scrollTop + _SCROLL_BOTTOM_MARGIN >=
            listWindow.scrollHeight - listWindow.offsetHeight);
    }
}
function colorForCode(code) {
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
//# sourceMappingURL=analysis_log.js.map