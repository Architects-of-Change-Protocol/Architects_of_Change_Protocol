import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
const NODES = [
    { id: 1, label: "App A", x: 450, y: 70, active: true },
    { id: 2, label: "Service B", x: 690, y: 130, active: true },
    { id: 3, label: "Platform C", x: 690, y: 290, active: false },
    { id: 4, label: "App D", x: 450, y: 350, active: true },
    { id: 5, label: "Service E", x: 210, y: 130, active: false },
];
export function FullControlAnimation() {
    const [step, setStep] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setStep((s) => (s + 1) % 6);
        }, 1100);
        return () => clearInterval(interval);
    }, []);
    return (_jsxs("svg", { viewBox: "0 0 900 360", className: "w-full h-full", children: [_jsxs("defs", { children: [_jsxs("filter", { id: "controlGlow", x: "-50%", y: "-50%", width: "200%", height: "200%", children: [_jsx("feGaussianBlur", { stdDeviation: "4", result: "blur" }), _jsxs("feMerge", { children: [_jsx("feMergeNode", { in: "blur" }), _jsx("feMergeNode", { in: "SourceGraphic" })] })] }), _jsxs("radialGradient", { id: "controlAura", children: [_jsx("stop", { offset: "0%", stopColor: "#00f0ff", stopOpacity: "0.26" }), _jsx("stop", { offset: "55%", stopColor: "#00f0ff", stopOpacity: "0.08" }), _jsx("stop", { offset: "100%", stopColor: "#00f0ff", stopOpacity: "0" })] })] }), _jsx("circle", { cx: "450", cy: "180", r: step >= 4 ? 82 : 68, fill: "url(#controlAura)", opacity: step >= 1 ? 1 : 0, children: step >= 4 && (_jsx("animate", { attributeName: "r", values: "76;88;76", dur: "1.8s", repeatCount: "indefinite" })) }), step >= 3 && (_jsx("circle", { cx: "450", cy: "180", r: "112", fill: "none", stroke: "rgba(0,240,255,0.28)", strokeWidth: "1.5", children: _jsx("animate", { attributeName: "opacity", values: "0.18;0.38;0.18", dur: "1.8s", repeatCount: "indefinite" }) })), step >= 1 && (_jsxs("g", { filter: "url(#controlGlow)", children: [_jsx("circle", { cx: "450", cy: "160", r: "12", fill: "none", stroke: "#00f0ff", strokeWidth: "2.5" }), _jsx("line", { x1: "450", y1: "172", x2: "450", y2: "202", stroke: "#00f0ff", strokeWidth: "2.5", strokeLinecap: "round" }), _jsx("line", { x1: "450", y1: "180", x2: "434", y2: "191", stroke: "#00f0ff", strokeWidth: "2.5", strokeLinecap: "round" }), _jsx("line", { x1: "450", y1: "180", x2: "466", y2: "191", stroke: "#00f0ff", strokeWidth: "2.5", strokeLinecap: "round" }), _jsx("line", { x1: "450", y1: "202", x2: "439", y2: "220", stroke: "#00f0ff", strokeWidth: "2.5", strokeLinecap: "round" }), _jsx("line", { x1: "450", y1: "202", x2: "461", y2: "220", stroke: "#00f0ff", strokeWidth: "2.5", strokeLinecap: "round" })] })), step >= 2 &&
                NODES.map((node) => {
                    const isActive = node.active && step >= 4;
                    return (_jsxs("g", { children: [_jsx("line", { x1: "450", y1: "180", x2: node.x, y2: node.y, stroke: isActive ? "rgba(0,240,255,0.62)" : "rgba(255,255,255,0.12)", strokeWidth: "1.6", strokeDasharray: "6 6", children: isActive && (_jsx("animate", { attributeName: "stroke-dashoffset", values: "0;-12", dur: "1s", repeatCount: "indefinite" })) }), isActive && step >= 5 && (_jsxs("circle", { cx: "450", cy: "180", r: "4", fill: "#00f0ff", filter: "url(#controlGlow)", children: [_jsx("animate", { attributeName: "cx", values: `450;${node.x}`, dur: "0.9s", begin: `${node.id * 0.15}s`, repeatCount: "indefinite" }), _jsx("animate", { attributeName: "cy", values: `180;${node.y}`, dur: "0.9s", begin: `${node.id * 0.15}s`, repeatCount: "indefinite" }), _jsx("animate", { attributeName: "opacity", values: "0;1;1;0", dur: "0.9s", begin: `${node.id * 0.15}s`, repeatCount: "indefinite" })] }))] }, `line-${node.id}`));
                }), step >= 2 &&
                NODES.map((node) => {
                    const active = node.active && step >= 4;
                    return (_jsxs("g", { transform: `translate(${node.x},${node.y})`, children: [_jsx("rect", { x: "-22", y: "-22", width: "44", height: "44", rx: "8", fill: active ? "rgba(0,240,255,0.08)" : "rgba(255,255,255,0.02)", stroke: active ? "#00f0ff" : "rgba(255,255,255,0.22)", strokeWidth: "2", filter: active ? "url(#controlGlow)" : undefined, children: active && (_jsx("animate", { attributeName: "opacity", values: "0.75;1;0.75", dur: "1.8s", repeatCount: "indefinite" })) }), _jsx("rect", { x: "-10", y: "-10", width: "20", height: "20", rx: "4", fill: active ? "rgba(0,240,255,0.22)" : "rgba(255,255,255,0.08)", stroke: active ? "rgba(0,240,255,0.7)" : "rgba(255,255,255,0.12)" }), _jsx("text", { x: "0", y: "40", textAnchor: "middle", fill: active ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.32)", fontSize: "10", children: node.label })] }, node.id));
                }), step >= 4 && (_jsxs("circle", { cx: "450", cy: "180", r: "112", fill: "none", stroke: "#00f0ff", strokeWidth: "2", opacity: "0.7", children: [_jsx("animate", { attributeName: "r", values: "90;145", dur: "1.2s", repeatCount: "indefinite" }), _jsx("animate", { attributeName: "opacity", values: "0.7;0", dur: "1.2s", repeatCount: "indefinite" })] })), step >= 5 && (_jsx("text", { x: "450", y: "330", textAnchor: "middle", fill: "rgba(255,255,255,0.36)", fontSize: "10", letterSpacing: "2", children: "CONTROL STAYS WITH THE SOURCE" }))] }));
}
