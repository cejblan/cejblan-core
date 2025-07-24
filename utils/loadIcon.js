const iconLibraries = {
  fa: () => import("react-icons/fa"),
  ai: () => import("react-icons/ai"),
  io: () => import("react-icons/io"),
  io5: () => import("react-icons/io5"),
  md: () => import("react-icons/md"),
  pi: () => import("react-icons/pi"),
  ri: () => import("react-icons/ri"),
  ti: () => import("react-icons/ti"),
  vsc: () => import("react-icons/vsc"),
  gr: () => import("react-icons/gr"),
  lia: () => import("react-icons/lia"),
  lu: () => import("react-icons/lu"),
};

export async function loadIcon({ lib, name }) {
  if (!lib || !name) return null;

  const importLib = iconLibraries[lib.toLowerCase()];
  if (!importLib) return null;

  const icons = await importLib();
  return icons[name] || null;
}
