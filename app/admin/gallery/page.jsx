'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import NextImage from 'next/image';
import { FcOpenedFolder } from "react-icons/fc";
import { FiEdit, FiMove, FiTrash2, FiCopy, FiType, FiMenu } from 'react-icons/fi';
import ModalImagenesDuplicadas from './ModalImagenesDuplicadas';
import Cropper from 'react-easy-crop';

/** Helper para generar File desde croppedAreaPixels */
async function getCroppedImg(imageSrc, pixelCrop) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(pixelCrop.width));
      canvas.height = Math.max(1, Math.round(pixelCrop.height));
      const ctx = canvas.getContext('2d');

      ctx.drawImage(
        image,
        Math.round(pixelCrop.x),
        Math.round(pixelCrop.y),
        Math.round(pixelCrop.width),
        Math.round(pixelCrop.height),
        0,
        0,
        Math.round(pixelCrop.width),
        Math.round(pixelCrop.height)
      );

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('No se pudo generar el blob del recorte'));
          return;
        }
        const file = new File([blob], 'recorte.png', { type: 'image/png' });
        resolve(file);
      }, 'image/png', 0.95);
    };
    image.onerror = (err) => reject(err);
  });
}

export default function Gallery() {
  // ---------- Estado principal (preservo todo lo original y agrego lo nuevo) ----------
  const [items, setItems] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  // Cropper state
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropAspect, setCropAspect] = useState(undefined); // undefined = libre, 1 = 1:1

  // minZoom & container ref
  const [minZoom, setMinZoom] = useState(1); // estrategia: zoom=1 corresponde a mediaSize (contain)
  const cropContainerRef = useRef(null);
  const [cropContainerHeightPx, setCropContainerHeightPx] = useState(null);

  // mediaInfo provisto por react-easy-crop en onMediaLoaded
  const [mediaInfo, setMediaInfo] = useState(null); // { width, height, naturalWidth, naturalHeight }

  // Overlay (modo libre): posicion y tamaño en px relativos al contenedor
  const [overlayBox, setOverlayBox] = useState(null); // { left, top, width, height }
  const overlayRef = useRef(null);

  // interacción overlay
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef(null);
  const isResizingRef = useRef(false);
  const resizeDirRef = useRef(null);
  const resizeStartRef = useRef(null);

  // legacy crop box (no usado por react-easy-crop modal)
  const [cropBox, setCropBox] = useState({ top: 50, left: 50, width: 200, height: 200 });
  const imgContainerRef = useRef(null);
  const isResizingLegacy = useRef(null);
  const isDraggingLegacy = useRef(false);
  const [aspect, setAspect] = useState('libre');

  const porPagina = 36;

  // Navigation / uploads / conflicts
  const [currentFolder, setCurrentFolder] = useState('');
  const [pathInput, setPathInput] = useState('');
  const [showConflictsModal, setShowConflictsModal] = useState(false);
  const [conflictsData, setConflictsData] = useState([]);
  const [uploadFilesBuffer, setUploadFilesBuffer] = useState([]);

  // Context menu
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [menuItem, setMenuItem] = useState(null);
  const menuRef = useRef(null);

  // Drag & drop
  const [draggingFiles, setDraggingFiles] = useState(false);
  const dropRef = useRef(null);
  const dragCounter = useRef(0);
  const globalDragCounter = useRef(0);

  useEffect(() => setPathInput(currentFolder ? currentFolder : '/'), [currentFolder]);

  useEffect(() => {
    cargarItems();
    setMenuVisible(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina, currentFolder]);

  useEffect(() => {
    const onClick = () => setMenuVisible(false);
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C') && menuVisible && menuItem && menuItem.url) {
        navigator.clipboard.writeText(menuItem.url).then(() => alert('URL copiada (atajo)')).catch(() => { });
      }
      if (e.key === 'Escape') {
        setMenuVisible(false);
        setDraggingFiles(false);
      }
    };
    window.addEventListener('click', onClick);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('click', onClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [menuVisible, menuItem]);

  useEffect(() => {
    if (!menuVisible) return;
    requestAnimationFrame(() => {
      const el = menuRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      let { x, y } = menuPos;
      const padding = 8;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (x + rect.width + padding > vw) x = Math.max(padding, vw - rect.width - padding);
      if (y + rect.height + padding > vh) y = Math.max(padding, vh - rect.height - padding);
      if (x !== menuPos.x || y !== menuPos.y) setMenuPos({ x, y });
    });
  }, [menuVisible, menuPos]);

  // ----- Helpers (uploads, drag/drop, traverse) -----
  const cargarItems = async () => {
    try {
      const folderQuery = currentFolder ? `&folder=${encodeURIComponent(currentFolder)}` : '';
      const res = await fetch(`/api/cms/images?page=${pagina}&limit=${porPagina}${folderQuery}`);
      const data = await res.json();
      setItems(data.items || []);
      setTotalPaginas(data.totalPaginas || 1);
    } catch (err) {
      console.error('Error al cargar imágenes:', err);
    }
  };

  const traverseFileTree = (itemEntry, path = '') => {
    return new Promise((resolve) => {
      if (itemEntry.isFile) {
        itemEntry.file(file => {
          resolve([{ file, relativePath: path + file.name }]);
        });
      } else if (itemEntry.isDirectory) {
        const dirReader = itemEntry.createReader();
        let entries = [];
        const readEntries = () => {
          dirReader.readEntries(async (results) => {
            if (!results.length) {
              const promises = entries.map(en => traverseFileTree(en, path + itemEntry.name + '/'));
              const nested = await Promise.all(promises);
              resolve(nested.flat());
            } else {
              entries = entries.concat(Array.from(results));
              readEntries();
            }
          });
        };
        readEntries();
      } else {
        resolve([]);
      }
    });
  };

  const getFilesFromDataTransfer = async (dataTransfer) => {
    const itemsDT = dataTransfer.items;
    if (!itemsDT) {
      return Array.from(dataTransfer.files).map(f => ({ file: f, relativePath: f.name }));
    }

    const entriesPromises = [];
    for (let i = 0; i < itemsDT.length; i++) {
      const it = itemsDT[i];
      const entry = it.webkitGetAsEntry ? it.webkitGetAsEntry() : null;
      if (entry) {
        entriesPromises.push(traverseFileTree(entry, ''));
      } else {
        const f = itemsDT[i].getAsFile();
        if (f) entriesPromises.push(Promise.resolve([{ file: f, relativePath: f.name }]));
      }
    }

    const nested = await Promise.all(entriesPromises);
    return nested.flat();
  };

  const handleFilesUpload = async (filesArrayOrList, targetFolder = null) => {
    let filesList = [];

    if (filesArrayOrList instanceof DataTransfer) {
      const items = await getFilesFromDataTransfer(filesArrayOrList);
      filesList = items;
    } else if (filesArrayOrList && filesArrayOrList.length && filesArrayOrList[0] instanceof File) {
      filesList = Array.from(filesArrayOrList).map(f => ({ file: f, relativePath: f.name }));
    } else if (filesArrayOrList && filesArrayOrList.length && filesArrayOrList[0].file) {
      filesList = Array.from(filesArrayOrList);
    } else {
      filesList = Array.from(filesArrayOrList || []).map(f => ({ file: f, relativePath: f.name }));
    }

    if (filesList.length === 0) return;

    setUploadFilesBuffer(filesList);

    const formData = new FormData();
    filesList.forEach(({ file, relativePath }, idx) => {
      const safeRel = relativePath || file.name || `upload-${Date.now()}-${idx}`;
      formData.append('images', file, safeRel);
    });

    const folderQuery = (targetFolder !== null ? `?folder=${encodeURIComponent(targetFolder)}` : (currentFolder ? `?folder=${encodeURIComponent(currentFolder)}` : ''));

    try {
      const res = await fetch(`/api/cms/images?action=check${folderQuery}`, { method: 'POST', body: formData });
      if (res.status === 409) {
        const data = await res.json();
        setConflictsData(data.conflicts || []);
        setShowConflictsModal(true);
        return;
      }
      if (!res.ok) {
        const text = await res.text();
        alert('Error al subir: ' + text);
        return;
      }
      const data = await res.json();
      if (data.uploads) {
        setPagina(1);
        await cargarItems();
      }
    } catch (err) {
      console.error('Error fetch upload:', err);
      alert('Error inesperado al subir');
    }
  };

  const handleUploadInputChange = (e) => {
    handleFilesUpload(e.target.files);
  };

  // Drag & drop handlers (wrapper)
  useEffect(() => {
    const dropEl = dropRef.current;
    if (!dropEl) return;

    const onDragEnter = (e) => {
      e.preventDefault();
      dragCounter.current += 1;
      setDraggingFiles(true);
    };

    const onDragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      if (dragCounter.current <= 0) {
        dragCounter.current = 1;
        setDraggingFiles(true);
      }
    };

    const onDragLeave = (e) => {
      e.preventDefault();
      dragCounter.current = Math.max(0, dragCounter.current - 1);
      if (dragCounter.current === 0 && globalDragCounter.current === 0) setDraggingFiles(false);
    };

    const onDrop = async (e) => {
      e.preventDefault();
      dragCounter.current = 0;
      globalDragCounter.current = 0;
      setDraggingFiles(false);
      const filesWithPaths = await getFilesFromDataTransfer(e.dataTransfer);
      handleFilesUpload(filesWithPaths);
    };

    dropEl.addEventListener('dragenter', onDragEnter);
    dropEl.addEventListener('dragover', onDragOver);
    dropEl.addEventListener('dragleave', onDragLeave);
    dropEl.addEventListener('drop', onDrop);

    return () => {
      dropEl.removeEventListener('dragenter', onDragEnter);
      dropEl.removeEventListener('dragover', onDragOver);
      dropEl.removeEventListener('dragleave', onDragLeave);
      dropEl.removeEventListener('drop', onDrop);
    };
  }, [currentFolder]);

  useEffect(() => {
    const onWindowDragEnter = (e) => {
      const types = e.dataTransfer?.types;
      if (types && (types.includes && types.includes('Files') || types.contains && types.contains('Files'))) {
        globalDragCounter.current += 1;
        setDraggingFiles(true);
      }
    };
    const onWindowDragOver = (e) => {
      e.preventDefault();
      const types = e.dataTransfer?.types;
      if (types && (types.includes && types.includes('Files') || types.contains && types.contains('Files'))) setDraggingFiles(true);
    };
    const onWindowDragLeave = (e) => {
      const types = e.dataTransfer?.types;
      if (types && (types.includes && types.includes('Files') || types.contains && types.contains('Files'))) {
        globalDragCounter.current = Math.max(0, globalDragCounter.current - 1);
        if (globalDragCounter.current === 0 && dragCounter.current === 0) setDraggingFiles(false);
      }
    };
    const onWindowDrop = () => {
      globalDragCounter.current = 0;
      dragCounter.current = 0;
      setDraggingFiles(false);
    };

    window.addEventListener('dragenter', onWindowDragEnter);
    window.addEventListener('dragover', onWindowDragOver);
    window.addEventListener('dragleave', onWindowDragLeave);
    window.addEventListener('drop', onWindowDrop);

    return () => {
      window.removeEventListener('dragenter', onWindowDragEnter);
      window.removeEventListener('dragover', onWindowDragOver);
      window.removeEventListener('dragleave', onWindowDragLeave);
      window.removeEventListener('drop', onWindowDrop);
    };
  }, []);

  const commitUploads = async (actions) => {
    const filesList = uploadFilesBuffer || [];
    const formData = new FormData();
    filesList.forEach(({ file, relativePath }, idx) => {
      const safeRel = relativePath || file.name || `upload-${Date.now()}-${idx}`;
      formData.append('images', file, safeRel);
    });
    formData.append('actions', JSON.stringify(actions));

    const folderQuery = currentFolder ? `?folder=${encodeURIComponent(currentFolder)}` : '';
    try {
      const res = await fetch(`/api/cms/images?action=commit${folderQuery}`, { method: 'POST', body: formData });
      if (!res.ok) {
        const txt = await res.text();
        alert('Error al confirmar subidas: ' + txt);
        return;
      }
      const data = await res.json();
      if (data.uploads) {
        setShowConflictsModal(false);
        setUploadFilesBuffer([]);
        setConflictsData([]);
        setPagina(1);
        await cargarItems();
      }
    } catch (err) {
      console.error('Error commit uploads:', err);
      alert('Error inesperado al confirmar subidas');
    }
  };

  // ---------- Context menu handlers ----------
  const openMenuAt = (x, y, item) => {
    setMenuItem(item);
    setMenuPos({ x, y });
    setMenuVisible(true);
  };

  const handleContextMenu = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    let x = e.clientX;
    let y = e.clientY;
    const menuWidth = menuRef.current?.offsetWidth || 220;
    const menuHeight = menuRef.current?.offsetHeight || 180;
    const padding = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (x + menuWidth + padding > vw) x = Math.max(padding, vw - menuWidth - padding);
    if (y + menuHeight + padding > vh) y = Math.max(padding, vh - menuHeight - padding);
    openMenuAt(x, y, item);
  };

  const openMenuFromButton = (e, item) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    let x = rect.right - 8;
    let y = rect.bottom + 4;
    openMenuAt(x, y, item);
  };

  // centralizo eliminarArchivo para que lo use todo el código
  const eliminarArchivo = async (pathname) => {
    try {
      // No confirm aquí: la confirmación la hace quien llama (handleContextDelete)
      await fetch(`/api/cms/images?pathname=${encodeURIComponent(pathname)}`, { method: "DELETE" });
      await cargarItems();
    } catch (err) {
      console.error('Error al eliminar archivo:', err);
      alert('Error al eliminar archivo');
    }
  };

  const handleContextEdit = (it) => {
    const item = it || menuItem;
    if (!item) return;
    setImagenSeleccionada(item);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    // por defecto abrimos en modo libre; usuario puede activar 1:1 con el boton
    setCropAspect(undefined);
    setCropModalOpen(true);
    setMenuVisible(false);
  };

  const handleContextCopyUrl = async (it) => {
    const item = it || menuItem;
    if (!item || !item.url) { setMenuVisible(false); return; }
    try { await navigator.clipboard.writeText(item.url); alert('URL copiada'); } catch { alert('Error copiando URL'); } finally { setMenuVisible(false); }
  };

  const handleContextDelete = async (it) => {
    const item = it || menuItem;
    if (!item) { setMenuVisible(false); return; }

    if (!confirm('¿Eliminar? Esta acción no se puede deshacer.')) {
      setMenuVisible(false);
      return;
    }

    try {
      // si es archivo (típico) reutilizar eliminarArchivo
      if (item.pathname) {
        await eliminarArchivo(item.pathname);
        setMenuVisible(false);
        return;
      }

      // fallback: borrado directo
      await fetch(`/api/cms/images?pathname=${encodeURIComponent(item.pathname)}`, { method: "DELETE" });
      setMenuVisible(false);
      await cargarItems();
    } catch (err) {
      console.error('Error eliminando:', err);
      alert('Error al eliminar');
      setMenuVisible(false);
    }
  };

  const handleContextRename = async (it) => {
    const item = it || menuItem;
    if (!item) { setMenuVisible(false); return; }
    const defaultName = item.name || item.pathname.split('/').pop();
    const nuevo = prompt('Nuevo nombre (incluye extensión):', defaultName);
    if (!nuevo) { setMenuVisible(false); return; }
    const payload = { oldPathname: item.pathname, newPathname: nuevo };
    try {
      const res = await fetch(`/api/cms/images`, {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) { const txt = await res.text(); alert('Error renombrando: ' + txt); }
      else {
        const data = await res.json();
        if (data.success) { alert('Renombrado correctamente'); await cargarItems(); } else alert('Error renombrando: ' + (data.error || 'unknown'));
      }
    } catch (err) {
      console.error('Error rename:', err); alert('Error inesperado renombrando');
    } finally { setMenuVisible(false); }
  };

  const handleContextMove = async (it) => {
    const item = it || menuItem;
    if (!item) { setMenuVisible(false); return; }
    const target = prompt('Mover a carpeta (ruta relativa, ejemplo: carpeta/subcarpeta). Dejar vacío para raíz:', '');
    if (target === null) { setMenuVisible(false); return; }
    const payload = { pathname: item.pathname, targetFolder: target.trim() };
    const form = new FormData(); form.append('payload', JSON.stringify(payload));
    try {
      const res = await fetch(`/api/cms/images?action=move`, { method: 'POST', body: form });
      if (!res.ok) { const txt = await res.text(); alert('Error moviendo: ' + txt); }
      else {
        const data = await res.json();
        if (data.success) { alert('Movido correctamente'); await cargarItems(); } else alert('Error moviendo: ' + (data.error || 'unknown'));
      }
    } catch (err) {
      console.error('Error move:', err); alert('Error inesperado moviendo');
    } finally { setMenuVisible(false); }
  };

  // Tile keyboard context menu
  const onTileKeyDown = (e, item, ref) => {
    const isContextKey = e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10');
    if (isContextKey) {
      e.preventDefault();
      const rect = ref?.getBoundingClientRect?.();
      const cx = rect ? (rect.left + rect.right) / 2 : window.innerWidth / 2;
      const cy = rect ? (rect.top + rect.bottom) / 2 : window.innerHeight / 2;
      openMenuAt(cx, cy, item);
    }
  };

  // Drop on folder
  const onDropOnFolder = async (e, folderItem) => {
    e.preventDefault();
    setDraggingFiles(false);
    const dt = e.dataTransfer;
    const filesWithPaths = await getFilesFromDataTransfer(dt);
    const prefixed = filesWithPaths.map(({ file, relativePath }) => {
      const safeRel = relativePath || file.name;
      const rel = `${folderItem.pathname}/${safeRel}`;
      return { file, relativePath: rel };
    });
    await handleFilesUpload(prefixed, null);
  };

  // ---------- CROP / OVERLAY logic ----------

  // onCropComplete for 1:1 mode (única definición)
  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  // Inicializa overlay usando mediaSize provisto por react-easy-crop
  const initOverlayFromMedia = useCallback((mediaSize) => {
    if (!cropContainerRef.current || !mediaSize) return;

    const containerW = cropContainerRef.current.clientWidth;
    // mediaSize.width/height refleja cómo react-easy-crop dibuja la imagen a zoom=1 con objectFit="contain"
    const displayedW = mediaSize.width;
    const displayedH = mediaSize.height;

    // ajustar la altura del contenedor a displayedH
    setCropContainerHeightPx(Math.round(displayedH));

    // overlay default = cubrir toda la imagen pintada
    const left = Math.max(0, Math.round((containerW - displayedW) / 2));
    const top = Math.max(0, Math.round((cropContainerRef.current.clientHeight - displayedH) / 2));
    const width = Math.round(displayedW);
    const height = Math.round(displayedH);

    setOverlayBox({ left, top, width, height });
  }, []);

  // handler onMediaLoaded de react-easy-crop
  const onMediaLoadedHandler = useCallback((mediaSize) => {
    // mediaSize suele traer: {width, height, naturalWidth, naturalHeight}
    setMediaInfo(mediaSize || null);
    setMinZoom(1);
    setZoom(1);
    // init overlay si estamos en modo libre
    if (cropAspect === undefined) {
      initOverlayFromMedia(mediaSize);
    } else {
      // si es 1:1 forzamos contenedor cuadrado: width x width
      const containerWidth = cropContainerRef.current?.clientWidth || Math.min(window.innerWidth * 0.9, 800);
      setCropContainerHeightPx(Math.round(containerWidth));
    }
  }, [cropAspect, initOverlayFromMedia]);

  // overlay interactions
  const onOverlayMouseDown = (e) => {
    e.preventDefault();
    if (!overlayBox) return;
    const target = e.target;
    if (target && target.dataset && target.dataset.handle) return; // handle will start a resize
    isDraggingRef.current = true;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      box: { ...overlayBox }
    };
    window.addEventListener('mousemove', overlayMouseMove);
    window.addEventListener('mouseup', overlayMouseUp);
  };

  const onHandleMouseDown = (e, dir) => {
    e.preventDefault();
    e.stopPropagation();
    isResizingRef.current = true;
    resizeDirRef.current = dir;
    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      box: { ...overlayBox }
    };
    window.addEventListener('mousemove', overlayMouseMove);
    window.addEventListener('mouseup', overlayMouseUp);
  };

  const overlayMouseMove = (e) => {
    if (!overlayBox || !cropContainerRef.current) return;
    const containerRect = cropContainerRef.current.getBoundingClientRect();
    const containerW = containerRect.width;
    const containerH = containerRect.height;
    const minSize = 20;

    if (isDraggingRef.current && dragStartRef.current) {
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;
      let newLeft = dragStartRef.current.box.left + dx;
      let newTop = dragStartRef.current.box.top + dy;
      newLeft = Math.max(0, Math.min(newLeft, containerW - overlayBox.width));
      newTop = Math.max(0, Math.min(newTop, containerH - overlayBox.height));
      setOverlayBox((prev) => ({ ...prev, left: Math.round(newLeft), top: Math.round(newTop) }));
      return;
    }

    if (isResizingRef.current && resizeStartRef.current) {
      const dir = resizeDirRef.current;
      const dx = e.clientX - resizeStartRef.current.mouseX;
      const dy = e.clientY - resizeStartRef.current.mouseY;
      let { left, top, width, height } = resizeStartRef.current.box;
      const forceSquare = false;

      if (dir.includes('e')) {
        width = Math.max(minSize, Math.min(containerW - left, Math.round(width + dx)));
        if (forceSquare) height = width;
      }
      if (dir.includes('s')) {
        height = Math.max(minSize, Math.min(containerH - top, Math.round(height + dy)));
        if (forceSquare) width = height;
      }
      if (dir.includes('w')) {
        const newLeft = Math.max(0, Math.min(left + dx, left + width - minSize));
        const diff = left - newLeft;
        left = newLeft;
        width = Math.max(minSize, Math.round(width + diff));
        if (forceSquare) height = width;
      }
      if (dir.includes('n')) {
        const newTop = Math.max(0, Math.min(top + dy, top + height - minSize));
        const diff = top - newTop;
        top = newTop;
        height = Math.max(minSize, Math.round(height + diff));
        if (forceSquare) width = height;
      }

      left = Math.max(0, Math.min(left, containerW - minSize));
      top = Math.max(0, Math.min(top, containerH - minSize));
      width = Math.max(minSize, Math.min(width, containerW - left));
      height = Math.max(minSize, Math.min(height, containerH - top));

      setOverlayBox({ left: Math.round(left), top: Math.round(top), width: Math.round(width), height: Math.round(height) });
      return;
    }
  };

  const overlayMouseUp = () => {
    isDraggingRef.current = false;
    isResizingRef.current = false;
    resizeDirRef.current = null;
    resizeStartRef.current = null;
    dragStartRef.current = null;
    window.removeEventListener('mousemove', overlayMouseMove);
    window.removeEventListener('mouseup', overlayMouseUp);
  };

  // remover listeners si el componente se desmonta (seguridad)
  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', overlayMouseMove);
      window.removeEventListener('mouseup', overlayMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Confirm crop (mode free => compute pixel crop from overlay + mediaInfo)
  const handleCropConfirmOverlay = async () => {
    if (!imagenSeleccionada) return;
    try {
      if (cropAspect === undefined) {
        // modo libre -> overlayBox -> pixelCrop basado en mediaInfo
        if (!overlayBox || !mediaInfo || !cropContainerRef.current) {
          alert('Información insuficiente para recortar (overlay o mediaInfo faltante).');
          return;
        }

        const containerRect = cropContainerRef.current.getBoundingClientRect();
        const containerW = containerRect.width;
        const containerH = containerRect.height;

        // displayed image size = mediaInfo.width/height * zoom
        const displayedW = (mediaInfo.width || mediaInfo.naturalWidth) * zoom;
        const displayedH = (mediaInfo.height || mediaInfo.naturalHeight) * zoom;

        // image offset dentro del contenedor (centrado horizontal y verticalmente)
        const imageLeft = Math.max(0, (containerW - displayedW) / 2);
        const imageTop = Math.max(0, (containerH - displayedH) / 2);

        // caja relativa a la imagen
        let relLeft = overlayBox.left - imageLeft;
        let relTop = overlayBox.top - imageTop;
        let relW = overlayBox.width;
        let relH = overlayBox.height;

        relLeft = Math.max(0, Math.min(relLeft, displayedW));
        relTop = Math.max(0, Math.min(relTop, displayedH));
        relW = Math.max(1, Math.min(relW, displayedW - relLeft));
        relH = Math.max(1, Math.min(relH, displayedH - relTop));

        // factor entre imagen renderizada y dimensiones naturales
        const natW = mediaInfo.naturalWidth || (mediaInfo.width || displayedW);
        const natH = mediaInfo.naturalHeight || (mediaInfo.height || displayedH);
        const scaleX = natW / displayedW;
        const scaleY = natH / displayedH;

        const pixelCrop = {
          x: Math.round(relLeft * scaleX),
          y: Math.round(relTop * scaleY),
          width: Math.round(relW * scaleX),
          height: Math.round(relH * scaleY)
        };

        const file = await getCroppedImg(imagenSeleccionada.url, pixelCrop);
        const form = new FormData();
        form.append('file', file);
        form.append('replacePath', imagenSeleccionada.pathname || '');

        const res = await fetch('/api/cms/images/crop', { method: 'POST', body: form });
        if (!res.ok) {
          const txt = await res.text();
          alert('Error al subir imagen recortada: ' + txt);
          return;
        }
        const data = await res.json();
        if (data.url) {
          alert('Imagen recortada subida con éxito');
          setCropModalOpen(false);
          setImagenSeleccionada(null);
          setPagina(1);
          await cargarItems();
        } else {
          alert('Error al subir imagen recortada');
        }
      } else {
        // modo 1:1 -> usamos croppedAreaPixels
        if (!croppedAreaPixels) { alert('Aún no hay área recortada'); return; }
        const file = await getCroppedImg(imagenSeleccionada.url, croppedAreaPixels);
        const form = new FormData();
        form.append('file', file);
        form.append('replacePath', imagenSeleccionada.pathname || '');

        const res = await fetch('/api/cms/images/crop', { method: 'POST', body: form });
        if (!res.ok) {
          const txt = await res.text();
          alert('Error al subir imagen recortada: ' + txt);
          return;
        }
        const data = await res.json();
        if (data.url) {
          alert('Imagen recortada subida con éxito');
          setCropModalOpen(false);
          setImagenSeleccionada(null);
          setPagina(1);
          await cargarItems();
        } else {
          alert('Error al subir imagen recortada');
        }
      }
    } catch (err) {
      console.error('Error al generar/subir recorte:', err);
      alert('Error al generar/subir recorte');
    }
  };

  // wrapper used by confirm button
  const handleCropConfirm = async () => {
    await handleCropConfirmOverlay();
  };

  // Abrir modal al editar / doble click
  const onDoubleClickItem = (item) => {
    if (item.type === 'folder') {
      setCurrentFolder(item.pathname);
      setPagina(1);
    } else {
      setImagenSeleccionada(item);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      // por defecto libre
      setCropAspect(undefined);
      setCropModalOpen(true);
      // onMediaLoaded provisto por Cropper ajustará overlay/altura cuando la imagen cargue
    }
  };

  const goUp = () => {
    if (!currentFolder) return;
    const parts = currentFolder.split('/');
    parts.pop();
    const parent = parts.join('/');
    setCurrentFolder(parent);
    setPagina(1);
  };

  const onPathSubmit = (e) => {
    e.preventDefault();
    const val = pathInput.trim();
    if (val === '/' || val === '') { setCurrentFolder(''); setPagina(1); return; }
    const cleaned = val.replace(/^\/+|\/+$/g, '');
    setCurrentFolder(cleaned);
    setPagina(1);
  };

  return (
    <div className="p-4" onContextMenu={(e) => e.preventDefault()}>
      <h1 className="text-2xl font-bold mb-4">Galería Multimedia</h1>

      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:gap-4">
        <label className="inline-flex items-center gap-2 cursor-pointer bg-[#6ed8bf] hover:bg-[#4bb199] text-white px-4 py-2 rounded-full text-sm font-medium shadow">
          Subir imagen(es)
          <input type="file" accept="image/*" multiple onChange={handleUploadInputChange} className="hidden" />
        </label>

        <form onSubmit={onPathSubmit} className="mt-3 sm:mt-0 flex items-center gap-2">
          <input value={pathInput} onChange={(e) => setPathInput(e.target.value)} className="border rounded px-2 py-1 text-sm w-64" placeholder="/ (raíz) o carpeta/subcarpeta" />
          <button type="submit" className="bg-white px-3 py-1 rounded hover:bg-gray-300">Ir</button>
        </form>

        <div className="ml-auto">
          {currentFolder && (<button onClick={goUp} className="bg-white px-3 py-1 rounded hover:bg-gray-200">↩ Volver</button>)}
        </div>
      </div>

      <div className="mb-2 text-sm text-gray-600">Ruta actual: <span className="font-mono">{currentFolder ? currentFolder : '/'}</span></div>

      {/* Drag & drop overlay wrapper */}
      <div ref={dropRef} className="relative">
        {draggingFiles && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="bg-white/90 border-2 border-dashed border-slate-400 rounded-lg p-8 text-center pointer-events-none shadow-lg max-w-[90%]">
              <div className="text-lg font-semibold mb-1">Suelta los archivos para subir</div>
              <div className="text-sm text-slate-600">Se subirán a: <span className="font-mono">{currentFolder || '/'}</span></div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item, i) => (
            <div
              key={i}
              tabIndex={0}
              onKeyDown={(e) => onTileKeyDown(e, item, e.currentTarget)}
              onDoubleClick={() => onDoubleClickItem(item)}
              onContextMenu={(e) => handleContextMenu(e, item)}
              onDragEnter={(e) => { e.preventDefault(); dragCounter.current += 1; setDraggingFiles(true); }}
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
              onDragLeave={(e) => { e.preventDefault(); dragCounter.current = Math.max(0, dragCounter.current - 1); if (dragCounter.current === 0 && globalDragCounter.current === 0) setDraggingFiles(false); }}
              onDrop={(e) => item.type === 'folder' ? onDropOnFolder(e, item) : undefined}
              className="relative w-full aspect-square border rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer select-none focus:ring-2 focus:ring-sky-400"
              title={item.type === 'folder' ? item.pathname : item.name}
            >
              {item.type === 'folder' ? (
                <div className="flex flex-col items-center gap-2">
                  <FcOpenedFolder className="text-5xl" />
                  <span className="text-sm break-all text-center px-2">{item.name}</span>
                </div>
              ) : (
                <NextImage src={item.url} alt={item.pathname} className="object-scale-down w-full h-full" width={100} height={100} />
              )}

              {/* burger menu visible only on small screens */}
              <button
                onClick={(e) => openMenuFromButton(e, item)}
                className="absolute top-2 right-2 z-20 md:hidden bg-white/80 hover:bg-white rounded p-1"
                aria-label="Abrir menú"
              >
                <FiMenu size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Context menu */}
      {menuVisible && menuItem && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-white border rounded shadow-lg text-sm"
          style={{
            top: menuPos.y,
            left: menuPos.x,
            minWidth: 180,
            maxWidth: 'calc(100vw - 20px)'
          }}
          onClick={(e) => e.stopPropagation()}
          role="menu"
        >
          {menuItem.type === 'file' ? (
            <div>
              <div className="p-1 hover:bg-slate-100 cursor-pointer flex items-center gap-2" onClick={() => handleContextEdit(menuItem)}><FiEdit /> <span>Editar</span></div>
              <div className="p-1 hover:bg-slate-100 cursor-pointer flex items-center gap-2" onClick={() => handleContextMove(menuItem)}><FiMove /> <span>Mover</span></div>
              <div className="p-1 hover:bg-slate-100 cursor-pointer flex items-center gap-2" onClick={() => handleContextRename(menuItem)}><FiType /> <span>Renombrar</span></div>
              <div className="p-1 hover:bg-slate-100 cursor-pointer flex items-center gap-2" onClick={() => handleContextCopyUrl(menuItem)}><FiCopy /> <span>Copiar URL</span></div>
              <div className="p-1 hover:bg-slate-100 cursor-pointer flex items-center gap-2 text-red-600" onClick={() => handleContextDelete(menuItem)}><FiTrash2 /> <span>Eliminar</span></div>
            </div>
          ) : (
            <div>
              <div className="p-1 hover:bg-slate-100 cursor-pointer flex items-center gap-2" onClick={() => handleContextMove(menuItem)}><FiMove /> <span>Mover carpeta</span></div>
              <div className="p-1 hover:bg-slate-100 cursor-pointer flex items-center gap-2" onClick={() => handleContextRename(menuItem)}><FiType /> <span>Renombrar carpeta</span></div>
              <div className="p-1 hover:bg-slate-100 cursor-pointer flex items-center gap-2 text-red-600" onClick={() => handleContextDelete(menuItem)}><FiTrash2 /> <span>Eliminar carpeta</span></div>
            </div>
          )}
        </div>
      )}

      {/* Modal de conflictos */}
      {showConflictsModal && (
        <ModalImagenesDuplicadas
          conflictos={conflictsData}
          onConfirm={(actions) => commitUploads(actions)}
          onCerrar={() => { setShowConflictsModal(false); setConflictsData([]); setUploadFilesBuffer([]); }}
        />
      )}

      {/* Cropper modal */}
      {cropModalOpen && imagenSeleccionada && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Recorte manual</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCropAspect(1);
                    // onMediaLoaded reajustará el contenedor cuando corresponda
                  }}
                  className={`px-3 py-1 rounded ${cropAspect === 1 ? 'bg-slate-800 text-white' : 'bg-slate-200 text-black'}`}
                >
                  1:1
                </button>
                <button
                  onClick={() => {
                    setCropAspect(undefined);
                    if (mediaInfo) initOverlayFromMedia(mediaInfo);
                  }}
                  className={`px-3 py-1 rounded ${cropAspect === undefined ? 'bg-slate-800 text-white' : 'bg-slate-200 text-black'}`}
                >
                  Libre
                </button>
                <button onClick={() => { setCropModalOpen(false); setImagenSeleccionada(null); }} className="text-slate-600 hover:text-black">✕</button>
              </div>
            </div>

            <div
              ref={cropContainerRef}
              className="relative w-full bg-black"
              style={{ height: cropContainerHeightPx ? `${cropContainerHeightPx}px` : '60vh' }}
            >
              <Cropper
                image={imagenSeleccionada.url}
                crop={crop}
                zoom={zoom}
                minZoom={minZoom}
                maxZoom={3}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                cropShape="rect"
                showGrid={!!cropAspect}
                objectFit="contain"
                restrictPosition={true}
                onMediaLoaded={onMediaLoadedHandler}
              />

              {/* Overlay (modo libre) — borde + cuadrícula que sigue en tiempo real los bordes ajustables */}
              {cropAspect === undefined && overlayBox && (
                <div
                  ref={overlayRef}
                  className="absolute border-2 border-white/90 shadow-lg"
                  style={{
                    left: overlayBox.left,
                    top: overlayBox.top,
                    width: overlayBox.width,
                    height: overlayBox.height,
                    boxSizing: 'border-box',
                    cursor: 'default', // no arrastre completo
                    background: 'rgba(255,255,255,0.02)',
                    position: 'absolute'
                  }}
                // NO onMouseDown aquí: dejamos sólo los handles para resize
                >
                  {/* Cuadrícula proporcional (3x3) — pointerEvents none para no bloquear handles */}
                  <div style={{ position: 'absolute', left: 0, right: 0, top: '33.3333%', height: 1, background: 'rgba(255,255,255,0.6)', pointerEvents: 'none', zIndex: 10 }} />
                  <div style={{ position: 'absolute', left: 0, right: 0, top: '66.6666%', height: 1, background: 'rgba(255,255,255,0.6)', pointerEvents: 'none', zIndex: 10 }} />
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: '33.3333%', width: 1, background: 'rgba(255,255,255,0.6)', pointerEvents: 'none', zIndex: 10 }} />
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: '66.6666%', width: 1, background: 'rgba(255,255,255,0.6)', pointerEvents: 'none', zIndex: 10 }} />

                  {/* Mantengo tus handles EXACTAMENTE como los tenías — zIndex alto para que sean clicables */}
                  {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((h) => (
                    <div
                      key={h}
                      data-handle={h}
                      onMouseDown={(ev) => onHandleMouseDown(ev, h)}
                      style={{
                        position: 'absolute',
                        width: 12,
                        height: 12,
                        background: 'white',
                        borderRadius: 2,
                        transform: 'translate(-50%,-50%)',
                        zIndex: 40, // arriba de la cuadrícula
                        left: h.includes('w') ? '0%' : h.includes('e') ? '100%' : '50%',
                        top: h.includes('n') ? '0%' : h.includes('s') ? '100%' : '50%',
                        cursor: h === 'n' || h === 's' ? 'ns-resize' : h === 'e' || h === 'w' ? 'ew-resize' : 'nwse-resize',
                        pointerEvents: 'auto'
                      }}
                    />
                  ))}

                  {/* Medidas (opcional, como ya tenías) */}
                  <div style={{ position: 'absolute', right: 6, bottom: 6, fontSize: 12, color: 'white', background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: 6, zIndex: 50 }}>
                    {overlayBox.width} × {overlayBox.height}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <label className="text-sm">Zoom</label>
                <input
                  type="range"
                  min={minZoom}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button onClick={() => { setCropModalOpen(false); setImagenSeleccionada(null); }} className="bg-gray-200 px-3 py-1 rounded">Cancelar</button>
                <button onClick={handleCropConfirm} className="bg-slate-800 text-white px-3 py-1 rounded">Recortar y subir</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-center gap-2">
        <button onClick={() => setPagina(p => Math.max(1, p - 1))} className="px-2 py-1 bg-white rounded hover:bg-gray-300 disabled:opacity-50" disabled={pagina === 1}>Anterior</button>
        <span className="px-2 py-1">{pagina} de {totalPaginas}</span>
        <button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} className="px-2 py-1 bg-white rounded hover:bg-gray-300 disabled:opacity-50" disabled={pagina === totalPaginas}>Siguiente</button>
      </div>
    </div>
  );
}
