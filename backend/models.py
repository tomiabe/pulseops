from pydantic import BaseModel
from typing import Any


class TelemetryPoint(BaseModel):
    t: float
    v: float


class MachineTelemetry(BaseModel):
    machineId: str
    temperature: list[TelemetryPoint] = []
    pressure: list[TelemetryPoint] = []
    vibration: list[TelemetryPoint] = []
    efficiency: list[TelemetryPoint] = []
    rpm: list[TelemetryPoint] = []


class Machine(BaseModel):
    id: str
    name: str
    status: str
    temperature: float
    pressure: float
    vibration: float
    efficiency: float
    uptime: float
    utilization: float
    location: str


class Alert(BaseModel):
    id: str
    machineId: str
    machineName: str
    severity: str
    message: str
    metric: str
    value: float
    threshold: float
    timestamp: float
    acknowledged: bool = False


class KPI(BaseModel):
    label: str
    value: str
    change: float
    unit: str = ""


class Insight(BaseModel):
    id: str
    type: str
    title: str
    description: str
    timestamp: float


class WSMessage(BaseModel):
    type: str
    data: dict[str, Any] | None = None
