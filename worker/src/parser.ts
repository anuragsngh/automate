/**
 * Resolves placeholder template tags in a string using values from payload metadata.
 * Example:
 * text = "Hello {user.name}, you received {payment.amount} SOL"
 * values = { user: { name: "Alice" }, payment: { amount: "0.5" } }
 * returns: "Hello Alice, you received 0.5 SOL"
 */
export function parse(text: string, values: any, startDelimiter = "{", endDelimiter = "}"): string {
  if (!text) return "";
  if (!values) return text;

  let result = text;
  // Regex to match anything inside startDelimiter and endDelimiter
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
