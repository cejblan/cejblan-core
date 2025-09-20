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

    // --- Para archivos mostramos solo imágenes (tu UI) ---
    const imagenes = blobs.filter(blob =>
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(blob.pathname)
    );

    // --- Para detectar carpetas, usamos TODOS los blobs (incluye .keep u otros placeholders) ---
    // Queremos devolver solo hijos inmediatos del folder
    const foldersMap = new Map(); // pathname -> { type: 'folder', name, pathname }
    const files = [];

    // Primero procesar todos los blobs para detectar carpetas (todos los blobs, no solo imágenes)
    blobs.forEach(b => {
      const parts = b.pathname.split('/');
      if (!folder) {
        // root: si parts.length === 1 => archivo en raíz; si > 1 => subcarpeta
        if (parts.length === 1) {
          // Si es imagen la consideramos en files; si no, la ignoramos en lista de archivos
          // (la lista final de files se construye desde 'imagenes' más abajo)
        } else {
          const sub = parts[0];
          if (!foldersMap.has(sub)) {
            foldersMap.set(sub, { type: 'folder', name: sub, pathname: sub });
          }
        }
      } else {
        const prefix = folder + '/';
        if (b.pathname.startsWith(prefix)) {
          const rest = b.pathname.slice(prefix.length); // lo que queda después de folder/
          const restParts = rest.split('/');
          if (restParts.length === 1) {
            // archivo en la carpeta actual (lo añadiremos si es imagen)
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

    // Ahora construimos la lista de archivos visibles usando SOLO las 'imagenes' (como antes)
    imagenes.forEach(img => {
      const parts = img.pathname.split('/');
      if (!folder) {
        if (parts.length === 1) {
          files.push({ type: 'file', name: parts[0], pathname: img.pathname, url: img.url, uploadedAt: img.uploadedAt });
        } else {
          // subcarpeta ya cubierta por foldersMap (de todos los blobs)
          const sub = parts[0];
          if (!foldersMap.has(sub)) {
            foldersMap.set(sub, { type: 'folder', name: sub, pathname: sub });
          }
        }
      } else {
        const prefix = folder + '/';
        if (img.pathname.startsWith(prefix)) {
          const rest = img.pathname.slice(prefix.length);
          const restParts = rest.split('/');
          if (restParts.length === 1) {
            files.push({ type: 'file', name: restParts[0], pathname: img.pathname, url: img.url, uploadedAt: img.uploadedAt });
          } else {
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
    // --- Acción: createFolder ---
    if (action === 'createfolder') {
      if (!folder) {
        return NextResponse.json({ error: 'Falta folder' }, { status: 400 });
      }
      if (folder.includes('..')) {
        return NextResponse.json({ error: 'Nombre de carpeta inválido' }, { status: 400 });
      }

      const { blobs } = await list();
      const existsChildren = blobs.some(b => b.pathname === folder || b.pathname.startsWith(folder + '/'));
      if (existsChildren) {
        return NextResponse.json({ error: 'Carpeta ya existe' }, { status: 409 });
      }

      const placeholderName = '.keep';
      const targetPath = `${folder}/${placeholderName}`;

      // <-- cambio: File de 1 byte para evitar "Missing [x]-content-length header."
      const file = new File([new Uint8Array([0])], placeholderName, { type: 'application/octet-stream' });

      const blob = await put(targetPath, file, { access: 'public', addRandomSuffix: false });
      return NextResponse.json({ success: true, folder, created: blob.pathname });
    }

    // --- Para check / commit necesitamos formData ---
    const formData = await request.formData();

    // obtener todos los archivos enviados
    let files = formData.getAll('images');
    // soporte para 'image' single por compatibilidad
    if (!files || files.length === 0) {
      const single = formData.get('image');
      if (single) files = [single];
    }

    // Normalizar files: puede haber elementos no-files si el cliente envía otras cosas
    files = (files || []).filter(Boolean);

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
    console.error('Error en POST /api/cms/images:', err);
    const msg = (err && err.message) ? err.message : 'Error en POST';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  let pathname = searchParams.get('pathname');
  const dryRun = (searchParams.get('dryRun') || 'false').toLowerCase() === 'true';
  const batchSize = 50; // ajustar si quieres otro tamaño de batch

  if (!pathname) {
    return NextResponse.json({ error: 'Falta el pathname' }, { status: 400 });
  }

  try {
    const normalized = normalizeFolder(pathname);

    // obtener lista de blobs actuales
    const { blobs } = await list();

    // buscar coincidencia exacta (archivo)
    const exactBlob = blobs.find(b => b.pathname === normalized);

    // buscar hijos (si normalized es vacío, no permitimos borrar raíz)
    const children = normalized
      ? blobs.filter(b => b.pathname.startsWith(normalized + '/'))
      : [];

    // Si no hay children y no hay exactBlob -> 404
    if (!exactBlob && children.length === 0) {
      return NextResponse.json({ error: 'No se encontró archivo ni carpeta con ese pathname' }, { status: 404 });
    }

    // Construir lista de paths a borrar
    const toDeleteSet = new Set();
    // primero los hijos (si los hay)
    children.forEach(b => toDeleteSet.add(b.pathname));
    // luego, si existe un blob con exactamente ese pathname, añadirlo
    if (exactBlob) toDeleteSet.add(exactBlob.pathname);

    const toDelete = Array.from(toDeleteSet);

    if (dryRun) {
      return NextResponse.json({ dryRun: true, wouldDelete: toDelete, count: toDelete.length });
    }

    // Ejecutar borrado en batches
    let deletedPaths = [];
    for (let i = 0; i < toDelete.length; i += batchSize) {
      const chunk = toDelete.slice(i, i + batchSize);
      // map a promesas de del
      const results = await Promise.allSettled(chunk.map(p => del(p)));
      // recolectar los que efectivamente se resolvieron
      results.forEach((r, idx) => {
        if (r.status === 'fulfilled') deletedPaths.push(chunk[idx]);
        else console.error(`Error borrando ${chunk[idx]}:`, r.reason);
      });
    }

    return NextResponse.json({ success: true, deleted: deletedPaths.length, deletedPaths });
  } catch (error) {
    console.error("Error al eliminar imagen/carpeta:", error);
    return NextResponse.json({ error: 'Error al eliminar imagen/carpeta' }, { status: 500 });
  }
}

// PATCH maneja renombrado de archivos (copiar + borrar)
export async function PATCH(request) {
  try {
    const body = await request.json();
    const oldPathname = body?.oldPathname;
    const newPathname = body?.newPathname;
    const allowMove = !!body?.allowMove;
    const allowOverwrite = !!body?.allowOverwrite;

    if (!oldPathname || !newPathname) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    // listar blobs
    const { blobs } = await list();
    const oldBlob = blobs.find(b => b.pathname === oldPathname);
    if (!oldBlob) {
      return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 });
    }

    // Normalizar newPathname según allowMove
    let finalPath;
    if (allowMove) {
      // mover: usamos newPathname tal cual (normalize)
      const cleaned = String(newPathname).replace(/^\/+|\/+$/g, '');
      if (!cleaned) return NextResponse.json({ error: 'newPathname inválido' }, { status: 400 });
      finalPath = cleaned;
    } else {
      // renombrar en la misma carpeta: solo basename
      const newBase = String(newPathname).replace(/^\/+|\/+$/g, '').split('/').pop();
      const dirIndex = oldPathname.lastIndexOf('/');
      const dir = dirIndex === -1 ? '' : oldPathname.slice(0, dirIndex);
      finalPath = dir ? `${dir}/${newBase}` : newBase;
    }

    // Si no hay cambio
    if (finalPath === oldPathname) {
      return NextResponse.json({ success: true, oldPathname, newPathname: finalPath, info: 'Sin cambios (mismo pathname)' });
    }

    // Verificar colisión en destino
    const existing = blobs.find(b => b.pathname === finalPath);
    if (existing && !allowOverwrite) {
      return NextResponse.json({ error: 'Destino ya existe', pathname: finalPath }, { status: 409 });
    }

    // Descargar el blob original
    const resp = await fetch(oldBlob.url);
    const buffer = await resp.arrayBuffer();
    // Nombre final para el File debe ser el basename
    const finalBase = finalPath.split('/').pop();
    const file = new File([buffer], finalBase, {
      type: resp.headers.get("content-type") || "application/octet-stream"
    });

    // Subir al destino
    // Si allowOverwrite = true, instruct put to allowOverwrite / else keep addRandomSuffix false
    const putOptions = { access: "public", addRandomSuffix: false };
    if (allowOverwrite) putOptions.allowOverwrite = true;

    const newBlob = await put(finalPath, file, putOptions);

    // Borrar el antiguo
    await del(oldPathname);

    return NextResponse.json({
      success: true,
      oldPathname,
      newPathname: finalPath,
      url: newBlob.url
    });
  } catch (err) {
    console.error("Error renombrando/moviendo:", err);
    return NextResponse.json({ error: "Error al renombrar/mover archivo" }, { status: 500 });
  }
}
