import React from 'react';
import { Check } from 'lucide-react';

export const ProgressSteps = ({ currentStep, steps }) => {
  return (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {steps.map((step, index) => {
        const isCompleted = currentStep > index + 1;
        const isCurrent = currentStep === index + 1;
        
        return (
          <React.Fragment key={index}>
            <div className="flex items-center">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${isCompleted 
                    ? 'bg-green-500 text-white' 
                    : isCurrent
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                `}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div 
                className={`h-0.5 w-10 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}; 