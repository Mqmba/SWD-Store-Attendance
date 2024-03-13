// DOM elements
const itemList = document.getElementById('item-list');
const dateChoice = document.getElementById('date-choice');

dateChoice.valueAsDate = new Date();

async function renderItems() {
  const formData = new FormData();
  formData.append('day', dateChoice.value);

  const response = await fetch('api/shift/schedule', {
    method: 'POST',
    body: formData,
  });
  const result = await response.json();

  const data = result.data;

  // Clear previous items
  itemList.innerHTML = '';
  for (let row = 1; row <= 4; row++) {
    const tr = document.createElement('tr');
    const cell = document.createElement('td');
    cell.innerHTML = 'Shift ' + row;
    tr.appendChild(cell);
    for (let col = 0; col <= 6; col++) {
      const cell = document.createElement('td');
      data.forEach((shift) => {
        const day = new Date(shift.day);
        if (shift.shiftNo === row && day.getDay() === col) {
          cell.innerHTML =
            day.toISOString() +
            '<button onclick="callUpdate(\'' +
            shift.id +
            '\')">Edit🔄️</button><button onclick="callDelete(\'' +
            shift.id +
            '\')">Delete❎</button>';
        } else cell.innerHTML = '‎ ';
      });

      tr.appendChild(cell);
    }
    itemList.appendChild(tr);
  }
}

dateChoice.addEventListener('change', () => {
  renderItems();
});

async function callAdd() {
  window.location.href = '/shift/form/add';
}

async function callUpdate(id) {
  localStorage.setItem('id', id);
  window.location.href = '/shift/form/update';
}

async function callDelete(id) {
  const formData = new FormData();
  formData.append('id', id);
  await fetch('api/shift', {
    method: 'DELETE',
    body: formData,
  });
  renderItems();
}

// Initial render
renderItems();
