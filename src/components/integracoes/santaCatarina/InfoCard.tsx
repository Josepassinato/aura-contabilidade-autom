
import React from 'react';
import { LucideIcon } from "lucide-react";

interface InfoCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  items?: string[];
  className?: string;
}

export function InfoCard({ icon: Icon, title, description, items = [], className = "bg-blue-50 border-blue-200 text-blue-800 text-blue-700" }: InfoCardProps) {
  // Extract color classes based on the className prop
  const iconColor = className.includes("amber") ? "text-amber-500" : "text-blue-500";
  const titleColor = className.includes("amber") ? "text-amber-800" : "text-blue-800";
  const textColor = className.includes("amber") ? "text-amber-700" : "text-blue-700";
  
  return (
    <div className={`border rounded-md p-4 mb-6 ${className}`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 ${iconColor} mt-0.5`} />
        <div>
          <h4 className={`text-sm font-medium ${titleColor}`}>{title}</h4>
          <p className={`text-sm ${textColor} mt-1`}>{description}</p>
          {items.length > 0 && (
            <ul className={`mt-2 text-sm ${textColor} list-disc list-inside`}>
              {items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
