function isMacOS() {
  if (typeof navigator !== 'undefined') {
    return navigator.userAgent.includes('Mac');
  }
  return false;
}

function getMod() {
  return isMacOS() ? '⌘' : '^';
}

export function Shortcut({ keys }: { keys: Array<string> }) {
  return (
    <span className="inline-flex gap-1">
      {keys.flatMap((key, i) => {
        const kbd = (
          <kbd
            key={key}
            className="px-2 text-sm font-medium bg-white border border-gray-200 rounded-sm shadow-sm flex justify-center items-center"
          >
            {key === 'mod' ? getMod() : key}
          </kbd>
        );
        return i < keys.length - 1
          ? [
              kbd,
              <span key={`${key}+`} className="text-gray-500">
                +
              </span>,
            ]
          : [kbd];
      })}
    </span>
  );
}

export function Paste() {
  return <Shortcut keys={['mod', 'v']} />;
}
