import type { Step } from "../data/mock";

type StepperProps = {
  steps: Step[];
};

export function Stepper({ steps }: StepperProps) {
  return (
    <ol className="stepper">
      {steps.map((step, index) => (
        <li key={step.title} className={step.state === "todo" ? "step" : `step step--${step.state}`}>
          <i>{index + 1}</i>
          {step.title}
        </li>
      ))}
    </ol>
  );
}
