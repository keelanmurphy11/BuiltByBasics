(function () {
  const root = document.getElementById('program-viewer');
  if (!root || typeof PROGRAMS_BY_COLLECTION === 'undefined' || typeof MOVEMENT_PATTERNS === 'undefined') {
    return;
  }

  const collectionId = root.dataset.collection;
  const programs = PROGRAMS_BY_COLLECTION[collectionId];
  if (!programs || !programs.length) return;

  function getPatternLabel(patternId) {
    const pattern = MOVEMENT_PATTERNS[patternId];
    return pattern ? pattern.label : patternId;
  }

  function getPatternExamples(patternId) {
    const pattern = MOVEMENT_PATTERNS[patternId];
    return pattern && pattern.examples ? pattern.examples : [];
  }

  function formatExamples(examples) {
    return examples.join(' · ');
  }

  function buildSlotRow(slot, index) {
    const row = document.createElement('li');
    row.className = 'workout-slot';

    const number = document.createElement('span');
    number.className = 'workout-slot__number';
    number.textContent = String(index + 1);
    row.appendChild(number);

    const body = document.createElement('div');
    body.className = 'workout-slot__body';

    if (slot.choice && slot.choice.length) {
      row.classList.add('workout-slot--choice');

      const label = document.createElement('p');
      label.className = 'workout-slot__pattern';
      label.textContent = 'Choose one';
      body.appendChild(label);

      slot.choice.forEach(function (patternId, choiceIndex) {
        const group = document.createElement('div');
        group.className = 'workout-slot__choice-group';

        const groupLabel = document.createElement('span');
        groupLabel.className = 'workout-slot__choice-label';
        groupLabel.textContent = getPatternLabel(patternId);

        const examples = document.createElement('p');
        examples.className = 'workout-slot__examples';
        examples.textContent = formatExamples(getPatternExamples(patternId));

        group.appendChild(groupLabel);
        group.appendChild(examples);
        body.appendChild(group);

        if (choiceIndex < slot.choice.length - 1) {
          const divider = document.createElement('span');
          divider.className = 'workout-slot__or';
          divider.textContent = 'or';
          body.appendChild(divider);
        }
      });
    } else if (slot.patternId) {
      const label = document.createElement('p');
      label.className = 'workout-slot__pattern';
      label.textContent = getPatternLabel(slot.patternId);
      body.appendChild(label);

      const examples = document.createElement('p');
      examples.className = 'workout-slot__examples';
      examples.textContent = formatExamples(getPatternExamples(slot.patternId));
      body.appendChild(examples);
    }

    row.appendChild(body);
    return row;
  }

  function buildWorkoutSheet(program) {
    const sheet = document.createElement('article');
    sheet.className = 'workout-sheet';
    sheet.id = program.id;
    sheet.hidden = true;

    if (program.intro) {
      const intro = document.createElement('p');
      intro.className = 'workout-sheet__intro';
      intro.textContent = program.intro;
      sheet.appendChild(intro);
    }

    if (program.guidance) {
      const guidance = document.createElement('p');
      guidance.className = 'workout-sheet__guidance';
      guidance.textContent = program.guidance;
      sheet.appendChild(guidance);
    }

    if (program.slots && program.slots.length) {
      const list = document.createElement('ol');
      list.className = 'workout-sheet__slots';

      program.slots.forEach(function (slot, index) {
        list.appendChild(buildSlotRow(slot, index));
      });

      sheet.appendChild(list);
    }

    if (program.accessories && program.accessories.length) {
      const accessoriesSection = document.createElement('div');
      accessoriesSection.className = 'workout-sheet__accessories';

      const accessoriesLabel = document.createElement('h3');
      accessoriesLabel.className = 'workout-sheet__accessories-label';
      accessoriesLabel.textContent = 'Accessories';

      const accessoriesList = document.createElement('ul');
      accessoriesList.className = 'workout-sheet__accessories-list';

      program.accessories.forEach(function (item) {
        const li = document.createElement('li');
        li.textContent = item;
        accessoriesList.appendChild(li);
      });

      accessoriesSection.appendChild(accessoriesLabel);
      accessoriesSection.appendChild(accessoriesList);
      sheet.appendChild(accessoriesSection);
    }

    const footer = document.createElement('p');
    footer.className = 'workout-sheet__footer';
    footer.innerHTML =
      '<a href="programs.html#movement-patterns">View all movement patterns</a>';
    sheet.appendChild(footer);

    return sheet;
  }

  const tabs = document.createElement('div');
  tabs.className = 'program-day-tabs';
  tabs.setAttribute('role', 'tablist');

  const sheetsContainer = document.createElement('div');
  sheetsContainer.className = 'program-viewer__sheets';

  programs.forEach(function (program, index) {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'program-day-tabs__tab' + (index === 0 ? ' program-day-tabs__tab--active' : '');
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    tab.setAttribute('aria-controls', program.id);
    tab.id = 'tab-' + program.id;
    tab.textContent = program.title;

    const sheet = buildWorkoutSheet(program);
    sheet.setAttribute('role', 'tabpanel');
    sheet.setAttribute('aria-labelledby', tab.id);
    if (index === 0) {
      sheet.hidden = false;
    }

    tab.addEventListener('click', function () {
      tabs.querySelectorAll('.program-day-tabs__tab').forEach(function (btn) {
        btn.classList.remove('program-day-tabs__tab--active');
        btn.setAttribute('aria-selected', 'false');
      });
      sheetsContainer.querySelectorAll('.workout-sheet').forEach(function (panel) {
        panel.hidden = true;
      });

      tab.classList.add('program-day-tabs__tab--active');
      tab.setAttribute('aria-selected', 'true');
      sheet.hidden = false;
    });

    tabs.appendChild(tab);
    sheetsContainer.appendChild(sheet);
  });

  root.appendChild(tabs);
  root.appendChild(sheetsContainer);
})();
