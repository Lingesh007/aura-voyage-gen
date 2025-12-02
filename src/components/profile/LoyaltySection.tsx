import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Star, Gift, TrendingUp } from "lucide-react";

interface LoyaltyData {
  total_points: number;
  current_tier: string;
  points_this_year: number;
  lifetime_points: number;
}

interface LoyaltySectionProps {
  loyaltyData: LoyaltyData | null;
}

const tierThresholds = {
  bronze: { min: 0, max: 5000, next: 'silver' },
  silver: { min: 5000, max: 15000, next: 'gold' },
  gold: { min: 15000, max: 35000, next: 'platinum' },
  platinum: { min: 35000, max: 100000, next: null }
};

const tierColors = {
  bronze: 'bg-amber-600',
  silver: 'bg-slate-400',
  gold: 'bg-yellow-500',
  platinum: 'bg-gradient-to-r from-purple-500 to-pink-500'
};

const rewards = [
  { points: 1000, reward: 'Free airport lounge access', icon: <Gift className="w-4 h-4" /> },
  { points: 2500, reward: 'Priority boarding', icon: <Star className="w-4 h-4" /> },
  { points: 5000, reward: 'Free flight upgrade', icon: <TrendingUp className="w-4 h-4" /> },
  { points: 10000, reward: 'Free hotel night', icon: <Award className="w-4 h-4" /> },
];

export const LoyaltySection = ({ loyaltyData }: LoyaltySectionProps) => {
  const data = loyaltyData || {
    total_points: 0,
    current_tier: 'bronze',
    points_this_year: 0,
    lifetime_points: 0
  };

  const currentTierInfo = tierThresholds[data.current_tier as keyof typeof tierThresholds] || tierThresholds.bronze;
  const progressToNext = currentTierInfo.next 
    ? ((data.total_points - currentTierInfo.min) / (currentTierInfo.max - currentTierInfo.min)) * 100
    : 100;
  const pointsToNext = currentTierInfo.max - data.total_points;

  return (
    <div className="space-y-4">
      <h2 className="font-luxury text-xl md:text-2xl font-bold text-foreground">
        Loyalty Program
      </h2>
      
      {/* Tier Status Card */}
      <Card className="p-4 md:p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className={`w-16 h-16 rounded-full ${tierColors[data.current_tier as keyof typeof tierColors]} flex items-center justify-center`}>
            <Award className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <h3 className="text-xl font-bold text-foreground capitalize">{data.current_tier} Member</h3>
              <Badge variant="outline" className="text-xs">
                {data.total_points.toLocaleString()} pts
              </Badge>
            </div>
            {currentTierInfo.next && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {pointsToNext.toLocaleString()} points to {currentTierInfo.next}
                </p>
                <Progress value={progressToNext} className="h-2" />
              </div>
            )}
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{data.points_this_year.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Points this year</p>
          </div>
        </div>
      </Card>

      {/* Points Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 bg-card border border-border">
          <p className="text-2xl font-bold text-foreground">{data.total_points.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Available Points</p>
        </Card>
        <Card className="p-4 bg-card border border-border">
          <p className="text-2xl font-bold text-foreground">{data.lifetime_points.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Lifetime Points</p>
        </Card>
      </div>

      {/* Available Rewards */}
      <Card className="p-4 bg-card border border-border">
        <h4 className="font-semibold text-sm text-foreground mb-3">Available Rewards</h4>
        <div className="space-y-2">
          {rewards.map((reward, index) => (
            <div 
              key={index} 
              className={`flex items-center justify-between p-2 rounded-lg ${
                data.total_points >= reward.points ? 'bg-primary/10' : 'bg-muted/30'
              }`}
            >
              <div className="flex items-center gap-2">
                {reward.icon}
                <span className={`text-sm ${data.total_points >= reward.points ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {reward.reward}
                </span>
              </div>
              <Badge variant={data.total_points >= reward.points ? "default" : "outline"} className="text-xs">
                {reward.points.toLocaleString()} pts
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
