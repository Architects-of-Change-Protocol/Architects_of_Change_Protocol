import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
const STAGE_Y = 150;
const LANES = [-16, -6, 4, 14];
const MAX_LINES = 8;
export function HowItWorksFlow() {
    const [lines, setLines] = useState([]);
    const [nextId, setNextId] = useState(0);
    useEffect(() => {
        const spawnInterval = window.setInterval(() => {
            setLines((prev) => {
                const id = nextId;
                const lane = id % LANES.length;
                const next = {
                    id,
                    lane,
                    progress: 0,
                    status: "pending",
                };
                return [next, ...prev].slice(0, MAX_LINES);
            });
            setNextId((prev) => prev + 1);
        }, 1700);
        const tickInterval = window.setInterval(() => {
            setLines((prev) => prev
                .map((line) => {
                const nextProgress = line.progress + 0.018;
                let nextStatus = line.status;
                if (line.status === "pending" && nextProgress >= 0.5) {
                    nextStatus = line.id % 4 === 0 ? "denied" : "granted";
                }
                return {
                    ...line,
                    progress: nextProgress,
                    status: nextStatus,
                };
            })
                .filter((line) => line.progress <= 1.08));
        }, 40);
        return () => {
            window.clearInterval(spawnInterval);
            window.clearInterval(tickInterval);
        };
    }, [nextId]);
    const completedLog = useMemo(() => lines
        .filter((line) => line.progress >= 0.84 && line.status !== "pending")
        .sort((a, b) => b.id - a.id)
        .slice(0, 5), [lines]);
    return (_jsxs("svg", { viewBox: "0 0 900 300", className: "w-full h-full", role: "img", "aria-label": "How AOC Protocol works", children: [_jsxs("defs", { children: [_jsxs("linearGradient", { id: "panelFill", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: "rgba(20,20,30,0.95)" }), _jsx("stop", { offset: "100%", stopColor: "rgba(10,10,18,0.92)" })] }), _jsxs("linearGradient", { id: "cyanBeam", x1: "0", y1: "0", x2: "1", y2: "0", children: [_jsx("stop", { offset: "0%", stopColor: "rgba(0,240,255,0.00)" }), _jsx("stop", { offset: "50%", stopColor: "rgba(0,240,255,0.75)" }), _jsx("stop", { offset: "100%", stopColor: "rgba(0,240,255,0.00)" })] }), _jsxs("filter", { id: "softGlow", x: "-50%", y: "-50%", width: "200%", height: "200%", children: [_jsx("feGaussianBlur", { stdDeviation: "4", result: "blur" }), _jsxs("feMerge", { children: [_jsx("feMergeNode", { in: "blur" }), _jsx("feMergeNode", { in: "SourceGraphic" })] })] }), _jsxs("filter", { id: "panelGlow", x: "-50%", y: "-50%", width: "200%", height: "200%", children: [_jsx("feGaussianBlur", { stdDeviation: "8", result: "blur" }), _jsx("feColorMatrix", { in: "blur", type: "matrix", values: "\n              0 0 0 0 0\n              0 0 0 0 0.94\n              0 0 0 0 1\n              0 0 0 0.18 0\n            " })] })] }), _jsx("line", { x1: "182", y1: STAGE_Y, x2: "705", y2: STAGE_Y, stroke: "rgba(0,240,255,0.08)", strokeWidth: "2" }), _jsx("line", { x1: "182", y1: STAGE_Y + 18, x2: "705", y2: STAGE_Y + 18, stroke: "rgba(255,255,255,0.04)", strokeWidth: "1" }), _jsxs("g", { transform: "translate(110,150)", children: [_jsx("rect", { x: "-68", y: "-58", width: "136", height: "116", rx: "18", fill: "url(#panelFill)", stroke: "rgba(0,240,255,0.18)" }), _jsx("rect", { x: "-68", y: "-58", width: "136", height: "116", rx: "18", fill: "none", stroke: "rgba(0,240,255,0.09)", filter: "url(#panelGlow)" }), _jsx("text", { x: "0", y: "-74", textAnchor: "middle", fill: "rgba(255,255,255,0.92)", fontSize: "13", fontWeight: "600", letterSpacing: "0.2", className: "hidden sm:block", children: "Define Permissions" }), _jsx("rect", { x: "-42", y: "-24", width: "84", height: "12", rx: "6", fill: "rgba(0,240,255,0.16)" }), _jsx("rect", { x: "-42", y: "-2", width: "72", height: "10", rx: "5", fill: "rgba(255,255,255,0.14)" }), _jsx("rect", { x: "-42", y: "18", width: "58", height: "10", rx: "5", fill: "rgba(255,255,255,0.10)" }), [0, 1, 2].map((i) => (_jsx("rect", { x: "-50", y: -30 + i * 18, width: "8", height: "8", rx: "4", fill: "#00f0ff", opacity: "0.9", children: _jsx("animate", { attributeName: "opacity", values: "0.35;1;0.35", dur: "2.2s", begin: `${i * 0.28}s`, repeatCount: "indefinite" }) }, i)))] }), _jsxs("g", { children: [_jsx("line", { x1: "178", y1: STAGE_Y, x2: "335", y2: STAGE_Y, stroke: "rgba(0,240,255,0.16)", strokeWidth: "2" }), _jsxs("rect", { x: "228", y: "146", width: "58", height: "8", rx: "4", fill: "url(#cyanBeam)", opacity: "0.75", children: [_jsx("animateTransform", { attributeName: "transform", type: "translate", from: "-18 0", to: "28 0", dur: "1.7s", repeatCount: "indefinite" }), _jsx("animate", { attributeName: "opacity", values: "0;0.9;0", dur: "1.7s", repeatCount: "indefinite" })] })] }), _jsxs("g", { transform: "translate(390,150)", children: [_jsx("rect", { x: "-86", y: "-66", width: "172", height: "132", rx: "22", fill: "url(#panelFill)", stroke: "rgba(0,240,255,0.20)" }), _jsx("rect", { x: "-86", y: "-66", width: "172", height: "132", rx: "22", fill: "none", stroke: "rgba(0,240,255,0.10)", filter: "url(#panelGlow)" }), _jsx("text", { x: "0", y: "-82", textAnchor: "middle", fill: "rgba(255,255,255,0.92)", fontSize: "13", fontWeight: "600", letterSpacing: "0.2", className: "hidden sm:block", children: "Evaluate Request" }), _jsx("rect", { x: "-52", y: "-22", width: "104", height: "14", rx: "7", fill: "rgba(0,240,255,0.10)" }), _jsx("rect", { x: "-36", y: "2", width: "72", height: "10", rx: "5", fill: "rgba(255,255,255,0.14)" }), _jsx("rect", { x: "-46", y: "22", width: "92", height: "10", rx: "5", fill: "rgba(255,255,255,0.08)" }), _jsx("circle", { cx: "-56", cy: "-15", r: "3", fill: "#00f0ff", filter: "url(#softGlow)", children: _jsx("animate", { attributeName: "opacity", values: "0.25;1;0.25", dur: "1.4s", repeatCount: "indefinite" }) }), _jsx("circle", { cx: "0", cy: "-15", r: "3", fill: "#00f0ff", filter: "url(#softGlow)", children: _jsx("animate", { attributeName: "opacity", values: "0.25;1;0.25", dur: "1.4s", begin: "0.22s", repeatCount: "indefinite" }) }), _jsx("circle", { cx: "56", cy: "-15", r: "3", fill: "#00f0ff", filter: "url(#softGlow)", children: _jsx("animate", { attributeName: "opacity", values: "0.25;1;0.25", dur: "1.4s", begin: "0.44s", repeatCount: "indefinite" }) })] }), _jsxs("g", { children: [_jsx("line", { x1: "476", y1: STAGE_Y, x2: "632", y2: STAGE_Y, stroke: "rgba(0,240,255,0.16)", strokeWidth: "2" }), _jsxs("rect", { x: "525", y: "146", width: "58", height: "8", rx: "4", fill: "url(#cyanBeam)", opacity: "0.75", children: [_jsx("animateTransform", { attributeName: "transform", type: "translate", from: "-18 0", to: "28 0", dur: "1.7s", begin: "0.35s", repeatCount: "indefinite" }), _jsx("animate", { attributeName: "opacity", values: "0;0.9;0", dur: "1.7s", begin: "0.35s", repeatCount: "indefinite" })] })] }), lines.map((line) => {
                const laneY = STAGE_Y + LANES[line.lane];
                const xStart = 178;
                const xEnd = 632;
                const x = xStart + (xEnd - xStart) * line.progress;
                const stroke = line.status === "granted"
                    ? "#00f0b4"
                    : line.status === "denied"
                        ? "#ff5a5a"
                        : "#00f0ff";
                const headOpacity = line.progress < 0.03 ? 0 : 1;
                const trailOpacity = line.status === "pending"
                    ? 0.26
                    : line.status === "granted"
                        ? 0.34
                        : 0.30;
                return (_jsxs("g", { children: [_jsx("line", { x1: xStart, y1: laneY, x2: Math.max(xStart, x - 10), y2: laneY, stroke: stroke, strokeWidth: "2", opacity: trailOpacity }), _jsx("circle", { cx: x, cy: laneY, r: "3.5", fill: stroke, opacity: headOpacity, filter: "url(#softGlow)" })] }, line.id));
            }), _jsxs("g", { transform: "translate(720,150)", children: [_jsx("rect", { x: "-82", y: "-72", width: "164", height: "144", rx: "22", fill: "url(#panelFill)", stroke: "rgba(0,240,255,0.20)" }), _jsx("rect", { x: "-82", y: "-72", width: "164", height: "144", rx: "22", fill: "none", stroke: "rgba(0,240,255,0.10)", filter: "url(#panelGlow)" }), _jsx("text", { x: "0", y: "-88", textAnchor: "middle", fill: "rgba(255,255,255,0.92)", fontSize: "13", fontWeight: "600", letterSpacing: "0.2", className: "hidden sm:block", children: "Grant & Audit Access" }), _jsx("rect", { x: "-60", y: "-40", width: "120", height: "88", rx: "12", fill: "rgba(255,255,255,0.03)", stroke: "rgba(255,255,255,0.06)" }), completedLog.map((entry, i) => {
                        const y = -28 + i * 16;
                        const ok = entry.status === "granted";
                        return (_jsxs("g", { transform: `translate(0, ${y})`, children: [_jsx("rect", { x: "-50", y: "0", width: "100", height: "10", rx: "5", fill: ok ? "rgba(0,240,180,0.12)" : "rgba(255,90,90,0.12)" }), _jsx("rect", { x: "-50", y: "0", width: "28", height: "10", rx: "5", fill: ok ? "#00f0b4" : "#ff5a5a" }), _jsx("rect", { x: "-18", y: "2", width: "48", height: "6", rx: "3", fill: "rgba(255,255,255,0.16)" }), _jsx("rect", { x: "34", y: "2", width: "10", height: "6", rx: "3", fill: "rgba(255,255,255,0.09)" })] }, entry.id));
                    }), _jsx("circle", { cx: "50", cy: "-52", r: "4", fill: "#00f0ff", filter: "url(#softGlow)", children: _jsx("animate", { attributeName: "opacity", values: "0.2;1;0.2", dur: "1.6s", repeatCount: "indefinite" }) })] })] }));
}
export default HowItWorksFlow;
