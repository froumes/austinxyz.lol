"use client"

import { useState } from "react"
import { Crosshair, Eye, Zap, Palette, Monitor, Settings, Folder, Gamepad2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SettingsPage() {
  const [enabled, setEnabled] = useState(true)
  const [aimMode, setAimMode] = useState("camera")
  const [fov, setFov] = useState([300])
  const [smoothness, setSmoothness] = useState([3.0])
  const [prediction, setPrediction] = useState([0.15])
  const [targetPart, setTargetPart] = useState("head")
  const [teamCheck, setTeamCheck] = useState(true)
  const [visibilityCheck, setVisibilityCheck] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  const navItems = [
    { icon: Crosshair, label: "Aim", active: true },
    { icon: Eye, label: "Visuals", active: false },
    { icon: Zap, label: "Performance", active: false },
    { icon: Palette, label: "Colors", active: false },
    { icon: Monitor, label: "Display", active: false },
    { icon: Settings, label: "Settings", active: false },
    { icon: Folder, label: "Files", active: false },
    { icon: Gamepad2, label: "Controls", active: false },
  ]

  return (
    <div className="min-h-screen bg-[#0a0b0d] flex">
      {/* Left Sidebar */}
      <div
        className={`bg-[#1a1d23] flex flex-col items-center py-6 px-4 rounded-l-2xl transition-all duration-300 overflow-hidden ${
          isHovered ? "w-[200px]" : "w-[80px]"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* macOS window controls */}
        <div className="flex gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>

        {/* Navigation icons */}
        <div className="flex flex-col gap-6 w-full">
          {navItems.map((item, index) => (
            <button
              key={index}
              className={`flex items-center transition-all duration-200 ${
                item.active
                  ? isHovered
                    ? "bg-blue-500 text-white px-3 py-2 rounded-lg gap-3"
                    : "bg-blue-500 text-white p-2 rounded-full w-9 h-9 justify-center mx-auto"
                  : isHovered
                    ? "bg-transparent text-white hover:bg-[#2a2d33] px-3 py-2 rounded-lg gap-3"
                    : "text-white hover:bg-[#2a2d33] p-2 rounded-full w-9 h-9 justify-center mx-auto"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span
                className={`text-sm font-medium whitespace-nowrap transition-all duration-300 overflow-hidden ${
                  isHovered ? "opacity-100 max-w-[120px]" : "opacity-0 max-w-0"
                }`}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col rounded-r-2xl overflow-hidden">
        {/* Header */}
        <div className="h-14 bg-[#1a1d23] flex items-center justify-between px-6 border-b border-[#2a2d33]">
          <div className="text-gray-400 text-sm">nozomi://@nozomi.lol — v0.1.0 (seika)</div>
          <div className="flex gap-3">
            <button className="px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2a2d33] rounded-md transition">
              TOGGLE UI
            </button>
            <button className="px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2a2d33] rounded-md transition">
              RIGHTSHIFT
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        <div className="flex-1 flex">
          <div className="flex-1 px-8 py-6 relative bg-[#1a1d23]/60">
            {/* Main Settings Section */}
            <div className="mb-8">
              <h2 className="text-gray-500 text-xs uppercase tracking-wider mb-6">main settings</h2>

              {/* Enabled Toggle */}
              <div className="flex items-center justify-between mb-6">
                <label className="text-white text-sm font-medium">enabled</label>
                <Switch checked={enabled} onCheckedChange={setEnabled} />
              </div>

              {/* Aim Mode Select */}
              <div className="flex items-center justify-between mb-6">
                <label className="text-white text-sm font-medium">aim mode</label>
                <Select value={aimMode} onValueChange={setAimMode}>
                  <SelectTrigger className="w-32 bg-[#2a2d33] border-none text-white rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="camera">camera</SelectItem>
                    <SelectItem value="memory">memory</SelectItem>
                    <SelectItem value="hybrid">hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* FOV Slider */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-white text-sm font-medium">fov</label>
                  <span className="text-blue-500 text-sm font-semibold">{fov[0]}</span>
                </div>
                <Slider
                  value={fov}
                  onValueChange={setFov}
                  min={0}
                  max={500}
                  step={10}
                  className="[&_[role=slider]]:bg-blue-500 [&_[role=slider]]:border-blue-500"
                />
              </div>

              {/* Smoothness Slider */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-white text-sm font-medium">smoothness</label>
                  <span className="text-blue-500 text-sm font-semibold">{smoothness[0].toFixed(1)}</span>
                </div>
                <Slider
                  value={smoothness}
                  onValueChange={setSmoothness}
                  min={0}
                  max={10}
                  step={0.1}
                  className="[&_[role=slider]]:bg-blue-500 [&_[role=slider]]:border-blue-500"
                />
              </div>

              {/* Prediction Slider */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-white text-sm font-medium">prediction</label>
                  <span className="text-blue-500 text-sm font-semibold">{prediction[0].toFixed(2)}</span>
                </div>
                <Slider
                  value={prediction}
                  onValueChange={setPrediction}
                  min={0}
                  max={1}
                  step={0.01}
                  className="[&_[role=slider]]:bg-blue-500 [&_[role=slider]]:border-blue-500"
                />
              </div>
            </div>

            {/* Targeting Section */}
            <div>
              <h2 className="text-gray-500 text-xs uppercase tracking-wider mb-6">targeting</h2>

              {/* Target Part Select */}
              <div className="flex items-center justify-between mb-6">
                <label className="text-white text-sm font-medium">target part</label>
                <Select value={targetPart} onValueChange={setTargetPart}>
                  <SelectTrigger className="w-32 bg-[#2a2d33] border-none text-white rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="head">Head</SelectItem>
                    <SelectItem value="chest">Chest</SelectItem>
                    <SelectItem value="body">Body</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Team Check Toggle */}
              <div className="flex items-center justify-between mb-6">
                <label className="text-white text-sm font-medium">team check</label>
                <Switch checked={teamCheck} onCheckedChange={setTeamCheck} />
              </div>

              {/* Visibility Check Toggle */}
              <div className="flex items-center justify-between mb-6">
                <label className="text-white text-sm font-medium">visibility check</label>
                <Switch checked={visibilityCheck} onCheckedChange={setVisibilityCheck} />
              </div>
            </div>
          </div>

          {/* Right Blue Border */}
          <div className="w-1 bg-blue-500" />
        </div>
      </div>
    </div>
  )
}
