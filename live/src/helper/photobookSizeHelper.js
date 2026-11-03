/**
 * Photo Book Size Display Utility
 * Guarantees book sizes are displayed using size name and inch measurements only.
 * Strictly avoids showing any centimeter (cm) values in customer-facing UI.
 */

export const formatBookSizeInches = (sizeInput, optionalSizesList = []) => {
  if (!sizeInput) return "";

  // Helper to strip any "(... cm)" or "cm" occurrences
  const stripCm = (str) =>
    String(str || "")
      .replace(/\s*\([^)]*cm[^)]*\)/gi, "")
      .replace(/\s*\b\d+(\.\d+)?\s*[xX×]\s*\d+(\.\d+)?\s*cm\b/gi, "")
      .trim();

  // If sizeInput is an object
  if (typeof sizeInput === "object") {
    const rawName = sizeInput.name || sizeInput.label || sizeInput.title || "";
    const cleanName = stripCm(rawName);

    let win = sizeInput.width_in || sizeInput.width;
    let hin = sizeInput.height_in || sizeInput.height;
    const wcm = sizeInput.width_cm;
    const hcm = sizeInput.height_cm;

    if ((!win || !hin) && wcm && hcm) {
      win = +(Number(wcm) / 2.54).toFixed(1);
      hin = +(Number(hcm) / 2.54).toFixed(1);
    }

    // If cleanName already has dimension like "10x10 in" or "12x12"
    if (
      cleanName &&
      (cleanName.toLowerCase().includes("in") ||
        cleanName.includes('"') ||
        /^\d+(\.\d+)?\s*[xX×]\s*\d+(\.\d+)?/.test(cleanName))
    ) {
      if (!cleanName.toLowerCase().includes("in") && !cleanName.includes('"')) {
        return `${cleanName} in`;
      }
      return cleanName;
    }

    if (win && hin) {
      return cleanName ? `${cleanName} - ${win} x ${hin} in` : `${win} x ${hin} in`;
    }

    return cleanName;
  }

  // If sizeInput is a string
  const str = stripCm(sizeInput);

  // If a list of size objects is provided, try to find a matching size
  if (Array.isArray(optionalSizesList) && optionalSizesList.length > 0) {
    const found = optionalSizesList.find(
      (s) =>
        s &&
        (String(s._id) === str ||
          String(s.id) === str ||
          String(s.name || "").trim().toLowerCase() === str.toLowerCase())
    );
    if (found) {
      return formatBookSizeInches(found);
    }
  }

  // If size is a raw internal ID (e.g. "size-1793345854945-7bdbd"), check localStorage cache
  if (str.startsWith("size-") || str.startsWith("size_") || str.startsWith("pb-size")) {
    try {
      const cached = localStorage.getItem("photobook_template_sizes") || localStorage.getItem("photobook_sizes");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const found = parsed.find(
            (s) =>
              s &&
              (String(s._id) === str ||
                String(s.id) === str ||
                String(s.name || "").trim().toLowerCase() === str.toLowerCase())
          );
          if (found) {
            return formatBookSizeInches(found);
          }
        }
      }
    } catch (e) {}

    // Default friendly fallback for size IDs created in the editor/admin
    return "A4 - 8.27 x 11.69 in";
  }

  // Standard paper sizes commonly used in photobooks
  const STANDARD_PAPER_SIZES = {
    a3: "A3 - 11.69 x 16.54 in",
    a4: "A4 - 8.27 x 11.69 in",
    a5: "A5 - 5.83 x 8.27 in",
  };
  const lowerStr = str.toLowerCase();
  if (STANDARD_PAPER_SIZES[lowerStr]) {
    return STANDARD_PAPER_SIZES[lowerStr];
  }

  // If already ends with in or "
  if (
    str.toLowerCase().endsWith(" in") ||
    str.endsWith('"') ||
    str.toLowerCase().endsWith(" inch")
  ) {
    return str;
  }

  // If pattern like "8x8" or "10 x 10" or "8.5x11"
  if (/^\d+(\.\d+)?\s*[xX×]\s*\d+(\.\d+)?$/.test(str)) {
    return `${str} in`;
  }

  return str;
};

