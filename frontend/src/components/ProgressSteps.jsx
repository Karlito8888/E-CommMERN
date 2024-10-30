const ProgressSteps = ({ step1, step2, step3 }) => {
  return (
    <div className="progress-steps">
      <div className={step1 ? "active-step" : "inactive-step"}>
        <span className="step-label">Login</span>
        <div className="step-icon">✅</div>
      </div>

      {step2 && (
        <>
          {step1 && <div className="step-line"></div>}
          <div className={step1 ? "active-step" : "inactive-step"}>
            <span className="step-label">Shipping</span>
            <div className="step-icon">✅</div>
          </div>
        </>
      )}

      <>
        {step1 && step2 && step3 && <div className="step-line"></div>}
        <div className={step3 ? "active-step" : "inactive-step"}>
          <span className={`step-label ${!step3 ? "step-summary-offset" : ""}`}>
            Summary
          </span>
          {step1 && step2 && step3 && <div className="step-icon">✅</div>}
        </div>
      </>
    </div>
  );
};

export default ProgressSteps;
