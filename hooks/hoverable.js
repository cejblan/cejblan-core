import React, { useState } from "react";

export function Hoverable({
  as: Component = "span",
  hoverStyle = {},    // ahora recibimos un objeto de estilos
  className,
  style = {},
  children,
  ...props
}) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Component
      className={className}
      style={{ ...style, ...(isHovered ? hoverStyle : {}) }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
    </Component>
  );
}
