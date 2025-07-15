"use client"

import Error500 from "@/components/pages/Error";

export default function Error({ error, reset }) {
  return <Error500 reset={reset} />;
}