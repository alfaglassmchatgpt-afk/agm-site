// Select an existing configurator option; quote state remains owned by the shared app.
document.querySelectorAll('[data-triplex-variant]').forEach(link => {
  link.addEventListener('click', () => {
    const choice = Array.from(document.querySelectorAll('#material-request input[name="base"]'))
      .find(input => input.value === link.dataset.triplexVariant);
    if (choice) {
      choice.checked = true;
      choice.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
});
