import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
export function VerifiableInteractionsAnimation() {
    const [step, setStep] = useState(0);
    const [records, setRecords] = useState([
        { id: 1, ts: "12:41:02" },
        { id: 2, ts: "12:41:07" },
        { id: 3, ts: "12:41:11" },
    ]);
    useEffect(() => {
        const interval = setInterval(() => {
            setStep((s) => {
                const next = (s + 1) % 4;
                if (next === 0) {
                    const now = new Date();
                    const ts = now.toTimeString().slice(0, 8);
                    setRecords((prev) => [...prev.slice(-3), { id: Date.now(), ts }]);
                }
                return next;
            });
        }, 1100);
        return () => clearInterval(interval);
    }, []);
    const latestIndex = records.length - 1;
    return (_jsxs("svg", { viewBox: "0 0 900 360", className: "w-full h-full", children: [_jsx("defs", { children: _jsxs("filter", { id: "verifyGlow", x: "-50%", y: "-50%", width: "200%", height: "200%", children: [_jsx("feGaussianBlur", { stdDeviation: "4", result: "blur" }), _jsxs("feMerge", { children: [_jsx("feMergeNode", { in: "blur" }), _jsx("feMergeNode", { in: "SourceGraphic" })] })] }) }), _jsxs("g", { transform: "translate(110,180)", children: [_jsx("circle", { r: "34", fill: "rgba(255,255,255,0.02)", stroke: "rgba(255,255,255,0.7)" }), _jsx("circle", { cx: "0", cy: "-8", r: "8", fill: "white" }), _jsx("path", { d: "M-16 20 Q0 2 16 20", fill: "none", stroke: "white", strokeWidth: "2.5", strokeLinecap: "round" })] }), _jsxs("g", { opacity: step >= 0 ? 1 : 0, children: [_jsx("rect", { x: step === 0 ? 170 : step === 1 ? 240 : step === 2 ? 310 : 310, y: "155", width: "130", height: "50", rx: "12", fill: "rgba(0,240,255,0.08)", stroke: "rgba(0,240,255,0.45)", filter: "url(#verifyGlow)" }), _jsx("text", { x: step === 0 ? 235 : step === 1 ? 305 : step === 2 ? 375 : 375, y: "175", textAnchor: "middle", fill: "#00f0ff", fontSize: "11", children: "ACCESS REQUEST" }), _jsx("text", { x: step === 0 ? 235 : step === 1 ? 305 : step === 2 ? 375 : 375, y: "192", textAnchor: "middle", fill: "rgba(255,255,255,0.5)", fontSize: "9", children: "verified event" })] }), _jsx("line", { x1: "145", y1: "180", x2: "315", y2: "180", stroke: "rgba(0,240,255,0.24)", strokeWidth: "2", strokeDasharray: "6 6", children: _jsx("animate", { attributeName: "stroke-dashoffset", values: "0;-12", dur: "1s", repeatCount: "indefinite" }) }), _jsxs("g", { transform: "translate(450,180)", children: [_jsx("rect", { x: "-85", y: "-90", width: "170", height: "180", rx: "18", fill: "rgba(10,20,28,0.88)", stroke: step >= 1 ? "#00f0ff" : "rgba(0,240,255,0.28)" }), _jsx("text", { x: "0", y: "-62", textAnchor: "middle", fill: "#00f0ff", fontSize: "11", children: "VERIFY" }), Array.from({ length: 9 }).map((_, i) => {
                        const col = i % 3;
                        const row = Math.floor(i / 3);
                        const active = step === 1 || step === 2;
                        return (_jsx("rect", { x: -48 + col * 34, y: -28 + row * 34, width: "22", height: "22", rx: "5", fill: active ? "rgba(0,240,255,0.18)" : "rgba(0,240,255,0.05)", stroke: active ? "rgba(0,240,255,0.65)" : "rgba(0,240,255,0.18)", children: active && (_jsx("animate", { attributeName: "opacity", values: "0.35;1;0.35", dur: "0.8s", begin: `${i * 0.08}s`, repeatCount: "indefinite" })) }, i));
                    }), (step === 1 || step === 2) && (_jsxs("line", { x1: "-58", y1: "-18", x2: "58", y2: "-18", stroke: "#00f0ff", strokeWidth: "2", filter: "url(#verifyGlow)", children: [_jsx("animate", { attributeName: "y1", values: "-18;48;-18", dur: "1s", repeatCount: "indefinite" }), _jsx("animate", { attributeName: "y2", values: "-18;48;-18", dur: "1s", repeatCount: "indefinite" })] }))] }), _jsx("line", { x1: "535", y1: "180", x2: "675", y2: "180", stroke: "rgba(0,240,255,0.2)", strokeWidth: "2" }), (step === 2 || step === 3) && (_jsxs("circle", { cx: "535", cy: "180", r: "4", fill: "#00f0ff", filter: "url(#verifyGlow)", children: [_jsx("animate", { attributeName: "cx", values: "535;675", dur: "0.7s", repeatCount: "indefinite" }), _jsx("animate", { attributeName: "opacity", values: "1;1;0", dur: "0.7s", repeatCount: "indefinite" })] })), _jsxs("g", { transform: "translate(770,180)", children: [_jsx("text", { x: "0", y: "-104", textAnchor: "middle", fill: "rgba(255,255,255,0.36)", fontSize: "10", letterSpacing: "2", children: "AUDIT LEDGER" }), records.map((r, idx) => {
                        const y = -65 + idx * 42;
                        const isLatest = idx === latestIndex && step === 3;
                        return (_jsxs("g", { transform: `translate(0,${y})`, children: [_jsx("rect", { x: "-82", y: "-14", width: "164", height: "30", rx: "10", fill: "rgba(0,240,255,0.06)", stroke: isLatest ? "rgba(0,240,255,0.75)" : "rgba(0,240,255,0.24)", children: isLatest && (_jsx("animate", { attributeName: "opacity", values: "0.65;1;0.65", dur: "1.2s", repeatCount: "indefinite" })) }), _jsx("circle", { cx: "-58", cy: "1", r: "8", fill: "rgba(0,240,255,0.12)", stroke: "#00f0ff" }), _jsx("path", { d: "M-61 1 l3 3 l6 -7", fill: "none", stroke: "#00f0ff", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }), _jsx("text", { x: "-38", y: "-1", fill: "white", fontSize: "9", opacity: "0.7", children: "VERIFIED" }), _jsx("text", { x: "-38", y: "10", fill: "white", fontSize: "8", opacity: "0.35", children: r.ts }), _jsx("rect", { x: "38", y: "-6", width: "4", height: "12", rx: "2", fill: "rgba(0,240,255,0.3)" }), _jsx("rect", { x: "45", y: "-8", width: "4", height: "16", rx: "2", fill: "rgba(0,240,255,0.45)" }), _jsx("rect", { x: "52", y: "-5", width: "4", height: "10", rx: "2", fill: "rgba(0,240,255,0.6)" }), _jsx("rect", { x: "59", y: "-9", width: "4", height: "18", rx: "2", fill: "rgba(0,240,255,0.78)" })] }, r.id));
                    })] }), _jsx("text", { x: "450", y: "330", textAnchor: "middle", fill: "rgba(255,255,255,0.28)", fontSize: "10", letterSpacing: "2", children: "EVERY INTERACTION LEAVES EVIDENCE" })] }));
}
