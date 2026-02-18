import { useEffect, useState, useMemo } from "react";
import { 
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
    Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';

function Dashboard() {
    const [dailyData, setDailyData] = useState([]); 
    const [viewMode, setViewMode] = useState("daily"); 
    const [chartType, setChartType] = useState("bar");
    
    // state สำหรับเก็บ index ของแท่งที่เมาส์กำลังชี้อยู่
    const [activeIndex, setActiveIndex] = useState(null);

    useEffect(() => {
        fetch("http://localhost:5000/api/daily-summary")
            .then(res => res.json())
            .then(json => {
                const formatted = Object.entries(json)
                    .map(([date, v]) => ({ date, ...v }))
                    .sort((a, b) => new Date(a.date) - new Date(b.date));
                setDailyData(formatted);
            })
            .catch(err => console.error("Fetch error:", err));
    }, []);

    const chartData = useMemo(() => {
        if (viewMode === "daily") return dailyData;
        const monthlyMap = dailyData.reduce((acc, curr) => {
            const monthKey = curr.date.substring(0, 7); 
            if (!acc[monthKey]) {
                acc[monthKey] = { date: monthKey, performance: 0, count: 0 };
            }
            acc[monthKey].performance += curr.performance;
            acc[monthKey].count += 1;
            return acc;
        }, {});

        return Object.values(monthlyMap).map(m => ({
            date: m.date,
            performance: m.performance / m.count 
        }));
    }, [dailyData, viewMode]);

    // ฟังก์ชันสร้าง Tooltip แบบกำหนดเองให้ดู Modern
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: "rgba(30, 41, 59, 0.9)",
                    color: "#fff",
                    padding: "12px",
                    borderRadius: "8px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
                    border: "none",
                    backdropFilter: "blur(4px)"
                }}>
                    <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: "#cbd5e1" }}>{label}</p>
                    <p style={{ margin: 0, fontSize: "16px", fontWeight: "bold", color: "#38bdf8" }}>
                        {payload[0].value.toFixed(3)} 
                        <span style={{ fontSize: "10px", marginLeft: "5px", color: "#fff" }}>kWh/m³</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    const renderStatsCells = (statObj) => (
        <>
            <td style={tdStyle}>{statObj?.avg.toFixed(1)}</td>
            <td style={tdStyle}>{statObj?.min.toFixed(1)}</td>
            <td style={tdStyle}>{statObj?.max.toFixed(1)}</td>
        </>
    );

    return (
        <div style={{ padding: 20, background: "#f3f4f6", minHeight: "100vh", fontFamily: "inherit" }}>
            <h1 style={{ marginBottom: 20, color: "#111827", fontSize: "24px" }}>Operational Analytics Dashboard</h1>

            {/* --- ส่วนควบคุมกราฟ --- */}
            <div style={{ marginBottom: 30 }}>
                <div style={controlBarStyle}>
                    <div>
                        <span style={labelStyle}>Chart Period:</span>
                        <button onClick={() => setViewMode("daily")} style={viewMode === "daily" ? activeBtn : btn}>Daily Trend</button>
                        <button onClick={() => setViewMode("monthly")} style={viewMode === "monthly" ? activeBtn : btn}>Monthly Avg</button>
                    </div>
                    <div>
                        <span style={labelStyle}>Type:</span>
                        <button onClick={() => setChartType("bar")} style={chartType === "bar" ? activeBtn : btn}>Bar</button>
                        <button onClick={() => setChartType("line")} style={chartType === "line" ? activeBtn : btn}>Line</button>
                    </div>
                </div>

                <div style={chartContainerStyle}>
                    <h3 style={{ marginTop: 0, marginBottom: 25, fontSize: "16px", color: "#4b5563", fontWeight: "600" }}>
                        Efficiency Index Performance ({viewMode === "daily" ? "Daily View" : "Monthly Average"})
                    </h3>
                    <div style={{ width: "100%", height: 350 }}>
                        <ResponsiveContainer>
                            {chartType === "bar" ? (
                                <BarChart 
                                    data={chartData}
                                    onMouseLeave={() => setActiveIndex(null)} // ออกจากกราฟแล้วกลับเป็นสีปกติทั้งหมด
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} tickMargin={10} />
                                    <YAxis fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                    <Bar 
                                        dataKey="performance" 
                                        radius={[6, 6, 0, 0]}
                                        onMouseEnter={(data, index) => setActiveIndex(index)} // จับ index เมื่อชี้
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={activeIndex === null || index === activeIndex ? "#2848ab" : "#e2e8f0"} 
                                                style={{ transition: "fill 0.3s ease" }}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            ) : (
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} tickMargin={10} />
                                    <YAxis fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line 
                                        type="monotone" 
                                        dataKey="performance" 
                                        stroke="#0e7490" 
                                        strokeWidth={4} 
                                        dot={{ r: 6, fill: "#12b300", strokeWidth: 2, stroke: "#fff" }}
                                        activeDot={{ r: 7, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* --- ตารางคงเดิมทุกประการ --- */}
            <h3 style={{ color: "#374151", fontSize: "18px", marginBottom: "12px" }}>Daily Detailed Logs</h3>
            <div style={{ overflowX: "auto", background: "white", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th rowSpan={2} style={{...thStyle, background: "#fff", color: "#333"}}>Date</th>
                            <th rowSpan={2} style={{...thStyle, background: "#0e7490"}}>Performance</th>
                            <th colSpan={3} style={{...thStyle, background: "#1f2937"}}>Total Flow (m³)</th>
                            <th colSpan={9} style={{...thStyle, background: "#0369a1"}}>Process (AT1)</th>
                            <th colSpan={9} style={{...thStyle, background: "#15803d"}}>Serum (AT2)</th>
                            <th colSpan={4} style={{...thStyle, background: "#b45309"}}>Energy</th>
                            <th colSpan={7} style={{...thStyle, background: "#a21caf"}}>Turbo Blower-01</th>
                        </tr>
                        <tr>
                            <th style={subThStyle}>Total</th><th style={subThStyle}>AT1</th><th style={subThStyle}>AT2</th>
                            <th style={subThStyle} colSpan={3}>ORP</th><th style={subThStyle} colSpan={3}>pH</th><th style={subThStyle} colSpan={3}>Temp</th>
                            <th style={subThStyle} colSpan={3}>ORP</th><th style={subThStyle} colSpan={3}>pH</th><th style={subThStyle} colSpan={3}>Temp</th>
                            <th style={subThStyle}>Pwr Avg</th><th style={subThStyle}>Total Energy</th><th style={subThStyle}>Min</th><th style={subThStyle}>Max</th>
                            <th style={subThStyle}>S.Flow</th><th style={subThStyle}>S.Press</th><th style={subThStyle}>D.Press</th><th style={subThStyle}>O.Temp</th><th style={subThStyle}>D.Temp</th><th style={subThStyle}>Filter</th><th style={subThStyle}>Power</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dailyData.map((row, idx) => (
                            <tr key={idx} style={idx % 2 === 0 ? {background: "#fff"} : {background: "#f9fafb"}}>
                                <td style={tdStyle}><b>{row.date}</b></td>
                                <td style={{...tdStyle, background: "#ecfeff", fontWeight: "bold"}}>{row.performance.toFixed(3)}</td>
                                <td style={tdStyle}>{row.flow.total.toLocaleString()}</td>
                                <td style={tdStyle}>{row.flow.at1.toLocaleString()}</td>
                                <td style={tdStyle}>{row.flow.at2.toLocaleString()}</td>
                                {renderStatsCells(row.at1.orp)}
                                {renderStatsCells(row.at1.ph)}
                                {renderStatsCells(row.at1.temp)}
                                {renderStatsCells(row.at2.orp)}
                                {renderStatsCells(row.at2.ph)}
                                {renderStatsCells(row.at2.temp)}
                                <td style={tdStyle}>{row.energy.power.avg.toFixed(2)}</td>
                                <td style={tdStyle}>{row.energy.total.toLocaleString()}</td>
                                <td style={tdStyle}>{row.energy.power.min.toFixed(2)}</td>
                                <td style={tdStyle}>{row.energy.power.max.toFixed(2)}</td>
                                <td style={tdStyle}>{row.tb1.sf.toFixed(1)}</td>
                                <td style={tdStyle}>{row.tb1.sp.toFixed(0)}</td>
                                <td style={tdStyle}>{row.tb1.dp.toFixed(0)}</td>
                                <td style={tdStyle}>{row.tb1.ot.toFixed(1)}</td>
                                <td style={tdStyle}>{row.tb1.dt.toFixed(1)}</td>
                                <td style={tdStyle}>{row.tb1.fp.toFixed(1)}</td>
                                <td style={tdStyle}>{row.tb1.p.toFixed(1)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// --- Styles ปรับแต่งให้นิดหน่อยให้เข้ากับกราฟใหม่ ---
const controlBarStyle = {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: "15px", background: "white", padding: "15px 20px",
    borderRadius: "10px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
};

const chartContainerStyle = {
    background: "white", padding: "25px", borderRadius: "12px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)"
};

const labelStyle = { marginRight: "12px", fontWeight: "600", color: "#4b5563", fontSize: "14px" };

const btn = {
    padding: "8px 18px", marginRight: "8px", border: "1px solid #e5e7eb",
    borderRadius: "8px", cursor: "pointer", background: "white",
    fontSize: "13px", color: "#4b5563", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
};

const activeBtn = {
    ...btn, background: "#0e7490", color: "white", borderColor: "#0e7490",
    boxShadow: "0 4px 6px -1px rgba(14, 116, 144, 0.3)"
};

const tableStyle = { minWidth: "3200px", borderCollapse: "collapse", fontSize: "12px" };
const thStyle = { padding: "12px 8px", border: "1px solid #d1d5db", color: "white", textAlign: "center", fontWeight: "bold" };
const subThStyle = { padding: "8px", background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0", fontSize: "11px", textAlign: "center" };
const tdStyle = { padding: "10px 6px", border: "1px solid #f1f5f9", textAlign: "center", color: "#334155" };

export default Dashboard;