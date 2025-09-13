import { list, put, del } from '@vercel/blob';
import { NextResponse } from 'next/server';

// Util: limpia ruta (quita slash inicial/final)
const normalizeFolder = (folder) => {
  if (!folder) return '';
  return folder.replace(/^\/+|\/+$/g, '');
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '36');
  const folderParam = searchParams.get('folder') || ''; // puede ser '' o 'carpeta/sub'

  const folder = normalizeFolder(folderParam); // '' para raíz

  try {
    const { blobs } = await list();

    // Filtramos solo imágenes por extensión
    const imagenes = blobs.filter(blob =>
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(blob.pathname)
    );

    // Queremos devolver solo hijos inmediatos del folder
    const foldersMap = new Map(); // nombre -> { name, pathname }
    const files = [];

    imagenes.forEach(img => {
      const parts = img.pathname.split('/');
      if (!folder) {
        // root: si parts.length === 1 => archivo en raíz; si > 1 => subcarpeta
        if (parts.length === 1) {
          files.push({ type: 'file', name: parts[0], pathname: img.pathname, url: img.url, uploadedAt: img.uploadedAt });
        } else {
          const sub = parts[0];
          if (!foldersMap.has(sub)) {
            foldersMap.set(sub, { type: 'folder', name: sub, pathname: sub });
          }
        }
      } else {
        const prefix = folder + '/';
        if (img.pathname.startsWith(prefix)) {
          const rest = img.pathname.slice(prefix.length); // lo que queda después de folder/
          const restParts = rest.split('/');
          if (restParts.length === 1) {
            // archivo en la carpeta actual
            files.push({ type: 'file', name: restParts[0], pathname: img.pathname, url: img.url, uploadedAt: img.uploadedAt });
          } else {
            // pertenece a una subcarpeta inmediata
            const sub = restParts[0];
            const subPath = folder ? `${folder}/${sub}` : sub;
            if (!foldersMap.has(subPath)) {
              foldersMap.set(subPath, { type: 'folder', name: sub, pathname: subPath });
            }
          }
        }
      }
    });

    // Orden: folders primero (alfabético), luego files por uploadedAt descendente
    const folders = Array.from(foldersMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    const items = [...folders, ...files];

    const total = items.length;
    const totalPaginas = Math.ceil(total / limit);
    const inicio = (page - 1) * limit;
    const paginaActual = items.slice(inicio, inicio + limit);

    return NextResponse.json({
      items: paginaActual,
      totalPaginas
    });
  } catch (err) {
    console.error('Error al listar imágenes:', err);
    return NextResponse.json({ error: 'Error al listar imágenes' }, { status: 500 });
  }
}

