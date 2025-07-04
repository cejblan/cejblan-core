
export default function EliminarCaracteres(text) {
  if (text) {
    return text.replace(/<\/?[^>]+>/g, "");
  }
  return ""; // Return an empty string if str is undefined
}