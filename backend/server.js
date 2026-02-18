const express = require("express");
const cors = require("cors");
const XLSX = require("xlsx");
const path = require("path"); // เพิ่ม path สำหรับจัดการตำแหน่งไฟล์
const app = express();

// 1. ปรับปรุง CORS ให้รองรับ GitHub Pages ของคุณ
app.use(cors({
    origin: "https://serox5.github.io" 
}));

// ฟังก์ชันช่วยคำนวณสถิติ
const getStats = (arr) => {
    const validData = arr.filter(v => v !== null && !isNaN(v));
    return {
        avg: validData.length ? validData.reduce((a, b) => a + b, 0) / validData.length : 0,
        min: validData.length ? Math.min(...validData) : 0,
        max: validData.length ? Math.max(...validData) : 0,
        diff: validData.length ? (Math.max(...validData) - Math.min(...validData)) : 0
    };
};

app.get("/api/daily-summary", (req, res) => {
    try {
        const { sheet } = req.query; 
        const targetSheet = sheet || "Manage";
        
        // 2. ใช้ path.join เพื่อให้ Server หาไฟล์ data.xlsx เจอแน่นอน
        const filePath = path.join(__dirname, "data.xlsx");
        const workbook = XLSX.readFile(filePath);
        
        if (!workbook.SheetNames.includes(targetSheet)) {
            return res.status(400).json({ error: `Sheet "${targetSheet}" not found` });
        }

        const worksheet = workbook.Sheets[targetSheet];
        const rows = XLSX.utils.sheet_to_json(worksheet);
        const grouped = {};

        rows.forEach(row => {
            if (!row["Time"]) return;
            // ตรวจสอบ format วันที่ป้องกัน error
            const dateObj = new Date(row["Time"]);
            if (isNaN(dateObj)) return; 
            const dateKey = dateObj.toISOString().split("T")[0];

            if (!grouped[dateKey]) {
                grouped[dateKey] = {
                    at1_flow: [], at2_flow: [],
                    at1_orp: [], at1_ph: [], at1_temp: [],
                    at2_orp: [], at2_ph: [], at2_temp: [],
                    power: [], energy: [],
                    tb1_sf: [], tb1_sp: [], tb1_dp: [], tb1_ot: [], tb1_dt: [], tb1_fp: [], tb1_pwr: []
                };
            }

            const g = grouped[dateKey];
            g.at1_flow.push(Number(row["AT1_Total_Flow"] || 0));
            g.at2_flow.push(Number(row["AT2_FLow_Total"] || 0));
            g.at1_orp.push(Number(row["AT1_ORP"] || 0));
            g.at1_ph.push(Number(row["AT1_PH"] || 0));
            g.at1_temp.push(Number(row["AT1_temp"] || 0));
            g.at2_orp.push(Number(row["AT2_ORP"] || 0));
            g.at2_ph.push(Number(row["AT2_PH"] || 0));
            g.at2_temp.push(Number(row["AT2_temp"] || 0));
            g.power.push(Number(row["Active Power_Total"] || 0));
            g.energy.push(Number(row["Total_Energy"] || 0));

            g.tb1_sf.push(Number(row["SUCTION FLOW RATE TB1"] || row["SUCTION FLOW RATE"] || 0));
            g.tb1_sp.push(Number(row["SUCTION PRRESSURE TB1"] || row["SUCTION PRRESSURE"] || 0));
            g.tb1_dp.push(Number(row["DISCHARGE PRESSURE TB1"] || row["DISCHARGE PRESSURE"] || 0));
            g.tb1_ot.push(Number(row["OUTSIDE TEMPERATURE TB1"] || row["OUTSIDE TEMPERATURE"] || 0));
            g.tb1_dt.push(Number(row["DISCHARGE TEMPERATURE TB1"] || row["DISCHARGE TEMPERATURE"] || 0));
            g.tb1_fp.push(Number(row["FILTER PRESSURE Tb1"] || row["FILTER PRESSURE"] || 0));
            g.tb1_pwr.push(Number(row["BLOWER POWER TB1"] || row["BLOWER POWER"] || 0));
        });

        const finalData = Object.entries(grouped).map(([date, d]) => {
            const flow1 = getStats(d.at1_flow).diff;
            const flow2 = getStats(d.at2_flow).diff;
            const energyDiff = getStats(d.energy).diff;
            const totalFlow = flow1 + flow2;

            return {
                date,
                performance: totalFlow > 0 ? (energyDiff / totalFlow) : 0,
                flow: { total: totalFlow, at1: flow1, at2: flow2 },
                at1: { orp: getStats(d.at1_orp), ph: getStats(d.at1_ph), temp: getStats(d.at1_temp) },
                at2: { orp: getStats(d.at2_orp), ph: getStats(d.at2_ph), temp: getStats(d.at2_temp) },
                energy: { power: getStats(d.power), total: getStats(d.energy).max },
                tb1: {
                    sf: getStats(d.tb1_sf).avg, sp: getStats(d.tb1_sp).avg, dp: getStats(d.tb1_dp).avg,
                    ot: getStats(d.tb1_ot).avg, dt: getStats(d.tb1_dt).avg, fp: getStats(d.tb1_fp).avg, p: getStats(d.tb1_pwr).avg
                }
            };
        }).sort((a, b) => a.date.localeCompare(b.date));

        res.json(finalData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. ปรับ Port ให้รองรับ Environment Variable ของ Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));