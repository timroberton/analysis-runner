"use client";
import { __assign } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
import { useClientRect } from "./client_rect";
import { FixedSizeList } from "react-window";
import { useRef, useEffect } from "react";
import { LogCode } from "./types";
export var AnalysisRunnerLog = function (p) {
    var _a = useClientRect(), rect = _a.rect, ref = _a.ref;
    var listRef = useRef(null);
    var listBodyRef = useRef();
    var wasListAtBottom = useRef(true);
    useEffect(function () {
        if (p.logCount <= 1) {
            wasListAtBottom.current = true;
        }
        if (listRef.current &&
            listBodyRef.current &&
            wasListAtBottom.current &&
            !isListAtBottom(listBodyRef.current)) {
            listRef.current.scrollToItem(p.logCount - 1);
        }
    }, [p.logCount]);
    function updateScrolledState() {
        requestAnimationFrame(function () {
            // Measure async, once the scroll has actually happened
            if (listBodyRef.current) {
                wasListAtBottom.current = isListAtBottom(listBodyRef.current);
            }
        });
    }
    return (_jsx("div", __assign({ className: "h-full w-full select-text whitespace-pre bg-neutral font-mono text-xs leading-none text-white", ref: ref, style: {
            opacity: p.show ? 1 : 0,
        } }, { children: rect && rect.width && rect.height && (_jsx(FixedSizeList, __assign({ width: rect.width, height: rect.height, itemCount: p.logCount, itemSize: 20, ref: listRef, innerRef: listBodyRef, onScroll: updateScrolledState }, { children: function (_a) {
                var index = _a.index, style = _a.style;
                var item = p.logAsStaticArrayRef.current[index];
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