// POST maneja dos acciones:
// ?action=check  -> revisar conflictos (no sube nada si hay conflictos)
// ?action=commit -> subir archivos según acciones aprobadas
export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const action = (searchParams.get('action') || 'check').toLowerCase();
  const folderParam = searchParams.get('folder') || '';
  const folder = normalizeFolder(folderParam);
  try {
    const formData = await request.formData();

    // obtener todos los archivos enviados
    let files = formData.getAll('images');
    // soporte para 'image' single por compatibilidad
    if (!files || files.length === 0) {
      const single = formData.get('image');
      if (single) files = [single];
    }

    // Normalizar files: puede haber elementos no-files si el cliente envía otras cosas
    files = files.filter(Boolean);

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No se recibieron archivos' }, { status: 400 });
    }

    // obtener lista actual de blobs para detectar colisiones
    const { blobs } = await list();
    const existingSet = new Set(blobs.map(b => b.pathname));

    if (action === 'check') {
      // revisar colisiones usando nombre y carpeta actual
      const conflicts = [];
      const candidates = [];

      files.forEach((file, idx) => {
        // determinar nombre final deseado
        // si file.name no existe, construimos uno genérico
        let name = file.name || `upload-${Date.now()}`;
        name = name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-_]/g, '');
        const targetPath = folder ? `${folder}/${name}` : name;
        candidates.push({ idx, name, pathname: targetPath, size: file.size, type: file.type });

        if (existingSet.has(targetPath)) {
          // encontrar el blob correspondiente para info
          const blob = blobs.find(b => b.pathname === targetPath);
          conflicts.push({
            idx,
            name,
            pathname: targetPath,
            existing: {
              url: blob?.url || null,
              pathname: blob?.pathname,
              uploadedAt: blob?.uploadedAt
            },
            nuevo: {
              size: file.size,
              type: file.type
            }
          });
        }
      });

      if (conflicts.length > 0) {
        // 409 para indicar que hay conflictos y el frontend debe mostrar modal
        return NextResponse.json({ conflicts }, { status: 409 });
      }

      // si no hay conflictos, subimos todo directamente
      const uploads = [];
      for (const c of candidates) {
        const file = files[c.idx];
        const blob = await put(c.pathname, file, { access: 'public', addRandomSuffix: false });
        uploads.push({ url: blob.url, pathname: blob.pathname });
      }

      return NextResponse.json({ uploads });
    } else if (action === 'commit') {
      // esperamos recibir un campo 'actions' con JSON con arreglo acciones por índice:
      // actions = [{ idx: 0, action: 'skip'|'replace'|'keep-both', rename: 'nuevoNombre.png' }, ...]
      const actionsRaw = formData.get('actions');
      if (!actionsRaw) {
        return NextResponse.json({ error: 'Faltan acciones para commit' }, { status: 400 });
      }
      const actions = JSON.parse(String(actionsRaw));

      const uploads = [];

      for (const act of actions) {
        const { idx, action: actType, rename } = act;
        const file = files[idx];
        if (!file) continue;

        // nombre base
        let name = file.name || `upload-${Date.now()}`;
        name = name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-_]/g, '');

        let targetName;
        if (actType === 'skip') {
          // no hacemos nada
          continue;
        } else if (actType === 'replace') {
          targetName = rename && rename.trim() ? rename.replace(/^\/+|\/+$/g, '') : name;
          const targetPath = folder ? `${folder}/${targetName}` : targetName;
          const blob = await put(targetPath, file, { access: 'public', allowOverwrite: true });
          uploads.push({ url: blob.url, pathname: blob.pathname });
        } else if (actType === 'keep-both') {
          // si viene un rename lo usamos; si no, generamos sufijo único
          if (rename && rename.trim()) {
            targetName = rename.replace(/^\/+|\/+$/g, '');
            const targetPath = folder ? `${folder}/${targetName}` : targetName;
            // evitar colisión: si existe, usar addRandomSuffix
            if (existingSet.has(targetPath)) {
              const blob = await put(targetPath, file, { access: 'public', addRandomSuffix: true });
              uploads.push({ url: blob.url, pathname: blob.pathname });
            } else {
              const blob = await put(targetPath, file, { access: 'public', addRandomSuffix: false });
              uploads.push({ url: blob.url, pathname: blob.pathname });
            }
          } else {
            // generar nombre con sufijo aleatorio para no chocar
            const baseTarget = folder ? `${folder}/${name}` : name;
            const blob = await put(baseTarget, file, { access: 'public', addRandomSuffix: true });
            uploads.push({ url: blob.url, pathname: blob.pathname });
          }
        } else {
          // fallback: subir con addRandomSuffix por seguridad
          const baseTarget = folder ? `${folder}/${name}` : name;
          const blob = await put(baseTarget, file, { access: 'public', addRandomSuffix: true });
          uploads.push({ url: blob.url, pathname: blob.pathname });
        }
      }

      return NextResponse.json({ uploads });
    } else {
      return NextResponse.json({ error: 'Acción desconocida' }, { status: 400 });
    }
  } catch (err) {
    console.error('Error al subir imagen:', err);
    const msg = (err && err.message) ? err.message : 'Error al subir imagen';
    return NextResponse.json({ error: `Error al subir imagen: ${msg}` }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const pathname = searchParams.get('pathname');
  if (!pathname) {
    return NextResponse.json({ error: 'Falta el pathname' }, { status: 400 });
  }

  try {
    await del(pathname);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar imagen:", error);
    return NextResponse.json({ error: 'Error al eliminar imagen' }, { status: 500 });
  }
}

// PATCH maneja renombrado de archivos (copiar + borrar)
export async function PATCH(request) {
  try {
    const { oldPathname, newPathname } = await request.json();

    if (!oldPathname || !newPathname) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    const { blobs } = await list();
    const oldBlob = blobs.find(b => b.pathname === oldPathname);
    if (!oldBlob) {
      return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 });
    }

    // Descarga el blob original
    const resp = await fetch(oldBlob.url);
    const buffer = await resp.arrayBuffer();
    const file = new File([buffer], newPathname, {
      type: resp.headers.get("content-type") || "application/octet-stream"
    });

    // Sube con el nuevo nombre
    const newBlob = await put(newPathname, file, { access: "public", addRandomSuffix: false });

    // Borra el viejo
    await del(oldPathname);

    return NextResponse.json({
      success: true,
      oldPathname,
      newPathname,
      url: newBlob.url
    });
  } catch (err) {
    console.error("Error renombrando:", err);
    return NextResponse.json({ error: "Error al renombrar archivo" }, { status: 500 });
  }
}
