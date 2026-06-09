import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
export function ExplicitConsentAnimation() {
    const [step, setStep] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setStep((s) => (s + 1) % 4);
        }, 1200);
        return () => clearInterval(interval);
    }, []);
    return (_jsxs("svg", { viewBox: "0 0 900 300", className: "w-full h-full scale-125", children: [_jsxs("g", { transform: "translate(160,150)", children: [_jsx("circle", { r: "35", fill: "rgba(0,240,255,0.08)", stroke: "rgba(0,240,255,0.4)" }), _jsx("circle", { r: "8", cy: "-5", fill: "#00f0ff" })] }), _jsxs("g", { transform: "translate(400,150)", children: [_jsx("rect", { x: "-100", y: "-70", width: "240", height: "160", rx: "18", fill: "rgba(20,20,30,0.9)", stroke: step >= 1 ? "#00f0ff" : "rgba(0,240,255,0.25)" }), _jsx("text", { y: "-15", textAnchor: "middle", fill: "#aaa", fontSize: "11", children: "Request:" }), _jsx("text", { y: "5", textAnchor: "middle", fill: "#00f0ff", fontSize: "12", children: "Financial Data" }), _jsxs("g", { transform: "translate(0,40)", children: [_jsx("rect", { x: "-50", y: "-18", width: "100", height: "36", rx: "10", fill: step >= 1 ? "#00f0ff" : "rgba(0,240,255,0.15)" }), _jsx("text", { textAnchor: "middle", y: "6", fill: step >= 1 ? "#0a0a0a" : "#00f0ff", fontSize: "12", children: step >= 1 ? "GRANTED" : "APPROVE" })] })] }), step >= 2 && (_jsx("line", { x1: "450", y1: "150", x2: "600", y2: "150", stroke: "#00f0ff", strokeWidth: "2", strokeDasharray: "6 6", children: _jsx("animate", { attributeName: "stroke-dashoffset", values: "0;-12", dur: "1s", repeatCount: "indefinite" }) })), _jsx("g", { transform: "translate(700,150)", children: _jsx("circle", { r: "30", fill: "rgba(0,240,255,0.1)", stroke: "#00f0ff", opacity: step >= 3 ? 1 : 0.4 }) }), step >= 2 && (_jsx("text", { x: "520", y: "135", fill: "#00f0ff", fontSize: "12", children: "GRANTED" }))] }));
}
