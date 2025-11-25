import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, DollarSign, Calendar, PieChart } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const BudgetTracker = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    };
    checkUser();
  }, [navigate]);

  const budgetData = {
    totalBudget: 50000,
    spent: 32500,
    remaining: 17500,
    categories: [
      { name: "Flights", budget: 20000, spent: 15000, color: "hsl(var(--primary))" },
      { name: "Hotels", budget: 15000, spent: 10500, color: "hsl(var(--secondary))" },
      { name: "Activities", budget: 10000, spent: 5000, color: "hsl(var(--accent))" },
      { name: "Visas", budget: 5000, spent: 2000, color: "hsl(var(--pastel-coral))" }
    ],
    recentExpenses: [
      { description: "Flight to Tokyo", amount: 1250, date: "2024-12-15", category: "Flights" },
      { description: "Hotel in Singapore", amount: 850, date: "2024-12-20", category: "Hotels" },
      { description: "City Tour Package", amount: 350, date: "2024-12-18", category: "Activities" }
    ]
  };

  const spentPercentage = (budgetData.spent / budgetData.totalBudget) * 100;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border backdrop-blur-xl bg-card/90 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-luxury text-4xl font-bold text-foreground mb-8">
            Corporate Budget Tracker
          </h1>

          {/* Budget Overview */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${budgetData.totalBudget.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-secondary/5 to-secondary/10 border-2 border-secondary/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${budgetData.spent.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 border-2 border-accent/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                  <PieChart className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${budgetData.remaining.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Overall Progress */}
          <Card className="p-6 mb-8 border-2 border-border">
            <h2 className="font-luxury text-xl font-bold text-foreground mb-4">
              Overall Budget Usage
            </h2>
            <Progress value={spentPercentage} className="h-3 mb-2" />
            <p className="text-sm text-muted-foreground">
              {spentPercentage.toFixed(1)}% of total budget used
            </p>
          </Card>

          {/* Category Breakdown */}
          <Card className="p-6 mb-8 border-2 border-border">
            <h2 className="font-luxury text-xl font-bold text-foreground mb-6">
              Budget by Category
            </h2>
            <div className="space-y-6">
              {budgetData.categories.map((category) => {
                const percentage = (category.spent / category.budget) * 100;
                return (
                  <div key={category.name}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{category.name}</h3>
                      <div className="text-sm text-muted-foreground">
                        ${category.spent.toLocaleString()} / ${category.budget.toLocaleString()}
                      </div>
                    </div>
                    <Progress 
                      value={percentage} 
                      className="h-2"
                      style={{ 
                        // @ts-ignore
                        '--progress-background': category.color 
                      }}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {percentage.toFixed(1)}% used
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Recent Expenses */}
          <Card className="p-6 border-2 border-border">
            <h2 className="font-luxury text-xl font-bold text-foreground mb-6">
              Recent Expenses
            </h2>
            <div className="space-y-4">
              {budgetData.recentExpenses.map((expense, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{expense.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {expense.category} • {expense.date}
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    ${expense.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BudgetTracker;
