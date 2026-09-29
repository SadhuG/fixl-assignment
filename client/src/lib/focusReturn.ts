// Where focus goes when a modal closes. Radix only restores focus to a DialogTrigger, and our modals
// are controlled; an autoFocus field inside them also grabs focus before Radix records the opener.
// So we remember the last element focused outside any dialog or menu, and let menus that open
// dialogs (whose triggers never take focus on click) name their trigger explicitly.
let target: HTMLElement | null = null;

document.addEventListener('focusin', (event) => {
  const el = event.target;
  if (el instanceof HTMLElement && !el.closest('[role="dialog"], [role="menu"]')) target = el;
});

export function setFocusReturnTarget(el: HTMLElement | null) {
  if (el) target = el;
}

export function returnFocus(event: Event) {
  if (!target?.isConnected) return;
  event.preventDefault();
  target.focus();
}
