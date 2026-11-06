import { Check } from "lucide-react";
import type { Step } from "../data/mock";

type StepperProps = {
  steps: Step[];
};

export function Stepper({ steps }: StepperProps) {
  return (
    <ol className="stepper">
      {steps.map((step, index) => (
        <li key={step.title} className={`step step--${step.state}`}>
          <i>{step.state === "done" ? <Check size={14} strokeWidth={3} /> : index + 1}</i>
          {step.title}
        </li>
      ))}
    </ol>
  );
}
