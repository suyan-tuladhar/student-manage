function toggleEdit() {
  const button = document.getElementById('toggle-button');
  const table = document.getElementById('details-table');

  // If in view mode, switch to edit mode
  if (button.innerText === 'Edit Details') {
    // Replace each details cell text with an input element containing the current value
    for (let i = 1; i < table.rows.length; i++) {
      const cell = table.rows[i].cells[1];
      const currentText = cell.innerText;
      cell.innerHTML = `<input type="text" value="${currentText}" />`;
    }
    button.innerText = 'Save Details';
  } else {
    // Save mode: read input values and revert cells back to plain text
    for (let i = 1; i < table.rows.length; i++) {
      const cell = table.rows[i].cells[1];
      const input = cell.querySelector('input');
      if (input) {
        cell.innerText = input.value;
      }
    }
    button.innerText = 'Edit Details';
  }
}
