export interface RiskAssessment {
    totalScore: number;
    riskLevel: 'Low' | 'Medium' | 'High';
    explanation: string;
    concerns: string[];
    breakdown: {
      memory: string;
      fluency: string;
      clock: string;
      reaction: string;
      digit: string;
    };
  }
  
  export function calculateRiskScore(scores: {
    memory: number;
    fluency: number;
    clock: number;
    reactionTime: number;
    digitSpan: number;
  }): RiskAssessment {
    // Normalize each test to 0-10 scale
    const memoryNorm = (scores.memory / 5) * 10;
    const fluencyNorm = Math.min((scores.fluency / 20) * 10, 10);
    const clockNorm = (scores.clock / 6) * 10;
  
    let reactionNorm = 10;
    if (scores.reactionTime > 700) reactionNorm = 2;
    else if (scores.reactionTime > 600) reactionNorm = 5;
    else if (scores.reactionTime > 500) reactionNorm = 7;
    else if (scores.reactionTime > 400) reactionNorm = 9;
  
    const digitNorm = Math.min((scores.digitSpan / 7) * 10, 10);
  
    // Weighted average (0-100)
    const totalScore = Math.round(
      (memoryNorm * 0.3 + fluencyNorm * 0.25 + clockNorm * 0.2 + reactionNorm * 0.15 + digitNorm * 0.1) * 10
    );
  
    let riskLevel: 'Low' | 'Medium' | 'High';
    if (totalScore >= 70) riskLevel = 'Low';
    else if (totalScore >= 40) riskLevel = 'Medium';
    else riskLevel = 'High';
  
    const concerns: string[] = [];
    if (scores.memory < 3) concerns.push('memory recall');
    if (scores.fluency < 15) concerns.push('verbal fluency');
    if (scores.clock < 4) concerns.push('visual-spatial skills');
    if (scores.reactionTime > 600) concerns.push('processing speed');
    if (scores.digitSpan < 4) concerns.push('working memory');
  
    const breakdown = {
      memory: `Memory: ${scores.memory}/5 words recalled`,
      fluency: `Verbal Fluency: ${scores.fluency} animals named`,
      clock: `Clock Drawing: ${scores.clock}/6`,
      reaction: `Reaction Time: ${scores.reactionTime}ms`,
      digit: `Digit Span: ${scores.digitSpan}/7 sequences`,
    };
  
    let explanation = '';
    if (riskLevel === 'Low') {
      explanation = 'Your cognitive performance is within normal range.';
    } else if (riskLevel === 'Medium') {
      explanation = `Some areas show mild concern: ${concerns.join(', ')}.`;
    } else {
      explanation = `Multiple areas require attention: ${concerns.join(', ')}.`;
    }
  
    return {
      totalScore,
      riskLevel,
      explanation,
      concerns,
      breakdown,
    };
  }
  