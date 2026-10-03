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

  reset() {
    this.selectedChoices = {
      entry: 'window',
      struggle: 'ambush',
      suspect: 'intruder'
    };
    this.secondSelectedChoices = {
      revised_entry: 'self_erasure',
      revised_suspect: 'compromised'
    };
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
    const q1 = this.questions[0].options.find(o => o.id === this.selectedChoices.entry);
    const q2 = this.questions[1].options.find(o => o.id === this.selectedChoices.struggle);
    const q3 = this.questions[2].options.find(o => o.id === this.selectedChoices.suspect);

    return {
      entry: q1 ? q1.label : '',
      struggle: q2 ? q2.label : '',
      suspect: q3 ? q3.label : '',
      isSubmitted: this.isSubmitted
    };
  }

  getSecondSummary() {
    const q1 = this.secondQuestions[0].options.find(o => o.id === this.secondSelectedChoices.revised_entry);
    const q2 = this.secondQuestions[1].options.find(o => o.id === this.secondSelectedChoices.revised_suspect);

    return {
      revisedEntry: q1 ? q1.label : '',
      revisedSuspect: q2 ? q2.label : '',
      isSecondSubmitted: this.isSecondSubmitted
    };
  }
}
