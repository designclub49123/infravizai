import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useInfrastructure } from '@/contexts/InfrastructureContext';
import { estimateMonthlyCost } from '@/lib/iac/generator';
import { AWS_RESOURCES } from '@/types/infrastructure';

export default function CostEstimation() {
  const { state } = useInfrastructure();

  const costData = useMemo(() => {
    if (!state.graph) return null;
    return estimateMonthlyCost(state.graph);
  }, [state.graph]);

  if (!costData) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Cost Estimation
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Estimated monthly costs based on default configurations. Actual costs may vary based on usage, region, and instance sizes.</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Total Cost */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Estimated Monthly Cost</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(costData.total)}
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-500/50" />
          </div>

          {/* Breakdown */}
          {costData.breakdown.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Cost Breakdown</h4>
              <div className="space-y-1.5">
                {costData.breakdown
                  .filter((item) => item.cost > 0 || item.count > 0)
                  .sort((a, b) => b.cost - a.cost)
                  .map((item) => {
                    const resource = AWS_RESOURCES[item.type as keyof typeof AWS_RESOURCES];
                    return (
                      <div
                        key={item.type}
                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">
                            {resource?.label || item.type}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            ×{item.count}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">
                            {item.cost > 0 ? formatCurrency(item.cost) : 'Free*'}
                          </span>
                          <Tooltip>
                            <TooltipTrigger>
                              <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                {item.description}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{item.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground">
            *Some services have pay-per-use or free tier pricing. Estimates use us-east-1 pricing and default instance sizes.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
