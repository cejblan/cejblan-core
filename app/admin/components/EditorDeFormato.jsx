import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const bloquesIniciales = [
  { key: "header", label: "Encabezado" },
  { key: "noteInfo", label: "Nota de Entrega" },
  { key: "client", label: "Cliente" },
  { key: "products", label: "Productos" },
  { key: "totals", label: "Totales" },
];

function DraggableBlock({ id, children, moveBlock }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "block",
    item: { id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const [, drop] = useDrop(() => ({
    accept: "block",
    hover: (item) => {
      if (item.id !== id) {
        moveBlock(item.id, id);
        item.id = id;
      }
    },
  }));

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`p-1 cursor-move ${isDragging ? "opacity-50" : ""}`}
    >
      {children}
    </div>
  );
}

export default function EditorDeFormato({ config, setConfig, onClose }) {
  const [localConfig, setLocalConfig] = useState(config);
  const [selectedBlock, setSelectedBlock] = useState("header");
  const [previewOrder, setPreviewOrder] = useState(Object.keys(config.blocks));

  const handleStyleChange = (key, value) => {
    setLocalConfig((prev) => ({
      ...prev,
      blocks: {
        ...prev.blocks,
        [selectedBlock]: {
          ...prev.blocks[selectedBlock],
          [key]: value,
        },
      },
    }));
  };

  const moveBlock = (draggedId, hoveredId) => {
    const draggedIndex = previewOrder.indexOf(draggedId);
    const hoveredIndex = previewOrder.indexOf(hoveredId);
    const updatedOrder = [...previewOrder];
    updatedOrder.splice(draggedIndex, 1);
    updatedOrder.splice(hoveredIndex, 0, draggedId);
    setPreviewOrder(updatedOrder);
  };

  const toggleBlockVisibility = (key) => {
    setLocalConfig((prev) => ({
      ...prev,
      blocks: {
        ...prev.blocks,
        [key]: {
          ...prev.blocks[key],
          visible: !prev.blocks[key]?.visible,
        },
      },
    }));
  };

  const deleteBlock = (key) => {
    const { [key]: _, ...restBlocks } = localConfig.blocks;
    setLocalConfig((prev) => ({
      ...prev,
      blocks: restBlocks,
    }));
    setPreviewOrder((prev) => prev.filter((k) => k !== key));
    if (selectedBlock === key) setSelectedBlock("header");
  };

  const createNewBlock = () => {
    const newKey = prompt("Nombre del nuevo bloque:");
    if (!newKey || localConfig.blocks[newKey]) return;

    setLocalConfig((prev) => ({
      ...prev,
      blocks: {
        ...prev.blocks,
        [newKey]: { alignment: "left", visible: true },
      },
    }));
    setPreviewOrder((prev) => [...prev, newKey]);
    setSelectedBlock(newKey);
  };

  const duplicateBlock = (key) => {
    const baseKey = `${key}_copia`;
    let newKey = baseKey;
    let count = 1;

    while (localConfig.blocks[newKey]) {
      newKey = `${baseKey}${++count}`;
    }

    const copiedBlock = { ...localConfig.blocks[key] };

    setLocalConfig((prev) => ({
      ...prev,
      blocks: {
        ...prev.blocks,
        [newKey]: copiedBlock,
      },
    }));

    const currentIndex = previewOrder.indexOf(key);
    const newOrder = [...previewOrder];
    newOrder.splice(currentIndex + 1, 0, newKey);
    setPreviewOrder(newOrder);
    setSelectedBlock(newKey);
  };

  const saveChanges = () => {
    setConfig(localConfig);
    onClose();
  };

  const BlockEditor = () => {
    const block = localConfig.blocks[selectedBlock] || {};
    const keys = Object.keys(block).filter(
      (key) => !["fontSize", "padding", "fontFamily", "color", "alignment", "visible"].includes(key)
    );

    return (
      <div className="space-y-2">
        {keys.map((key) => (
          <Input
            key={key}
            value={block[key] || ""}
            onChange={(e) => handleStyleChange(key, e.target.value)}
            placeholder={key}
          />
        ))}
        <div className="flex flex-col">
          <label>Alineación</label>
          <select
            value={block.alignment || "left"}
            onChange={(e) => handleStyleChange("alignment", e.target.value)}
          >
            <option value="left">Izquierda</option>
            <option value="center">Centro</option>
            <option value="right">Derecha</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label>Tamaño de fuente</label>
          <Input
            type="number"
            value={block.fontSize || ""}
            onChange={(e) => handleStyleChange("fontSize", e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label>Padding</label>
          <Input
            type="text"
            value={block.padding || ""}
            onChange={(e) => handleStyleChange("padding", e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label>Tipo de letra</label>
          <Input
            value={block.fontFamily || ""}
            onChange={(e) => handleStyleChange("fontFamily", e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label>Color</label>
          <Input
            type="color"
            value={block.color || "#000000"}
            onChange={(e) => handleStyleChange("color", e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => duplicateBlock(selectedBlock)}>
            Duplicar bloque
          </Button>
          <Button variant="destructive" onClick={() => deleteBlock(selectedBlock)}>
            Eliminar bloque
          </Button>
        </div>
      </div>
    );
  };

  const renderPreviewBlock = (key) => {
    const styles = localConfig.blocks[key] || {};
    if (styles.visible === false) return null;

    const {
      alignment = "left",
      fontSize = "12",
      padding = "4px",
      fontFamily = "inherit",
      color = "#000000",
      ...content
    } = styles;

    return (
      <DraggableBlock key={key} id={key} moveBlock={moveBlock}>
        <div
          className={`text-${alignment} mb-2`}
          style={{ fontSize: `${fontSize}px`, padding, fontFamily, color }}
        >
          <div className="font-semibold">{key.toUpperCase()}</div>
          <div>{Object.values(content).join(" ")}</div>
          <button
            className="ml-2 text-xs text-red-500 underline"
            onClick={() => toggleBlockVisibility(key)}
          >
            Ocultar
          </button>
        </div>
      </DraggableBlock>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Editor de Formato de Impresión</h3>

        <div className="flex space-x-2 flex-wrap">
          {Object.keys(localConfig.blocks).map((key) => (
            <Button
              key={key}
              variant={selectedBlock === key ? "default" : "outline"}
              onClick={() => setSelectedBlock(key)}
            >
              {key}
            </Button>
          ))}
          <Button variant="secondary" onClick={createNewBlock}>+ Nuevo bloque</Button>
        </div>

        <div className="border p-4 rounded bg-muted">
          <BlockEditor />
        </div>

        <div className="border p-4 rounded bg-white shadow-inner min-h-[300px]">
          <h4 className="text-sm text-gray-500 mb-2">Vista previa interactiva</h4>
          <div className="bg-gray-100 p-4 w-[80mm] mx-auto border shadow-inner">
            {previewOrder.map((key) => renderPreviewBlock(key))}
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={saveChanges}>Guardar</Button>
        </div>
      </div>
    </DndProvider>
  );
}
