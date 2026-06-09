import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const LogoRotating = ({ size = 32, inverted = true, }) => {
    const stroke = inverted ? '#ffffff' : '#000000';
    return (_jsxs("div", { style: {
            width: size,
            height: size,
        }, children: [_jsxs("svg", { viewBox: "0 0 100 100", width: "100%", height: "100%", style: {
                    transformOrigin: 'center',
                    animation: 'rotateCompass 4s ease-in-out infinite',
                }, children: [_jsx("circle", { cx: "50", cy: "50", r: "28", stroke: stroke, strokeWidth: "2", fill: "none" }), _jsxs("g", { style: {
                            transformOrigin: 'center',
                            animation: 'rotateCompassReverse 4s ease-in-out infinite',
                        }, children: [_jsx("line", { x1: "50", y1: "20", x2: "50", y2: "80", stroke: stroke, strokeWidth: "2" }), _jsx("line", { x1: "20", y1: "50", x2: "80", y2: "50", stroke: stroke, strokeWidth: "2" }), _jsx("line", { x1: "30", y1: "30", x2: "70", y2: "70", stroke: stroke, strokeWidth: "1.5" }), _jsx("line", { x1: "70", y1: "30", x2: "30", y2: "70", stroke: stroke, strokeWidth: "1.5" })] }), _jsx("g", { style: {
                            transformOrigin: 'center',
                            animation: 'rotateCompass 6s ease-in-out infinite',
                        }, children: [0, 60, 120, 180, 240, 300].map((angle, i) => {
                            const rad = (angle * Math.PI) / 180;
                            const x = 50 + 38 * Math.cos(rad);
                            const y = 50 + 38 * Math.sin(rad);
                            return (_jsx("circle", { cx: x, cy: y, r: "3", fill: stroke }, i));
                        }) }), _jsx("circle", { cx: "50", cy: "50", r: "3", fill: stroke })] }), _jsx("style", { children: `
        @keyframes rotateCompass {
          0%   { transform: rotate(-25deg); }
          50%  { transform: rotate(25deg); }
          100% { transform: rotate(-25deg); }
        }

        @keyframes rotateCompassReverse {
          0%   { transform: rotate(25deg); }
          50%  { transform: rotate(-25deg); }
          100% { transform: rotate(25deg); }
        }
      ` })] }));
};
