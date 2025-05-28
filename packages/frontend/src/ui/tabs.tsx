// src/ui/tabs.tsx

import React, { createContext, useContext, ReactNode } from "react";
import classNames from "classnames";

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}
const TabsContext = createContext<TabsContextType | undefined>(undefined);

export interface TabsProps {
  children: ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  defaultValue?: string;
  className?: string;
}

export const Tabs = ({
  children,
  value,
  onValueChange,
  defaultValue,
  className,
}: TabsProps) => (
  <TabsContext.Provider value={{ value, onValueChange }}>
    <div
      className={classNames("tabs", className)}
      data-default={defaultValue}
    >
      {children}
    </div>
  </TabsContext.Provider>
);

export interface TabsListProps {
  children: ReactNode;
  className?: string;
}
export const TabsList = ({ children, className }: TabsListProps) => (
  <div className={classNames("tabs-list", className)}>
    {children}
  </div>
);

export interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}
export const TabsTrigger = ({
  value: triggerValue,
  children,
  className,
}: TabsTriggerProps) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger phải nằm trong Tabs");
  const { value, onValueChange } = context;
  const isActive = value === triggerValue;
  return (
    <button
      type="button"
      className={classNames(
        "tabs-trigger px-4 py-2",
        { "tabs-trigger-active font-bold border-b-2": isActive },
        className
      )}
      onClick={() => onValueChange(triggerValue)}
    >
      {children}
    </button>
  );
};
