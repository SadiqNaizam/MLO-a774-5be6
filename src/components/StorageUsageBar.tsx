import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HardDrive } from 'lucide-react';

interface StorageUsageBarProps {
  currentUsageInGB: number;
  totalStorageInGB: number;
  label?: string;
}

const StorageUsageBar: React.FC<StorageUsageBarProps> = ({
  currentUsageInGB,
  totalStorageInGB,
  label = "Storage Usage",
}) => {
  console.log('StorageUsageBar loaded');

  const usagePercentage = totalStorageInGB > 0 ? (currentUsageInGB / totalStorageInGB) * 100 : 0;
  const formattedCurrentUsage = currentUsageInGB.toFixed(2);
  const formattedTotalStorage = totalStorageInGB.toFixed(2);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-md font-medium flex items-center">
            <HardDrive className="mr-2 h-5 w-5 text-gray-600" />
            {label}
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {formattedCurrentUsage} GB / {formattedTotalStorage} GB
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Progress value={usagePercentage} className="w-full h-3" aria-label={`${label}: ${usagePercentage.toFixed(0)}% used`} />
        <p className="text-xs text-muted-foreground mt-1 text-right">
          {usagePercentage.toFixed(0)}% used
        </p>
      </CardContent>
    </Card>
  );
};

export default StorageUsageBar;