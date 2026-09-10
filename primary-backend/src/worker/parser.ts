export function parse(text: string, values: any, startDelimiter = "{", endDelimiter = "}"): string {
  if (!text) return "";
  if (!values) return text;

  let result = text;
  const regex = new RegExp(`\\${startDelimiter}([^\\${endDelimiter}]+)\\${endDelimiter}`, "g");

  result = result.replace(regex, (match, path) => {
    const keys = path.trim().split(".");
    let current: any = values;

    for (const key of keys) {
      if (current === null || current === undefined) {
        return "";
      }
      if (typeof current === "string") {
        try {
          current = JSON.parse(current);
        } catch {
          return "";
        }
      }
      current = current[key];
    }

    return current !== undefined && current !== null ? String(current) : match;
  });

  return result;
}
