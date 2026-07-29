import time
import math
import random
from models import Machine, MachineTelemetry, TelemetryPoint, Alert, KPI, Insight

MACHINE_NAMES = [
    ("Line-A", "Building 1, Floor 1"),
    ("Line-B", "Building 1, Floor 1"),
    ("Mixer-3", "Building 1, Floor 2"),
    ("Press-4", "Building 2, Floor 1"),
    ("Oven-2", "Building 2, Floor 2"),
    ("Packer-1", "Building 3, Floor 1"),
]

STATUSES = ["healthy", "healthy", "healthy", "healthy", "warning", "critical"]

ALERT_CONFIGS = [
    ("temperature", 80.0, 75.0, "High temperature detected on {name}"),
    ("pressure", 5.0, 4.5, "Pressure exceeding normal range on {name}"),
    ("vibration", 2.0, 1.5, "Abnormal vibration levels on {name}"),
    ("efficiency", 95.0, 97.0, "Efficiency drop detected on {name}"),
]


class Simulator:
    def __init__(self):
        self.t0 = time.time()
        self.machines: list[Machine] = []
        self.telemetry: dict[str, MachineTelemetry] = {}
        self.alerts: list[Alert] = []
        self.insights: list[Insight] = []
        self.kpis: list[KPI] = []
        self.baselines: dict[str, dict[str, float]] = {}
        self.anomaly_schedules: dict[str, float] = {}
        self._init_machines()
        self._init_kpis()
        self._seed_initial_data()

    def _init_machines(self):
        for i, (name, loc) in enumerate(MACHINE_NAMES):
            mid = f"m{i+1}"
            temp = random.gauss(65, 8)
            pressure = random.gauss(3.5, 0.6)
            vibration = random.gauss(0.8, 0.3)
            efficiency = random.gauss(97.5, 1.5)
            self.baselines[mid] = {
                "temperature": temp,
                "pressure": pressure,
                "vibration": vibration,
                "efficiency": efficiency,
            }
            self.machines.append(Machine(
                id=mid, name=name, status=STATUSES[i],
                temperature=round(temp, 1), pressure=round(pressure, 2),
                vibration=round(vibration, 2), efficiency=round(efficiency, 1),
                uptime=random.uniform(1000, 50000), utilization=random.uniform(60, 98),
                location=loc,
            ))
            self.telemetry[mid] = MachineTelemetry(machineId=mid)
            self.anomaly_schedules[mid] = 0

    def _init_kpis(self):
        self.kpis = [
            KPI(label="Overall Efficiency", value="97.2%", change=1.2),
            KPI(label="Active Alerts", value="0", change=-3),
            KPI(label="Avg Response Time", value="1.4m", change=-8.5),
            KPI(label="Uptime", value="99.8%", change=0.2),
        ]

    def _seed_initial_data(self):
        now = time.time()
        for i, m in enumerate(self.machines):
            for _ in range(30):
                t_val = int(now * 1000) - (30 - _) * 2000
                noise = random.gauss(0, 1)
                self.telemetry[m.id].temperature.append(TelemetryPoint(t=t_val, v=round(self.baselines[m.id]["temperature"] + noise, 2)))
                self.telemetry[m.id].pressure.append(TelemetryPoint(t=t_val, v=round(self.baselines[m.id]["pressure"] + noise * 0.1, 3)))
                self.telemetry[m.id].vibration.append(TelemetryPoint(t=t_val, v=round(self.baselines[m.id]["vibration"] + abs(noise) * 0.1, 3)))
                self.telemetry[m.id].efficiency.append(TelemetryPoint(t=t_val, v=round(self.baselines[m.id]["efficiency"] + noise * 0.3, 2)))
                self.telemetry[m.id].rpm.append(TelemetryPoint(t=t_val, v=round(random.gauss(1200, 100), 1)))
        # Seed a few alerts for machines 3 and 6
        for mid, mname, metric, val, thresh in [
            (self.machines[2].id, self.machines[2].name, "vibration", 1.8, 1.5),
            (self.machines[5].id, self.machines[5].name, "temperature", 82.4, 75.0),
        ]:
            self.alerts.append(Alert(
                id=f"a{int(now * 1000)}_{mid}_seed",
                machineId=mid, machineName=mname,
                severity="warning", message=f"Abnormal {metric} levels on {mname}",
                metric=metric, value=val, threshold=thresh,
                timestamp=(now - 10) * 1000,
            ))
        self.insights.append(Insight(
            id=f"i{int(now * 1000)}_seed",
            type="info", title="System monitoring active",
            description="All sensors are reporting. PulseOps is analyzing telemetry streams for anomalies and will flag any deviations from normal operating ranges.",
            timestamp=(now - 20) * 1000,
        ))

    def tick(self) -> list[dict]:
        now = time.time()
        elapsed = now - self.t0
        messages = []
        alert_count = 0

        for m in self.machines:
            mid = m.id
            bl = self.baselines[mid]
            t = int(elapsed * 1000)

            # Check for anomaly schedule
            if mid in self.anomaly_schedules and self.anomaly_schedules[mid] > 0:
                self.anomaly_schedules[mid] -= 1
                anomaly_factor = 1.0 + 0.3 * math.sin(elapsed * 0.5 + hash(mid) % 10)
            else:
                anomaly_factor = 1.0
                # Randomly start anomaly
                if random.random() < 0.008:
                    self.anomaly_schedules[mid] = random.randint(15, 60)

            temp = bl["temperature"] * anomaly_factor + random.gauss(0, 1.5)
            pressure = bl["pressure"] * anomaly_factor + random.gauss(0, 0.12)
            vibration = bl["vibration"] * (1 if anomaly_factor == 1.0 else anomaly_factor * 1.5) + random.gauss(0, 0.08)
            efficiency = bl["efficiency"] - (anomaly_factor - 1.0) * 10 + random.gauss(0, 0.5)

            temp = max(20, min(120, temp))
            pressure = max(0, min(10, pressure))
            vibration = max(0, min(5, vibration))
            efficiency = max(50, min(100, efficiency))

            pt = TelemetryPoint(t=t, v=round(temp, 2))
            pp = TelemetryPoint(t=t, v=round(pressure, 3))
            pv = TelemetryPoint(t=t, v=round(vibration, 3))
            pe = TelemetryPoint(t=t, v=round(efficiency, 2))
            pr = TelemetryPoint(t=t, v=round(random.gauss(1200, 100), 1))

            tele = self.telemetry[mid]
            tele.temperature.append(pt)
            tele.pressure.append(pp)
            tele.vibration.append(pv)
            tele.efficiency.append(pe)
            tele.rpm.append(pr)

            # Keep last 120 points
            MAX_POINTS = 120
            for key in ["temperature", "pressure", "vibration", "efficiency", "rpm"]:
                arr = getattr(tele, key)
                if len(arr) > MAX_POINTS:
                    setattr(tele, key, arr[-MAX_POINTS:])

            # Update machine status
            if efficiency < 90 or temp > 90:
                new_status = "critical"
            elif efficiency < 95 or temp > 80:
                new_status = "warning"
            else:
                new_status = "healthy"

            if new_status != m.status:
                m.status = new_status
                messages.append({"type": "machine_update", "machine": m.model_dump()})

            m.temperature = round(temp, 1)
            m.pressure = round(pressure, 2)
            m.vibration = round(vibration, 2)
            m.efficiency = round(efficiency, 1)

            # Check alerts
            for metric, threshold_high, threshold_low, template in ALERT_CONFIGS:
                val = {
                    "temperature": temp, "pressure": pressure,
                    "vibration": vibration, "efficiency": efficiency,
                }[metric]
                triggered = False
                if metric == "efficiency":
                    if val < threshold_low:
                        triggered = True
                else:
                    if val > threshold_high:
                        triggered = True

                if triggered and random.random() < 0.15:
                    severity = "critical" if abs(val - threshold_high) / threshold_high > 0.1 else "warning"
                    alert_count += 1
                    alert = Alert(
                        id=f"a{int(now * 1000)}_{mid}_{metric}",
                        machineId=mid, machineName=m.name,
                        severity=severity,
                        message=template.format(name=m.name),
                        metric=metric, value=round(val, 2),
                        threshold=threshold_high,
                        timestamp=now * 1000,
                    )
                    self.alerts.append(alert)
                    messages.append({"type": "alert", "alert": alert.model_dump()})

            # Send telemetry update
            messages.append({
                "type": "telemetry",
                "machineId": mid,
                "data": {
                    "temperature": [p.model_dump() for p in tele.temperature[-3:]],
                    "pressure": [p.model_dump() for p in tele.pressure[-3:]],
                    "vibration": [p.model_dump() for p in tele.vibration[-3:]],
                    "efficiency": [p.model_dump() for p in tele.efficiency[-3:]],
                    "rpm": [p.model_dump() for p in tele.rpm[-3:]],
                },
            })

        # Update KPIs
        active = len([a for a in self.alerts if not a.acknowledged])
        self.kpis[0].value = f"{sum(m.efficiency for m in self.machines) / len(self.machines):.1f}%"
        self.kpis[1].value = str(active)

        messages.append({"type": "kpis", "kpis": [k.model_dump() for k in self.kpis]})

        # Generate insights periodically
        if int(elapsed) % 15 == 0 and random.random() < 0.3:
            for m in self.machines:
                if m.status != "healthy":
                    insight = Insight(
                        id=f"i{int(now * 1000)}_{m.id}",
                        type="warning",
                        title=f"{m.name} showing unusual pattern",
                        description=f"{m.name} has been in '{m.status}' status for the past few minutes. "
                                    f"Temperature ({m.temperature}°C) is above normal operating range. "
                                    f"Consider checking cooling systems.",
                        timestamp=now * 1000,
                    )
                    self.insights.append(insight)
                    messages.append({"type": "insight", "insight": insight.model_dump()})
                    break

        return messages

    def get_init_state(self) -> dict:
        return {
            "type": "init",
            "machines": [m.model_dump() for m in self.machines],
            "kpis": [k.model_dump() for k in self.kpis],
            "alerts": [a.model_dump() for a in self.alerts[-20:]],
            "insights": [i.model_dump() for i in self.insights[-10:]],
            "telemetry": {
                mid: {
                    k: [p.model_dump() for p in getattr(t, k)[-30:]]
                    for k in ["temperature", "pressure", "vibration", "efficiency", "rpm"]
                }
                for mid, t in self.telemetry.items()
            },
        }
