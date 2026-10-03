// Reconstruction System Module for Detective Theory & Deduction
export class ReconstructionSystem {
  constructor() {
    this.requiredClueThreshold = 3; // Unlocks after collecting 3 evidence items

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

    this.reset();
  }

  reset() {
    this.selectedChoices = {
      entry: 'window',
      struggle: 'ambush',
      suspect: 'intruder'
    };
    this.isSubmitted = false;
    this.autoPromptTriggered = false;
  }

  /**
   * Check if theory reconstruction is available based on collected clue count
   */
  isUnlocked(collectedCount) {
    return collectedCount >= this.requiredClueThreshold;
  }

  selectOption(questionId, optionId) {
    this.selectedChoices[questionId] = optionId;
  }

  confirmTheory() {
    this.isSubmitted = true;
    return this.getSummary();
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
}
