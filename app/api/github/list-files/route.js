export default async function handler(req, res) {
  const { GITHUB_TOKEN, GITHUB_REPO, GITHUB_BRANCH } = process.env;

  if (!GITHUB_TOKEN || !GITHUB_REPO || !GITHUB_BRANCH) {
    return res.status(500).json({ error: 'Faltan variables de entorno' });
  }

  // Carpetas a listar
  const folders = ['components/pages', 'components/editable'];

  try {
    const archivos = [];

    for (const folder of folders) {
      const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${folder}?ref=${GITHUB_BRANCH}`, {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (response.status !== 200) {
        // Ignorar carpeta si no existe
        continue;
      }

      const data = await response.json();

      // Filtrar solo archivos .js, ignorar carpetas y otros tipos
      const archivosCarpeta = data
        .filter(item => item.type === 'file' && item.name.endsWith('.js'))
        .map(item => `${folder}/${item.name}`);

      archivos.push(...archivosCarpeta);
    }

    res.status(200).json({ files: archivos });
  } catch (error) {
    console.error('Error listar archivos GitHub:', error);
    res.status(500).json({ error: 'Error al listar archivos' });
  }
}
