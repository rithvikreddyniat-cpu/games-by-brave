// Reconstruction System Module for Initial & Second Detective Theories
export class ReconstructionSystem {
  constructor() {
    this.requiredClueThreshold = 3; // Unlocks initial reconstruction after collecting 3 evidence items
    this.requiredInkStepsThreshold = 15; // Unlocks second reconstruction after 15 steps in INK_PHASE

    // Phase 1 Questions (Initial Reconstruction before twist)
    this.questions = [
      {
        id: 'entry',
        title: 'I. POINT OF ENTRY',
        evidenceRef: 'Shattered Window & Muddy Footprints',
        options: [
          { id: 'window', label: 'THROUGH THE FIRE ESCAPE WINDOW', desc: 'Shattered glass indicates forced entry from outside.' },
          { id: 'door', label: 'THROUGH THE MAIN DOORWAY', desc: 'The intruder had a key or walked right past security.' }
        ]
      },
      {
        id: 'struggle',
        title: 'II. NATURE OF THE CONFRONTATION',
        evidenceRef: 'Bloodstain & Torn Photograph',
        options: [
          { id: 'ambush', label: 'THE VICTIM WAS AMBUSHED FROM BEHIND', desc: 'No defensive wounds. Surprised at the desk.' },
          { id: 'argument', label: 'A FIERCE ARGUMENT BROKE OUT', desc: 'Personal confrontation that escalated to violence.' }
        ]
      },
      {
        id: 'suspect',
        title: 'III. PRIMARY SUSPECT PROFILE',
        evidenceRef: 'Engraved Lighter ("D.S.")',
        options: [
          { id: 'intruder', label: 'AN UNKNOWN BURGLAR IN HEAVY BOOTS', desc: 'A lone intruder seeking valuables.' },
          { id: 'insider', label: 'AN INSIDER CONNECTED TO THE POLICE', desc: 'Someone who knew the victim and left a personal item.' }
        ]
      }
    ];

    // Phase 2 Questions (Second Reconstruction after ink erasure)
    this.secondQuestions = [
      {
        id: 'revised_entry',
        title: 'I. RE-EVALUATE EVIDENCE INTEGRITY',
        evidenceRef: 'Surviving Clues vs Dark Ink Stains',
        options: [
          { id: 'self_erasure', label: 'MY OWN FOOTSTEPS ERASED CRITICAL PROOF', desc: 'The dark ink trail covered the key clues on the floor.' },
          { id: 'tampered', label: 'SOMEONE ELSE TAMPERED WITH THE PANEL', desc: 'An unknown force corrupted the crime scene evidence.' }
        ]
      },
      {
        id: 'revised_suspect',
        title: 'II. REVISED SUSPECT CONCLUSION',
        evidenceRef: 'Corrupted Panel & Initial Theory Gaps',
        options: [
          { id: 'compromised', label: 'THE DETECTIVE IS INEXTRICABLY LINKED TO THE CRIME', desc: 'Every move by Detective Snake obscures the true perpetrator.' },
          { id: 'framing', label: 'THE EVIDENCE WAS PLANTED TO FRAME DETECTIVE SNAKE', desc: 'The initial clues were staged to mislead the investigation.' }
        ]
      }
    ];

    this.reset();
  }

  reset(caseData = null) {
    if (caseData) {
      this.requiredClueThreshold = caseData.requiredClues || 3;
      if (caseData.questions) {
        this.questions = caseData.questions;
      }
    } else {
      this.requiredClueThreshold = 3;
    }
    this.selectedChoices = {};
    this.secondSelectedChoices = {};
    this.isSubmitted = false;
    this.isSecondSubmitted = false;
    this.autoPromptTriggered = false;
    this.secondAutoPromptTriggered = false;
  }

  /**
   * Check if initial theory reconstruction is available
   */
  isUnlocked(collectedCount) {
    return collectedCount >= this.requiredClueThreshold;
  }

  /**
   * Check if second theory reconstruction is available during INK_PHASE
   */
  isSecondUnlocked(inkStepsCount, lostCount) {
    return inkStepsCount >= this.requiredInkStepsThreshold || lostCount > 0;
  }

  isAllAnswered() {
    if (!this.questions || this.questions.length === 0) return true;
    return this.questions.every(q => !!this.selectedChoices[q.id]);
  }

  isSecondAllAnswered() {
    if (!this.secondQuestions || this.secondQuestions.length === 0) return true;
    return this.secondQuestions.every(q => !!this.secondSelectedChoices[q.id]);
  }

  selectOption(questionId, optionId) {
    this.selectedChoices[questionId] = optionId;
  }

  selectSecondOption(questionId, optionId) {
    this.secondSelectedChoices[questionId] = optionId;
  }

  confirmTheory() {
    this.isSubmitted = true;
    return this.getSummary();
  }

  confirmSecondTheory() {
    this.isSecondSubmitted = true;
    return this.getSecondSummary();
  }

  getSummary() {
    const answers = (this.questions || []).map(q => {
      const opt = q.options.find(o => o.id === this.selectedChoices[q.id]);
      return opt ? opt.label : '';
    });

    return {
      entry: answers[0] || '',
      struggle: answers[1] || '',
      suspect: answers[2] || '',
      summaryText: answers.filter(Boolean).join(' | '),
      isSubmitted: this.isSubmitted
    };
  }

  getSecondSummary() {
    const answers = (this.secondQuestions || []).map(q => {
      const opt = q.options.find(o => o.id === this.secondSelectedChoices[q.id]);
      return opt ? opt.label : '';
    });

    return {
      revisedEntry: answers[0] || '',
      revisedSuspect: answers[1] || '',
      summaryText: answers.filter(Boolean).join(' | '),
      isSecondSubmitted: this.isSecondSubmitted
    };
  }
}
