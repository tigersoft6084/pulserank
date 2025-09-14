"use client";

import { useState } from "react";

interface PlanConstraintsDisplayProps {
  constraints: Record<string, any>;
  isEditable?: boolean;
  editableValuesOnly?: boolean;
  onConstraintsChange?: (constraints: Record<string, any>) => void;
}

export function PlanConstraintsDisplay({
  constraints,
  isEditable = false,
  editableValuesOnly = false,
  onConstraintsChange,
}: PlanConstraintsDisplayProps) {
  const [editingConstraints, setEditingConstraints] =
    useState<Record<string, any>>(constraints);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const handleAddConstraint = () => {
    if (newKey && newValue && onConstraintsChange) {
      const updatedConstraints = {
        ...editingConstraints,
        [newKey]: newValue,
      };
      setEditingConstraints(updatedConstraints);
      onConstraintsChange(updatedConstraints);
      setNewKey("");
      setNewValue("");
    }
  };

  const handleRemoveConstraint = (key: string) => {
    if (onConstraintsChange) {
      const updatedConstraints = { ...editingConstraints };
      delete updatedConstraints[key];
      setEditingConstraints(updatedConstraints);
      onConstraintsChange(updatedConstraints);
    }
  };

  const handleUpdateConstraint = (key: string, value: string) => {
    if (onConstraintsChange) {
      const updatedConstraints = {
        ...editingConstraints,
        [key]: value,
      };
      setEditingConstraints(updatedConstraints);
      onConstraintsChange(updatedConstraints);
    }
  };

  if (Object.keys(constraints).length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg bg-gray-50 py-12 text-sm text-gray-500 dark:bg-gray-700 dark:text-gray-400">
        <div className="text-center">
          <div className="mb-3 text-4xl">📋</div>
          <div className="font-medium">No constraints defined</div>
          <div className="text-xs">Add constraints to customize this plan</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(constraints).map(([key, value]) => (
        <div key={key} className="flex items-center gap-3">
          {isEditable ? (
            <>
              <div className="flex-1">
                <input
                  type="text"
                  value={key}
                  onChange={(e) => {
                    const updatedConstraints = { ...editingConstraints };
                    delete updatedConstraints[key];
                    updatedConstraints[e.target.value] = value;
                    setEditingConstraints(updatedConstraints);
                    onConstraintsChange?.(updatedConstraints);
                  }}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-800"
                  disabled={editableValuesOnly}
                  placeholder="Constraint key"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleUpdateConstraint(key, e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Constraint value"
                />
              </div>
              {!editableValuesOnly && (
                <button
                  type="button"
                  onClick={() => handleRemoveConstraint(key)}
                  className="rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                >
                  Remove
                </button>
              )}
            </>
          ) : (
            <div className="flex w-full items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm dark:bg-gray-800">
              <span className="font-semibold text-dark dark:text-white">
                {key}
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                {String(value)}
              </span>
            </div>
          )}
        </div>
      ))}

      {isEditable && !editableValuesOnly && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 dark:border-gray-600">
          <div className="text-center">
            <div className="mb-3 text-2xl">➕</div>
            <div className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
              Add New Constraint
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Constraint key"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="text"
                placeholder="Constraint value"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddConstraint}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
