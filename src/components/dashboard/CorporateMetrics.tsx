import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  TrendingDown, 
  Users, 
  Plane,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

interface CorporateMetricsProps {
  data: {
    monthlySpend: number;
    spendChange: number;
    tripsMade: number;
    employeesTraveling: number;
    budgetUsed: number;
    budgetTotal: number;
    savingsThisMonth: number;
  };
}

const CorporateMetrics = ({ data }: CorporateMetricsProps) => {
  const budgetPercentage = (data.budgetUsed / data.budgetTotal) * 100;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            Company Spend This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${(data.monthlySpend / 1000).toFixed(1)}K
          </div>
          <div className={`flex items-center text-xs mt-1 ${
            data.spendChange < 0 ? 'text-green-600' : 'text-destructive'
          }`}>
            {data.spendChange < 0 ? (
              <ArrowDownRight className="w-3 h-3" />
            ) : (
              <ArrowUpRight className="w-3 h-3" />
            )}
            {Math.abs(data.spendChange)}% vs last month
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Plane className="w-3 h-3" />
            Trips Made
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.tripsMade}</div>
          <div className="text-xs text-muted-foreground mt-1">
            by {data.employeesTraveling} employees
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Users className="w-3 h-3" />
            Budget Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{budgetPercentage.toFixed(0)}%</div>
          <Progress value={budgetPercentage} className="mt-2 h-1.5" />
          <div className="text-xs text-muted-foreground mt-1">
            ${(data.budgetUsed / 1000).toFixed(0)}K of ${(data.budgetTotal / 1000).toFixed(0)}K
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500/10 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            AI Savings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            ${(data.savingsThisMonth / 1000).toFixed(1)}K
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Smart routing savings
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CorporateMetrics;
