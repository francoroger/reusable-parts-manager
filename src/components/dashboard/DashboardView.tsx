import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Part } from "@/types/parts";
import { Archive, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

interface DashboardViewProps {
  parts: Part[];
}

export const DashboardView = ({ parts }: DashboardViewProps) => {
  const activeParts = parts.filter((p) => !p.archived);
  const archivedParts = parts.filter((p) => p.archived);
  const delayedParts = activeParts.filter((p) => p.status === "delayed");
  const warningParts = activeParts.filter((p) => p.status === "warning");
  const ontimeParts = activeParts.filter((p) => p.status === "ontime");

  const pieData = [
    { name: "No Prazo", value: ontimeParts.length, color: "#22c55e" },
    { name: "Próximo", value: warningParts.length, color: "#f59e0b" },
    { name: "Atrasado", value: delayedParts.length, color: "#ef4444" },
  ];

  const timelineData = parts
    .filter((p) => !p.archived)
    .map((part) => ({
      name: `OS #${part.service_order_number}`,
      dias: Math.ceil(
        (new Date(part.expected_return_date).getTime() - new Date().getTime()) /
          (1000 * 3600 * 24)
      ),
    }))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total OS Ativas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeParts.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-status-ontime/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-status-ontime">
              No Prazo
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-status-ontime" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-ontime">
              {ontimeParts.length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-status-warning/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-status-warning">
              Próximo ao Prazo
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-status-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-warning">
              {warningParts.length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-status-delayed/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-status-delayed">
              Atrasados
            </CardTitle>
            <Archive className="h-4 w-4 text-status-delayed" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-delayed">
              {delayedParts.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Distribuição de Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Dias Restantes por OS</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="dias"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};