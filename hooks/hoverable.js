import React from "react";
import { useState } from "react";

function useHoverColor(hoverColor) {
  const [isHovered, setIsHovered] = useState(false);
  return {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    style: isHovered ? { color: hoverColor } : {}
  };
}

export function Hoverable({
  as: Component = "span",
  hoverColor,
  className,
  style,
  children,
  ...props
}) {
  const hoverProps = useHoverColor(hoverColor);
  return (
    <Component
      className={className}
      style={{ ...style, ...hoverProps.style }}
      {...hoverProps}
      {...props}
    >
      {children}
    </Component>
  );
}